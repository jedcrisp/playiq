"""Recommendation orchestration and validation."""

from __future__ import annotations

from typing import Any

from .concept_packs import (
    COVER2_MIKE_WEAKNESS,
    COVER3_ROTATION_WEAKNESS,
    DEFAULT_PROGRESSION,
    MAN_WEAK_DB,
)
from .extended_packs import (
    COVER6_FAMILY,
    FIRE_ZONE_FAMILY,
    MATCH_AND_PALMS,
    ROTATION_HEAVY,
    TWO_MAN_ROBBER,
)
from .matching import matches_rule
from .models import ConceptPlan, Rule
from .options import INPUT_OPTIONS
from .rules import RULES
from .style_hints import style_appendix

# Same three installs can apply; rotating by front surfaces different #1 emphasis for film review.
_FRONT_RANK_SHIFT: dict[str, int] = {
    "4-3": 0,
    "3-4": 1,
    "4-2-5": 2,
    "3-3-5": 3,
    "Multiple / Hybrid": 1,
}


def _reorder_concepts_for_defensive_front(
    concepts: list[ConceptPlan],
    defensive_front: str,
) -> list[ConceptPlan]:
    if len(concepts) < 2:
        return concepts
    shift = _FRONT_RANK_SHIFT.get(defensive_front.strip(), 0) % len(concepts)
    if shift == 0:
        return concepts
    return concepts[shift:] + concepts[:shift]


def _default_pack(payload: dict[str, str]) -> tuple[ConceptPlan, ConceptPlan, ConceptPlan]:
    coverage = payload.get("coverage_shell", "")
    if coverage in ("Cover 3", "Tampa 2"):
        return COVER3_ROTATION_WEAKNESS[:3]
    if coverage == "Cover 2":
        return COVER2_MIKE_WEAKNESS[:3]
    if coverage in ("Cover 1", "Man Free"):
        return MAN_WEAK_DB[:3]
    if coverage in ("Match Quarters", "Palms"):
        return MATCH_AND_PALMS[:3]
    if coverage == "Cover 6":
        return COVER6_FAMILY[:3]
    if coverage in ("2-Man", "Robber"):
        return TWO_MAN_ROBBER[:3]
    if coverage == "Fire Zone":
        return FIRE_ZONE_FAMILY[:3]
    if coverage == "Mixed / Rotation-heavy":
        return ROTATION_HEAVY[:3]
    return DEFAULT_PROGRESSION[:3]


def _strategic_summary(
    normalized: dict[str, str],
    matched_rule_name: str,
    lead: ConceptPlan,
) -> str:
    df = normalized.get("defensive_front", "").strip() or "declared structure"
    cov = normalized.get("coverage_shell", "this shell")
    pr = normalized.get("pressure_tendency", "mixed pressure")
    defender = normalized.get("defender_to_attack", "the conflict defender")
    wk = normalized.get("weakness_type", "declared weakness")
    st = normalized.get("offensive_style", "your system")
    return (
        f"Front structure: {df}. Primary stress: {defender} ({wk}) vs {cov} with {pr} tendencies. "
        f"Lead call: {lead.concept}, sequenced for {st} tempo and answers. "
        f"Engine route: {matched_rule_name.replace('_', ' ')}."
    )


def _serialize_concept(c: ConceptPlan, rank: int, coaching_text: str) -> dict[str, Any]:
    return {
        "rank": rank,
        "concept": c.concept,
        "why_it_works": c.why_it_works,
        "stresses_defender": c.stresses_defender,
        "space_leverage": c.space_leverage,
        "ideal_down_distance": c.ideal_down_distance,
        "formation": c.formation,
        "motion": c.motion,
        "likely_defensive_adjustment": c.expected_adjustment,
        "expected_adjustment": c.expected_adjustment,
        "counter": c.counter,
        "counter_recommendation": c.counter,
        "coaching_point": coaching_text,
        "coaching_note": coaching_text,
    }


def recommend(payload: dict[str, str]) -> dict[str, Any]:
    """Return top three concept plans from highest-priority matching rule."""
    normalized = {k: payload.get(k, "") for k in INPUT_OPTIONS}

    matched: list[tuple[int, Rule]] = []
    for rule in RULES:
        if matches_rule(rule, normalized):
            matched.append((rule.priority, rule))

    matched_rule_name = "default_pack"
    if matched:
        matched.sort(key=lambda x: x[0], reverse=True)
        top_priority = matched[0][0]
        best = next(r for p, r in matched if p == top_priority)
        matched_rule_name = best.name
        concepts = list(best.concepts[:3])
    else:
        concepts = list(_default_pack(normalized))

    concepts = _reorder_concepts_for_defensive_front(
        concepts,
        normalized.get("defensive_front", ""),
    )

    style = normalized.get("offensive_style", "Balanced")
    appendix = style_appendix(style)
    serialized: list[dict[str, Any]] = []
    enriched_plans: list[ConceptPlan] = []
    for c in concepts:
        coach_text = f"{c.coaching_point} System fit: {appendix}"
        enriched_plans.append(
            ConceptPlan(
                concept=c.concept,
                why_it_works=c.why_it_works,
                stresses_defender=c.stresses_defender,
                space_leverage=c.space_leverage,
                ideal_down_distance=c.ideal_down_distance,
                formation=c.formation,
                motion=c.motion,
                expected_adjustment=c.expected_adjustment,
                counter=c.counter,
                coaching_point=coach_text,
            )
        )

    for idx, c in enumerate(enriched_plans):
        serialized.append(_serialize_concept(c, idx + 1, c.coaching_point))

    lead = enriched_plans[0] if enriched_plans else concepts[0]
    strategic = _strategic_summary(normalized, matched_rule_name, lead)

    return {
        "matched_rule": matched_rule_name,
        "strategic_summary": strategic,
        "recommendations": serialized,
    }


def validate_payload(payload: dict[str, str]) -> list[str]:
    """Return human-readable validation issues; empty if OK."""
    issues: list[str] = []
    for key, allowed in INPUT_OPTIONS.items():
        val = payload.get(key, "")
        if not val:
            issues.append(f"Missing required field: {key}")
        elif val not in allowed:
            issues.append(f"Invalid value for {key}: {val}")
    return issues
