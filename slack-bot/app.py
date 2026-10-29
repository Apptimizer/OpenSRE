"""Socket Mode entrypoint. Slack connects outbound; no public Request URL."""

import asyncio
import logging
import sys

from aiohttp import web
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler
from slack_bolt.async_app import AsyncApp

from config import Config
from investigate import InvestigationHub
from text import should_ignore, strip_mention, thread_id

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def create_app(cfg: Config) -> AsyncApp:
    app = AsyncApp(token=cfg.bot_token)
    hub = InvestigationHub(cfg)

    @app.event("app_mention")
    async def on_mention(event, client):
        await _handle(event, client, hub)

    @app.event("message")
    async def on_message(event, client):
        # Channel messages also arrive as app_mention. DMs do not.
        if event.get("channel_type") != "im":
            return
        await _handle(event, client, hub)

    return app


async def _handle(event: dict, client, hub: InvestigationHub) -> None:
    if should_ignore(event):
        return
    text = strip_mention(event.get("text") or "")
    if not text:
        return
    channel = event.get("channel") or ""
    parent = event.get("thread_ts") or event.get("ts") or ""
    if not channel or not parent:
        return
    await hub.handle(
        client=client,
        channel=channel,
        parent_ts=parent,
        thread_id=thread_id(channel, parent),
        text=text,
        user=event.get("user") or "",
    )


async def _health(_request: web.Request) -> web.Response:
    return web.Response(text="ok")


async def main() -> None:
    cfg = Config()
    if not cfg.is_configured():
        logger.warning(
            "SLACK_BOT_TOKEN / SLACK_APP_TOKEN not set — slack-bot exiting"
        )
        sys.exit(0)

    health = web.Application()
    health.router.add_get("/health", _health)
    runner = web.AppRunner(health)
    await runner.setup()
    await web.TCPSite(runner, "0.0.0.0", cfg.port).start()

    handler = AsyncSocketModeHandler(create_app(cfg), cfg.app_token)
    logger.info("Starting OpenSRE slack-bot on port %s", cfg.port)
    await handler.start_async()


if __name__ == "__main__":
    asyncio.run(main())
