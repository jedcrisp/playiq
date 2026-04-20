from __future__ import annotations

import os
from collections.abc import Generator
from urllib.parse import quote_plus

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


def _first_env_url(*names: str) -> str:
    for name in names:
        raw = (os.getenv(name) or "").strip()
        if raw:
            return raw
    return ""


def _url_from_pg_parts() -> str | None:
    """Build URL when Railway (or others) expose PG* vars but not a single connection string."""
    host = (os.getenv("PGHOST") or "").strip()
    port = (os.getenv("PGPORT") or "").strip() or "5432"
    user = (os.getenv("PGUSER") or "").strip()
    password = (os.getenv("PGPASSWORD") or os.getenv("POSTGRES_PASSWORD") or "").strip()
    database = (os.getenv("PGDATABASE") or "").strip()
    if not (host and user and password and database):
        return None
    user_q = quote_plus(user)
    pass_q = quote_plus(password)
    return f"postgresql+psycopg://{user_q}:{pass_q}@{host}:{port}/{database}"


def _resolve_database_url() -> str:
    # Empty string counts as unset (Railway/UI sometimes stores DATABASE_URL="" which bypasses getenv default).
    raw = _first_env_url(
        "DATABASE_URL",
        "POSTGRES_URL",
        "DATABASE_PUBLIC_URL",
    )
    if raw:
        return _normalize_database_url(raw)
    built = _url_from_pg_parts()
    if built:
        return built
    if os.getenv("RAILWAY_ENVIRONMENT"):
        raise RuntimeError(
            "No database URL found. In Railway: open your **API** service → Variables → add "
            "`DATABASE_URL` → **Reference** → your Postgres service → `DATABASE_URL` "
            "(value looks like postgresql://...@...railway.internal:5432/...). "
            "Or paste that connection string. Remove any empty `DATABASE_URL` row."
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

