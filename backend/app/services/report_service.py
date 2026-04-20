from __future__ import annotations

from .analytics_service import (
    coverage_by_down_distance,
    explosive_by_coverage,
    explosive_rate_by_attr,
    pressure_by_field_zone,
    simple_insights,
    success_rate_by_attr,
    top_frequencies,
)


def build_opponent_report(plays):
    return {
        "sample_size": len(plays),
        "front_frequency": top_frequencies(plays, "defensive_front"),
        "coverage_frequency": top_frequencies(plays, "coverage_shell"),
        "pressure_frequency": top_frequencies(plays, "pressure_type"),
        "coverage_by_down_distance": coverage_by_down_distance(plays),
        "pressure_by_field_zone": pressure_by_field_zone(plays),
        "explosive_by_coverage": explosive_by_coverage(plays),
        "success_by_coverage": success_rate_by_attr(plays, "coverage_shell"),
        "insights": simple_insights(plays),
    }


def build_self_scout_report(plays):
    return {
        "sample_size": len(plays),
        "top_concepts": top_frequencies(plays, "concept_name"),
        "top_formations": top_frequencies(plays, "formation"),
        "motion_usage": top_frequencies(plays, "motion"),
        "play_type_mix": top_frequencies(plays, "play_type"),
        "success_by_concept": success_rate_by_attr(plays, "concept_name"),
        "success_by_formation": success_rate_by_attr(plays, "formation"),
        "explosive_by_concept": explosive_rate_by_attr(plays, "concept_name"),
        "insights": simple_insights(plays),
    }

