from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from starlette.responses import Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import SituationPlan, SituationPlanCall, User
from ..schemas import (
    SituationPlanCallCreate,
    SituationPlanCallOut,
    SituationPlanCallUpdate,
    SituationPlanCreate,
    SituationPlanOut,
    SituationPlanUpdate,
)
from ..services.access import assert_can_assign_team, user_team_ids
from ..services.situation_service import get_visible_situation_plan, list_situation_calls

router = APIRouter(prefix="/api/situations", tags=["situations"])


@router.get("", response_model=list[SituationPlanOut])
def list_situation_plans(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[SituationPlanOut]:
    team_ids = user_team_ids(db, current.id)
    q = select(SituationPlan).where(
        or_(SituationPlan.owner_user_id == current.id, SituationPlan.team_id.in_(team_ids or [-1]))
    ).order_by(SituationPlan.updated_at.desc())
    return list(db.scalars(q).all())  # type: ignore[return-value]


@router.post("", response_model=SituationPlanOut, status_code=201)
def create_situation_plan(
    body: SituationPlanCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> SituationPlanOut:
    assert_can_assign_team(db, current.id, body.team_id)
    row = SituationPlan(owner_user_id=current.id, **body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.put("/{plan_id}", response_model=SituationPlanOut)
def update_situation_plan(
    plan_id: int,
    body: SituationPlanUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> SituationPlanOut:
    row = get_visible_situation_plan(db, current.id, plan_id)
    data = body.model_dump(exclude_unset=True)
    if "team_id" in data:
        assert_can_assign_team(db, current.id, data["team_id"])
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.delete("/{plan_id}", status_code=204)
def delete_situation_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    row = db.get(SituationPlan, plan_id)
    if not row or row.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Situation plan not found")
    db.query(SituationPlanCall).filter(SituationPlanCall.situation_plan_id == plan_id).delete()
    db.delete(row)
    db.commit()
    return Response(status_code=204)


@router.get("/{plan_id}/calls", response_model=list[SituationPlanCallOut])
def get_situation_calls(
    plan_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[SituationPlanCallOut]:
    get_visible_situation_plan(db, current.id, plan_id)
    return list_situation_calls(db, plan_id)  # type: ignore[return-value]


@router.post("/{plan_id}/calls", response_model=SituationPlanCallOut, status_code=201)
def create_situation_call(
    plan_id: int,
    body: SituationPlanCallCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> SituationPlanCallOut:
    get_visible_situation_plan(db, current.id, plan_id)
    row = SituationPlanCall(situation_plan_id=plan_id, owner_user_id=current.id, **body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.put("/calls/{call_id}", response_model=SituationPlanCallOut)
def update_situation_call(
    call_id: int,
    body: SituationPlanCallUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> SituationPlanCallOut:
    row = db.get(SituationPlanCall, call_id)
    if not row:
        raise HTTPException(status_code=404, detail="Situation plan call not found")
    get_visible_situation_plan(db, current.id, row.situation_plan_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.delete("/calls/{call_id}", status_code=204)
def delete_situation_call(
    call_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    row = db.get(SituationPlanCall, call_id)
    if not row:
        raise HTTPException(status_code=404, detail="Situation plan call not found")
    get_visible_situation_plan(db, current.id, row.situation_plan_id)
    db.delete(row)
    db.commit()
    return Response(status_code=204)
