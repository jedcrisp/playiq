from __future__ import annotations

import json
import os
from urllib import request


class AIService:
    def __init__(self) -> None:
        self.provider = os.getenv("AI_PROVIDER", "openai")
        self.api_key = os.getenv("AI_API_KEY", "")
        self.model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")

    def generate(self, prompt: str, *, fallback_hint: str = "") -> tuple[str, str]:
        if self.provider == "openai" and self.api_key:
            try:
                return self._openai_completion(prompt), self.model
            except Exception:
                pass
        return self._fallback_response(prompt, fallback_hint), "mock-local"

    def _openai_completion(self, prompt: str) -> str:
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
        }
        req = request.Request(
            f"{self.base_url.rstrip('/')}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            },
            method="POST",
        )
        with request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()

    def _fallback_response(self, prompt: str, fallback_hint: str) -> str:
        hint = fallback_hint or "Use the structured recommendations as primary guidance."
        return (
            "AI provider is not configured, so this is a local fallback summary.\n\n"
            f"- {hint}\n"
            "- Anchor calls to the top deterministic concepts first.\n"
            "- Emphasize leverage, spacing, and defender conflict in install periods.\n"
            "- Carry one counter for the likely defensive adjustment.\n"
            "\nTo enable full AI responses, set AI_API_KEY (and optionally AI_MODEL/AI_BASE_URL)."
        )

