"""
PlayIQ recommendation engine (rule-based).

Public API for the FastAPI layer and tests.
"""

from __future__ import annotations

from .engine import recommend, validate_payload
from .options import INPUT_OPTIONS

__all__ = ["INPUT_OPTIONS", "recommend", "validate_payload"]
