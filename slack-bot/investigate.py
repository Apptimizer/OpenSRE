"""Drive sre-agent SSE from a Slack thread."""

import asyncio
import logging
from typing import Any

import aiohttp

from config import Config
from text import (
    error_text,
    parse_sse_data,
    progress_line,
    question_lines,
    result_text,
    with_run_link,
)

logger = logging.getLogger(__name__)

# Agent wall clock on this cluster is 1800s. Stay above that.
SSE_TIMEOUT = aiohttp.ClientTimeout(total=2100, sock_connect=30)
UPDATE_INTERVAL_SECONDS = 2.0


def _headers(cfg: Config) -> dict[str, str]:
    headers = {"Accept": "text/event-stream"}
    if cfg.auth_token:
        headers["Authorization"] = f"Bearer {cfg.auth_token}"
    return headers


async def submit_answer(cfg: Config, thread_id: str, text: str) -> bool:
    url = f"{cfg.agent_url.rstrip('/')}/answer"
    payload = {"thread_id": thread_id, "answers": {"question_0": text}}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=_headers(cfg)) as resp:
                if resp.status >= 400:
                    logger.warning("answer failed: %s", resp.status)
                    return False
                return True
    except aiohttp.ClientError:
        logger.exception("answer request failed")
        return False


async def queue_message(cfg: Config, thread_id: str, text: str) -> bool:
    url = f"{cfg.agent_url.rstrip('/')}/threads/{thread_id}/queue-message"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url, json={"text": text}, headers=_headers(cfg)
            ) as resp:
                return resp.status < 400
    except aiohttp.ClientError:
        logger.exception("queue-message failed")
        return False


class InvestigationHub:
    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg
        self.active: set[str] = set()
        self.pending: set[str] = set()
        self._tasks: set[asyncio.Task] = set()

    async def handle(
        self,
        *,
        client: Any,
        channel: str,
        parent_ts: str,
        thread_id: str,
        text: str,
        user: str,
    ) -> None:
        if thread_id in self.pending:
            ok = await submit_answer(self.cfg, thread_id, text)
            notice = "Got it, continuing." if ok else "Could not send that answer."
            await client.chat_postMessage(
                channel=channel, thread_ts=parent_ts, text=notice
            )
            if ok:
                self.pending.discard(thread_id)
            return
        if thread_id in self.active:
            ok = await queue_message(self.cfg, thread_id, text)
            notice = (
                "Added to the investigation."
                if ok
                else "Still working on the last request in this thread."
            )
            await client.chat_postMessage(
                channel=channel, thread_ts=parent_ts, text=notice
            )
            return
        task = asyncio.create_task(
            self._run(
                client=client,
                channel=channel,
                parent_ts=parent_ts,
                thread_id=thread_id,
                text=text,
                user=user,
            )
        )
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    async def _run(
        self,
        *,
        client: Any,
        channel: str,
        parent_ts: str,
        thread_id: str,
        text: str,
        user: str,
    ) -> None:
        self.active.add(thread_id)
        run_id: str | None = None
        final: str | None = None
        failure: str | None = None
        last_update = 0.0
        status_ts = ""
        try:
            posted = await client.chat_postMessage(
                channel=channel, thread_ts=parent_ts, text="Looking into this…"
            )
            status_ts = posted["ts"]
            actor = await _display_name(client, user)
            url = f"{self.cfg.agent_url.rstrip('/')}/investigate"
            payload: dict[str, str] = {
                "prompt": text,
                "thread_id": thread_id,
                "trigger_source": "slack",
            }
            if actor:
                payload["trigger_actor"] = actor
            async with aiohttp.ClientSession(timeout=SSE_TIMEOUT) as session:
                async with session.post(
                    url, json=payload, headers=_headers(self.cfg)
                ) as resp:
                    if resp.status >= 400:
                        body = await resp.text()
                        failure = f"Agent returned {resp.status}: {body[:300]}"
                    else:
                        buffer = ""
                        async for raw in resp.content.iter_any():
                            buffer += raw.decode("utf-8", errors="replace")
                            while "\n" in buffer:
                                line, buffer = buffer.split("\n", 1)
                                event = parse_sse_data(line)
                                if not event:
                                    continue
                                run_id, final, failure, last_update = await self._apply(
                                    event,
                                    client=client,
                                    channel=channel,
                                    status_ts=status_ts,
                                    thread_id=thread_id,
                                    run_id=run_id,
                                    final=final,
                                    failure=failure,
                                    last_update=last_update,
                                )
        except TimeoutError:
            logger.exception("SSE timed out for %s", thread_id)
            failure = failure or "Timed out waiting for the agent."
        except aiohttp.ClientError:
            logger.exception("SSE failed for %s", thread_id)
            failure = failure or "Could not reach the agent."
        except Exception:
            logger.exception("investigation failed for %s", thread_id)
            failure = failure or "Investigation failed."
        finally:
            self.active.discard(thread_id)
            self.pending.discard(thread_id)
        if not status_ts:
            return
        body = failure or final or "Finished with no summary."
        await _update(
            client,
            channel,
            status_ts,
            with_run_link(body, self.cfg.web_ui, run_id),
        )

    async def _apply(
        self,
        event: dict,
        *,
        client: Any,
        channel: str,
        status_ts: str,
        thread_id: str,
        run_id: str | None,
        final: str | None,
        failure: str | None,
        last_update: float,
    ) -> tuple[str | None, str | None, str | None, float]:
        data = event.get("data") if isinstance(event.get("data"), dict) else {}
        if event.get("type") == "run_started" and data.get("run_id"):
            run_id = str(data["run_id"])
        found = result_text(event)
        if found:
            final = found
        err = error_text(event)
        if err:
            failure = err
        questions = question_lines(event)
        if questions:
            self.pending.add(thread_id)
            await _update(
                client,
                channel,
                status_ts,
                "I need an answer in this thread:\n" + "\n".join(questions),
            )
            return run_id, final, failure, asyncio.get_running_loop().time()
        line = progress_line(event)
        now = asyncio.get_running_loop().time()
        if line and now - last_update >= UPDATE_INTERVAL_SECONDS:
            await _update(client, channel, status_ts, line)
            last_update = now
        return run_id, final, failure, last_update


async def _display_name(client: Any, user_id: str) -> str:
    if not user_id:
        return ""
    try:
        info = await client.users_info(user=user_id)
        user = info.get("user") or {}
        profile = user.get("profile") or {}
        name = profile.get("real_name") or user.get("name") or user_id
        return str(name)[:128]
    except Exception:
        logger.debug("users.info failed", exc_info=True)
        return user_id[:128]


async def _update(client: Any, channel: str, ts: str, text: str) -> None:
    try:
        await client.chat_update(channel=channel, ts=ts, text=text)
    except Exception:
        logger.exception("chat.update failed")
