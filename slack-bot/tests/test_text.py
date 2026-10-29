from text import (
    error_text,
    parse_sse_data,
    progress_line,
    question_lines,
    result_text,
    run_link,
    should_ignore,
    strip_mention,
    thread_id,
    truncate,
    with_run_link,
)


def test_strip_mention():
    assert strip_mention("<@U123> check production") == "check production"
    assert strip_mention("  ") == ""


def test_thread_id_is_stable():
    assert thread_id("C0123", "1712.345") == "slack-c0123-1712-345"


def test_ignore_bot_and_edits():
    assert should_ignore({"bot_id": "B1", "text": "hi"})
    assert should_ignore({"subtype": "message_changed", "text": "hi"})
    assert not should_ignore({"text": "hi", "user": "U1"})


def test_parse_sse_and_progress():
    event = parse_sse_data('data: {"type": "tool_start", "data": {"name": "Bash"}}')
    assert event is not None
    assert progress_line(event) == "Running Bash…"
    assert parse_sse_data("not sse") is None


def test_result_error_and_question():
    assert result_text({"type": "result", "data": {"text": "done"}}) == "done"
    assert error_text({"type": "error", "data": {"message": "boom"}}) == "boom"
    lines = question_lines(
        {"type": "question", "data": {"questions": [{"question": "Which cluster?"}]}}
    )
    assert lines == ["Which cluster?"]


def test_run_link_and_truncate():
    assert run_link("https://opensre.example", "abc") == (
        "https://opensre.example/team/agent-runs/abc"
    )
    assert run_link("", "abc") is None
    linked = with_run_link("summary", "https://opensre.example", "abc")
    assert linked.endswith("<https://opensre.example/team/agent-runs/abc|View in OpenSRE>")
    assert truncate("x" * 20, limit=10).endswith("…")
