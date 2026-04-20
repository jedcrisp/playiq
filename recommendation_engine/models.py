"""Domain models for rule-based recommendations."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ConceptPlan:
    """One installable concept with coaching context (Phase 3 expanded fields)."""

    concept: str
    why_it_works: str
    stresses_defender: str
    space_leverage: str
    ideal_down_distance: str
    formation: str
    motion: str
    expected_adjustment: str
    counter: str
    coaching_point: str


@dataclass(frozen=True)
class Rule:
    """Higher priority wins on ties; first registered wins at same priority."""

    name: str
    priority: int
    match: dict[str, str | list[str] | None]  # None = wildcard
    concepts: tuple[ConceptPlan, ...]
