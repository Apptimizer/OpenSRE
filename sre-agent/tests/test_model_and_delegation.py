"""Tests for Anthropic model resolution and the delegation-prompt addendum."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from config import build_delegation_addendum, resolve_model


def test_resolve_model_aliases_pass_through():
    for alias in ("inherit", "sonnet", "opus", "haiku"):
        assert resolve_model(alias) == alias


def test_resolve_model_claude_id_passes_through():
    assert resolve_model("claude-opus-4-8") == "claude-opus-4-8"


def test_resolve_model_openai_falls_back_to_inherit(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_BASE_URL", raising=False)
    assert resolve_model("gpt-5.2") == "inherit"
    assert resolve_model("o3-mini") == "inherit"


def test_resolve_model_passes_any_name_behind_proxy(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_BASE_URL", "http://litellm:4000")
    assert resolve_model("gpt-5") == "gpt-5"
    assert resolve_model("gemini-2.5-pro") == "gemini-2.5-pro"
    assert resolve_model("") == "inherit"


def test_resolve_model_direct_anthropic_url_keeps_fallback(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_BASE_URL", "https://api.anthropic.com/")
    assert resolve_model("gpt-5") == "inherit"
    monkeypatch.delenv("ANTHROPIC_BASE_URL")
    assert resolve_model("gpt-5") == "inherit"


def test_resolve_model_empty_or_none_is_inherit():
    assert resolve_model("") == "inherit"
    assert resolve_model(None) == "inherit"


def test_delegation_addendum_lists_agents_sorted():
    out = build_delegation_addendum(["github", "coding", "writeup"])
    assert "## AVAILABLE SUB-AGENTS" in out
    assert "coding, github, writeup" in out  # sorted


def test_delegation_addendum_empty_when_no_agents():
    assert build_delegation_addendum([]) == ""
