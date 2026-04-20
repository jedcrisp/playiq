from __future__ import annotations

from sqlalchemy.orm import Session

from ..models import AISummary, Gameplan, OpponentProfile


def _safe(value):
    return value if value is not None else ""


def build_matchup_context(
    *,
    db: Session,
    gameplan_id: int | None,
    opponent_profile_id: int | None,
    inputs: dict | None,
    recommendation: dict | None,
    gameplan: Gameplan | None = None,
    opponent: OpponentProfile | None = None,
) -> dict:
    gp = gameplan if gameplan is not None else (db.get(Gameplan, gameplan_id) if gameplan_id else None)
    opp = (
        opponent
        if opponent is not None
        else (db.get(OpponentProfile, opponent_profile_id) if opponent_profile_id else None)
    )
    last_ai_summary = None
    if gameplan_id:
        last_ai_summary = (
            db.query(AISummary)
            .filter(AISummary.gameplan_id == gameplan_id)
            .order_by(AISummary.created_at.desc())
            .first()
        )
    return {
        "inputs": inputs or (gp.inputs_json if gp else {}),
        "recommendation": recommendation or (gp.recommendation_json if gp else {}),
        "gameplan_notes": gp.notes_json if gp else {},
        "opponent_notes": _safe(opp.notes if opp else ""),
        "opponent_tendencies": opp.tendencies_json if opp else {},
        "opponent_analyst_notes": opp.analyst_notes_json if opp else {},
        "prior_ai_summary": _safe(last_ai_summary.content if last_ai_summary else ""),
    }

