from __future__ import annotations

import os
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


def _normalize_database_url(url: str) -> str:
    """Railway/Heroku/Render often set postgres:// or postgresql://; we use psycopg3."""
    if "+psycopg" in url.split("://", 1)[0]:
        return url
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


def _resolve_database_url() -> str:
    # Empty string counts as unset (Railway/UI sometimes stores DATABASE_URL="" which bypasses getenv default).
    raw = (os.getenv("DATABASE_URL") or "").strip()
    if raw:
        return _normalize_database_url(raw)
    if os.getenv("RAILWAY_ENVIRONMENT"):
        raise RuntimeError(
            "DATABASE_URL is missing or empty. In Railway: open your API service → Variables → "
            "add DATABASE_URL and Reference the Postgres plugin's DATABASE_URL (or paste the connection string)."
        )
    return _normalize_database_url("postgresql+psycopg://presnap:presnap@localhost:5432/presnap")


DATABASE_URL = _resolve_database_url()

engine = create_engine(DATABASE_URL, future=True, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

