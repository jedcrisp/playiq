"""
Concept constructors and reusable install language.
Use ``make()`` so legacy packs stay terse while Phase 3 fields stay populated.
"""

from __future__ import annotations

from .models import ConceptPlan


def make(
    concept: str,
    why_it_works: str,
    formation: str,
    motion: str,
    expected_adjustment: str,
    counter: str,
    coaching_point: str | None = None,
    *,
    coaching_note: str | None = None,
    stresses_defender: str | None = None,
    space_leverage: str | None = None,
    ideal_down_distance: str | None = None,
) -> ConceptPlan:
    """Build a ConceptPlan; ``coaching_note`` is an alias for ``coaching_point``."""
    coach = coaching_point if coaching_point is not None else (coaching_note or "")
    sd = stresses_defender or (
        "Stresses the tagged matchup defender and the first responder who helps him."
    )
    sl = space_leverage or (
        "Attacks leverage voids—width, intermediate windows, and soft edges based on shell."
    )
    dd = ideal_down_distance or (
        "1st–3rd & 4–10 (situation-dependent: move to quick game on obvious passing downs)."
    )
    return ConceptPlan(
        concept=concept,
        why_it_works=why_it_works,
        stresses_defender=sd,
        space_leverage=sl,
        ideal_down_distance=dd,
        formation=formation,
        motion=motion,
        expected_adjustment=expected_adjustment,
        counter=counter,
        coaching_point=coach,
    )
