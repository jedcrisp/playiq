"""
PlayIQ FastAPI application.
Run from repo root: uvicorn backend.app.main:app --reload --port 8000
Or from backend/: uvicorn app.main:app --reload --port 8000
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Repo root (parent of backend/)
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from recommendation_engine import INPUT_OPTIONS, recommend, validate_payload

from .database import Base, engine
from .routes import (
    ai_router,
    analytics_router,
    auth_router,
    diagrams_router,
    formation_intelligence_router,
    gameplans_router,
    notes_router,
    opponents_router,
    scouting_router,
    scripts_router,
    situations_router,
    teams_router,
)
from .schemas import ConceptResponse, RecommendRequest, RecommendResponse

_DEFAULT_LOCAL_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]


def _cors_origins() -> list[str]:
    """Merge local dev origins with CORS_ALLOW_ORIGINS (comma-separated, e.g. Vercel production URL)."""
    extra = os.getenv("CORS_ALLOW_ORIGINS", "")
    out = list(_DEFAULT_LOCAL_ORIGINS)
    for part in extra.split(","):
        origin = part.strip()
        if origin and origin not in out:
            out.append(origin)
    return out


def _cors_origin_regex() -> str | None:
    """Localhost any-port, plus optional extra pattern (e.g. https://.*\\.vercel\\.app)."""
    base = r"http://(localhost|127\.0\.0\.1):\d+"
    extra = (os.getenv("CORS_ALLOW_ORIGIN_REGEX") or "").strip()
    if extra:
        return f"({base})|({extra})"
    return base


app = FastAPI(
    title="PlayIQ API",
    description="Rule-based offensive planning for football coaches",
    version="0.1.0",
)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "playiq"}


@app.get("/api/options")
def api_options() -> dict[str, list[str]]:
    return INPUT_OPTIONS


@app.post("/api/recommend", response_model=RecommendResponse)
def api_recommend(body: RecommendRequest) -> RecommendResponse:
    payload = body.model_dump()
    issues = validate_payload(payload)
    if issues:
        raise HTTPException(status_code=400, detail={"errors": issues})

    raw = recommend(payload)
    recs = [ConceptResponse(**r) for r in raw["recommendations"]]
    return RecommendResponse(
        matched_rule=raw["matched_rule"],
        strategic_summary=raw.get("strategic_summary", ""),
        recommendations=recs,
    )


app.include_router(auth_router)
app.include_router(teams_router)
app.include_router(gameplans_router)
app.include_router(opponents_router)
app.include_router(diagrams_router)
app.include_router(notes_router)
app.include_router(ai_router)
app.include_router(scouting_router)
app.include_router(analytics_router)
app.include_router(formation_intelligence_router)
app.include_router(scripts_router)
app.include_router(situations_router)
