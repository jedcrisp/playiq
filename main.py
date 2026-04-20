"""
Uvicorn entrypoint from the repository root.

    pip install -r requirements.txt
    uvicorn main:app --reload

The FastAPI application lives in ``backend.app.main``; this module re-exports ``app``.
"""

from backend.app.main import app

__all__ = ["app"]
