"""Claude-powered cost recommendations and ad-hoc chat over the ingested cost data.

Requires ANTHROPIC_API_KEY in the environment. All functions return None /
raise a clear RuntimeError if no key is configured, so the caller can show a
"set your API key" message instead of crashing.
"""
from __future__ import annotations

import os
from collections.abc import Generator

import anthropic

MODEL = "claude-opus-4-8"

SYSTEM_PROMPT = """You are a FinOps analyst reviewing AWS cloud cost data that has \
already been aggregated for you. Give concrete, specific recommendations tied to \
the numbers you're given - name the service, account, or tag that's driving the \
finding, not generic cloud cost advice. Structure recommendations as: finding, \
estimated impact, suggested action. Keep it concise."""


def is_configured() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY"))


def _client() -> anthropic.Anthropic:
    if not is_configured():
        raise RuntimeError("ANTHROPIC_API_KEY is not set")
    return anthropic.Anthropic()


def generate_recommendations(cost_summary_markdown: str) -> Generator[str, None, None]:
    """Stream a markdown recommendations report for the given cost summary."""
    client = _client()
    with client.messages.stream(
        model=MODEL,
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": (
                    "Here is a summary of our AWS cost data:\n\n"
                    f"{cost_summary_markdown}\n\n"
                    "Give me prioritized cost optimization recommendations."
                ),
            }
        ],
    ) as stream:
        yield from stream.text_stream


def chat(cost_summary_markdown: str, history: list[dict], question: str) -> Generator[str, None, None]:
    """Stream an answer to an ad-hoc question, grounded in the cost summary + chat history."""
    client = _client()
    messages = [
        {
            "role": "user",
            "content": (
                "Here is a summary of our AWS cost data for reference in this "
                f"conversation:\n\n{cost_summary_markdown}"
            ),
        },
        {"role": "assistant", "content": "Understood. Ask me anything about this cost data."},
        *history,
        {"role": "user", "content": question},
    ]
    with client.messages.stream(
        model=MODEL,
        max_tokens=2048,
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        yield from stream.text_stream
