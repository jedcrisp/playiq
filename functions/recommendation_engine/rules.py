"""Rule registry: priority-ordered pattern matches → concept packs."""

from __future__ import annotations

from .concept_packs import (
    BLITZ_QUICK_GAME,
    COVER2_MIKE_WEAKNESS,
    COVER3_ROTATION_WEAKNESS,
    COVER4_BOUNDARY_JUMP,
    MAN_WEAK_DB,
    NICKEL_SLOW_SPACE,
    PLAY_ACTION_BITER,
)
from .extended_packs import (
    COVER6_FAMILY,
    FIRE_ZONE_FAMILY,
    MATCH_AND_PALMS,
    ROTATION_HEAVY,
    RUN_GAME_COMPLEMENTS,
    SLOT_FADE_SPACING,
    TWO_MAN_ROBBER,
)
from .models import Rule

RULES: list[Rule] = [
    Rule(
        name="cover3_rotation",
        priority=100,
        match={
            "coverage_shell": "Cover 3",
            "weakness_type": "Late to rotate",
        },
        concepts=COVER3_ROTATION_WEAKNESS,
    ),
    Rule(
        name="cover2_mike",
        priority=100,
        match={
            "coverage_shell": "Cover 2",
            "defender_to_attack": "Mike linebacker",
        },
        concepts=COVER2_MIKE_WEAKNESS,
    ),
    Rule(
        name="man_weak_db",
        priority=95,
        match={
            "coverage_shell": ["Cover 1", "Man Free"],
            "weakness_type": ["Slow in space", "Struggles in man coverage"],
            "defender_to_attack": [
                "Boundary corner",
                "Field corner",
                "Nickel",
                "Strong safety",
                "Free safety",
            ],
        },
        concepts=MAN_WEAK_DB,
    ),
    Rule(
        name="two_man_robber_shell",
        priority=94,
        match={"coverage_shell": ["2-Man", "Robber"]},
        concepts=TWO_MAN_ROBBER,
    ),
    Rule(
        name="match_quarters_family",
        priority=93,
        match={"coverage_shell": ["Match Quarters", "Palms"]},
        concepts=MATCH_AND_PALMS,
    ),
    Rule(
        name="cover6_shell",
        priority=92,
        match={"coverage_shell": "Cover 6"},
        concepts=COVER6_FAMILY,
    ),
    Rule(
        name="rotation_heavy",
        priority=91,
        match={"coverage_shell": "Mixed / Rotation-heavy"},
        concepts=ROTATION_HEAVY,
    ),
    Rule(
        name="fire_zone",
        priority=90,
        match={"coverage_shell": "Fire Zone"},
        concepts=FIRE_ZONE_FAMILY,
    ),
    Rule(
        name="cover4_boundary_corner",
        priority=85,
        match={
            "coverage_shell": "Cover 4 / Quarters",
            "defender_to_attack": "Boundary corner",
            "weakness_type": "Jumps underneath routes",
        },
        concepts=COVER4_BOUNDARY_JUMP,
    ),
    Rule(
        name="blitz_quick_game",
        priority=80,
        match={"pressure_tendency": "Blitz-heavy"},
        concepts=BLITZ_QUICK_GAME,
    ),
    Rule(
        name="play_action_vs_biter",
        priority=75,
        match={"weakness_type": "Bites on play action"},
        concepts=PLAY_ACTION_BITER,
    ),
    Rule(
        name="nickel_slow_space",
        priority=70,
        match={
            "defender_to_attack": "Nickel",
            "weakness_type": "Slow in space",
        },
        concepts=NICKEL_SLOW_SPACE,
    ),
    Rule(
        name="pro_run_complements",
        priority=65,
        match={
            "offensive_style": ["Pro Style", "Balanced"],
            "weakness_type": ["Poor tackler", "Overaggressive"],
        },
        concepts=RUN_GAME_COMPLEMENTS,
    ),
    Rule(
        name="slot_isolation_air",
        priority=64,
        match={
            "offensive_style": ["Air Raid", "Spread"],
            "defender_to_attack": "Nickel",
        },
        concepts=SLOT_FADE_SPACING,
    ),
]
