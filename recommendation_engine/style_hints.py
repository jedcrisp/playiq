"""Offensive-system flavor appended to coaching notes."""

_STYLE_TIPS: dict[str, str] = {
    "Spread": "Tempo and width—stress horizontal spacing and RPO tags off the box.",
    "Air Raid": "Pair with your quick-game tree; mesh and stick families stay on schedule.",
    "Pro Style": "Under-center PA and hard play-action fits sell run-action for shot shots.",
    "RPO": "Tag peek/cancel vs conflict linebackers once the box declares.",
    "West Coast": "Emphasize rhythm throws and sight adjustments to hook/curl defenders.",
    "Balanced": "Tie each concept to a core run family so tendencies stay honest.",
}


def style_appendix(offensive_style: str) -> str:
    return _STYLE_TIPS.get(offensive_style, "Adapt personnel and splits to your core install.")
