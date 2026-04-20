"""Rule matching against normalized user input."""

from __future__ import annotations

from .models import Rule


def matches_rule(rule: Rule, payload: dict[str, str]) -> bool:
    for key, expected in rule.match.items():
        actual = payload.get(key, "")
        if expected is None:
            continue
        if isinstance(expected, list):
            if actual not in expected:
                return False
        elif actual != expected:
            return False
    return True
