"""Slack text helpers. No network."""

import json
import re

_MENTION = re.compile(r"<@[A-Z0-9]+>")
_NON_ALNUM = re.compile(r"[^a-zA-Z0-9]+")
_SKIP_SUBTYPES = frozenset({"bot_message", "message_changed", "message_deleted"})


def strip_mention(text: str) -> str:
    return _MENTION.sub("", text or "").strip()


def thread_id(channel: str, parent_ts: str) -> str:
    raw = f"{channel}-{parent_ts}"
    cleaned = _NON_ALNUM.sub("-", raw.lower()).strip("-")[:220]
    return f"slack-{cleaned or 'unknown'}"


def parse_sse_data(line: str) -> dict | None:
    line = line.strip()
    if not line.startswith("data: "):
        return None
    try:
        payload = json.loads(line[6:])
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def progress_line(event: dict) -> str | None:
    kind = event.get("type")
    data = event.get("data") if isinstance(event.get("data"), dict) else {}
    if kind == "run_started":
        return "Starting investigation…"
    if kind == "thought":
        text = str(data.get("text") or "").strip()
        if not text:
            return None
        return text.splitlines()[0][:300]
    if kind == "tool_start":
        name = str(data.get("name") or "tool")
        return f"Running {name}…"
    return None


def result_text(event: dict) -> str | None:
    if event.get("type") != "result":
        return None
    data = event.get("data") if isinstance(event.get("data"), dict) else {}
    return str(data.get("text") or "").strip()


def error_text(event: dict) -> str | None:
    if event.get("type") != "error":
        return None
    data = event.get("data") if isinstance(event.get("data"), dict) else {}
    return str(data.get("message") or "Investigation failed").strip()


def question_lines(event: dict) -> list[str]:
    if event.get("type") != "question":
        return []
    data = event.get("data") if isinstance(event.get("data"), dict) else {}
    questions = data.get("questions") or []
    lines: list[str] = []
    for item in questions:
        if isinstance(item, str) and item.strip():
            lines.append(item.strip())
        elif isinstance(item, dict):
            text = str(item.get("question") or item.get("text") or "").strip()
            if text:
                lines.append(text)
    return lines


def run_link(base_url: str, run_id: str) -> str | None:
    base = (base_url or "").strip().rstrip("/")
    rid = (run_id or "").strip()
    if not base or not rid:
        return None
    return f"{base}/team/agent-runs/{rid}"


def truncate(text: str, limit: int = 3500) -> str:
    body = (text or "").strip() or "Finished with no summary."
    if len(body) <= limit:
        return body
    return body[: limit - 1].rstrip() + "…"


def with_run_link(body: str, base_url: str, run_id: str | None) -> str:
    url = run_link(base_url, run_id or "")
    if not url:
        return truncate(body)
    suffix = f"\n<{url}|View in OpenSRE>"
    return truncate(body, 3500 - len(suffix)) + suffix


def should_ignore(event: dict) -> bool:
    if event.get("bot_id"):
        return True
    subtype = event.get("subtype")
    return isinstance(subtype, str) and subtype in _SKIP_SUBTYPES
