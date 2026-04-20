"""Firebase Cloud Functions (2nd gen) — recommendations + AI (replaces FastAPI/Railway for these paths)."""

from __future__ import annotations

import json
import os
import time
from typing import Any
from urllib import error as urlerror
from urllib import request as urlrequest

from firebase_admin import firestore, initialize_app
from firebase_functions import https_fn

from prompts import build_chat_prompt, build_gameplan_summary_prompt, build_matchup_analysis_prompt
from recommendation_engine import recommend, validate_payload

try:
    initialize_app()
except ValueError:
    pass

_REGION = os.getenv("FUNCTIONS_REGION") or "us-central1"


def _require_auth(req: https_fn.CallableRequest) -> str:
    if req.auth is None:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.UNAUTHENTICATED,
            message="Sign in required.",
        )
    return req.auth.uid


def _ai_generate(prompt: str, *, fallback_hint: str = "") -> tuple[str, str]:
    api_key = (os.getenv("AI_API_KEY") or "").strip()
    model = (os.getenv("AI_MODEL") or "gpt-4o-mini").strip()
    base = (os.getenv("AI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")
    if api_key:
        try:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            }
            req = urlrequest.Request(
                f"{base}/chat/completions",
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            with urlrequest.urlopen(req, timeout=55) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            text = data["choices"][0]["message"]["content"].strip()
            return text, model
        except (urlerror.URLError, urlerror.HTTPError, KeyError, json.JSONDecodeError, TimeoutError):
            pass
    hint = fallback_hint or "Use the structured recommendations as primary guidance."
    return (
        "AI provider is not configured or the request failed, so this is a local fallback summary.\n\n"
        f"- {hint}\n"
        "- Anchor calls to the top deterministic concepts first.\n"
        "- Emphasize leverage, spacing, and defender conflict in install periods.\n"
        "- Carry one counter for the likely defensive adjustment.\n"
        "\nTo enable full AI responses, set the AI_API_KEY secret / env var on this Cloud Function.",
        "mock-local",
    )


def _normalize_context(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        return {
            "inputs": {},
            "recommendation": {},
            "gameplan_notes": {},
            "opponent_notes": "",
            "opponent_tendencies": {},
            "opponent_analyst_notes": {},
            "prior_ai_summary": "",
        }
    return {
        "inputs": raw.get("inputs") or {},
        "recommendation": raw.get("recommendation") or {},
        "gameplan_notes": raw.get("gameplan_notes") or {},
        "opponent_notes": raw.get("opponent_notes") or "",
        "opponent_tendencies": raw.get("opponent_tendencies") or {},
        "opponent_analyst_notes": raw.get("opponent_analyst_notes") or {},
        "prior_ai_summary": raw.get("prior_ai_summary") or "",
    }


@https_fn.on_call(region=_REGION)
def api_recommend(req: https_fn.CallableRequest) -> dict[str, Any]:
    _require_auth(req)
    data = req.data
    if not isinstance(data, dict):
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Expected an object payload.",
        )
    issues = validate_payload(data)
    if issues:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message=json.dumps(issues),
        )
    raw = recommend(data)
    return raw


@https_fn.on_call(region=_REGION)
def ai_summary(req: https_fn.CallableRequest) -> dict[str, Any]:
    _require_auth(req)
    data = req.data if isinstance(req.data, dict) else {}
    ctx = _normalize_context(data.get("matchup_context"))
    prompt = build_gameplan_summary_prompt(ctx)
    content, model_name = _ai_generate(prompt, fallback_hint="Generate a tactical gameplan summary.")
    return {"id": None, "content": content, "model_name": model_name, "created_at": None}


@https_fn.on_call(region=_REGION)
def ai_analysis(req: https_fn.CallableRequest) -> dict[str, Any]:
    _require_auth(req)
    data = req.data if isinstance(req.data, dict) else {}
    question = (data.get("question") or "").strip()
    if len(question) < 5:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Question must be at least 5 characters.",
        )
    ctx = _normalize_context(data.get("matchup_context"))
    prompt = build_matchup_analysis_prompt(ctx, question)
    answer, model_name = _ai_generate(prompt, fallback_hint="Answer matchup question with call + counter.")
    return {"id": None, "answer": answer, "model_name": model_name, "created_at": None}


@https_fn.on_call(region=_REGION)
def ai_chat(req: https_fn.CallableRequest) -> dict[str, Any]:
    uid = _require_auth(req)
    data = req.data if isinstance(req.data, dict) else {}
    user_message = (data.get("user_message") or "").strip()
    if len(user_message) < 2:
        raise https_fn.HttpsError(
            code=https_fn.FunctionsErrorCode.INVALID_ARGUMENT,
            message="Message too short.",
        )
    matchup_context = _normalize_context(data.get("matchup_context"))
    history = data.get("history") or []
    if not isinstance(history, list):
        history = []
    session_id = data.get("session_id")
    gameplan_id = data.get("gameplan_id")
    opponent_profile_id = data.get("opponent_profile_id")

    db = firestore.client()
    if session_id:
        sref = db.collection("coaching_sessions").document(str(session_id))
        snap = sref.get()
        if not snap.exists:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.NOT_FOUND,
                message="Chat session not found.",
            )
        sdata = snap.to_dict() or {}
        if sdata.get("owner_uid") != uid:
            raise https_fn.HttpsError(
                code=https_fn.FunctionsErrorCode.PERMISSION_DENIED,
                message="Chat session not found.",
            )
    else:
        sref = db.collection("coaching_sessions").document()
        session_id = sref.id
        sref.set(
            {
                "owner_uid": uid,
                "gameplan_id": gameplan_id,
                "opponent_profile_id": opponent_profile_id,
                "title": "Coaching Assistant",
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            }
        )

    prompt = build_chat_prompt(
        matchup_context,
        [{"role": m.get("role"), "content": m.get("content")} for m in history if isinstance(m, dict)],
        user_message,
    )
    assistant_text, model_name = _ai_generate(
        prompt, fallback_hint="Provide concise tactical coaching answer."
    )

    now = firestore.SERVER_TIMESTAMP
    batch = db.batch()
    um = sref.collection("messages").document()
    batch.set(
        um,
        {
            "owner_uid": uid,
            "role": "user",
            "content": user_message,
            "model_name": "user",
            "created_at": now,
        },
    )
    am = sref.collection("messages").document()
    batch.set(
        am,
        {
            "owner_uid": uid,
            "role": "assistant",
            "content": assistant_text,
            "model_name": model_name,
            "created_at": now,
        },
    )
    batch.update(sref, {"updated_at": now})
    batch.commit()

    ts = int(time.time() * 1000)
    return {
        "session_id": session_id,
        "assistant_message": {
            "id": ts,
            "session_id": session_id,
            "role": "assistant",
            "content": assistant_text,
            "model_name": model_name,
            "created_at": None,
        },
    }
