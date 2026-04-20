from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..models import SituationPlan, SituationPlanCall
from .access import user_team_ids


def get_visible_situation_plan(db: Session, user_id: int, plan_id: int) -> SituationPlan:
    team_ids = user_team_ids(db, user_id)
    row = db.scalar(
        select(SituationPlan).where(
            SituationPlan.id == plan_id,
            or_(SituationPlan.owner_user_id == user_id, SituationPlan.team_id.in_(team_ids or [-1])),
        )
    )
    if not row:
        raise HTTPException(status_code=404, detail="Situation plan not found")
    return row


def list_situation_calls(db: Session, plan_id: int) -> list[SituationPlanCall]:
    q = select(SituationPlanCall).where(SituationPlanCall.situation_plan_id == plan_id).order_by(
        SituationPlanCall.priority.asc()
    )
    return list(db.scalars(q).all())
