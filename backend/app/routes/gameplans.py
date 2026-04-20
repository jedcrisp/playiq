from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from starlette.responses import Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Gameplan, User, Visibility
from ..schemas import GameplanCreate, GameplanOut, GameplanUpdate
from ..services.access import assert_can_assign_team, user_team_ids

router = APIRouter(prefix="/api/gameplans", tags=["gameplans"])


def _fetch_visible_gameplan(db: Session, current: User, gameplan_id: int) -> Gameplan:
    team_ids = user_team_ids(db, current.id)
    query = select(Gameplan).where(
        Gameplan.id == gameplan_id,
        or_(
            Gameplan.owner_user_id == current.id,
            (Gameplan.visibility == Visibility.team) & (Gameplan.team_id.in_(team_ids or [-1])),
        ),
    )
    gp = db.scalar(query)
    if not gp:
        raise HTTPException(status_code=404, detail="Gameplan not found")
    return gp


@router.get("", response_model=list[GameplanOut])
def list_gameplans(
    include_team: bool = Query(True),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[GameplanOut]:
    team_ids = user_team_ids(db, current.id)
    filters = [Gameplan.owner_user_id == current.id]
    if include_team and team_ids:
        filters.append(
            (Gameplan.visibility == Visibility.team) & (Gameplan.team_id.in_(team_ids))
        )
    q = select(Gameplan).where(or_(*filters)).order_by(Gameplan.updated_at.desc())
    return list(db.scalars(q).all())  # type: ignore[return-value]


@router.post("", response_model=GameplanOut, status_code=201)
def create_gameplan(
    body: GameplanCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> GameplanOut:
    assert_can_assign_team(db, current.id, body.team_id)
    gp = Gameplan(
        owner_user_id=current.id,
        team_id=body.team_id,
        name=body.name,
        visibility=Visibility.team if body.visibility == "team" else Visibility.private,
        inputs_json=body.inputs,
        recommendation_json=body.recommendation,
        notes_json=body.notes,
    )
    db.add(gp)
    db.commit()
    db.refresh(gp)
    return gp_to_out(gp)


@router.put("/{gameplan_id}", response_model=GameplanOut)
def update_gameplan(
    gameplan_id: int,
    body: GameplanUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> GameplanOut:
    gp = _fetch_visible_gameplan(db, current, gameplan_id)
    if gp.owner_user_id != current.id and gp.visibility != Visibility.team:
        raise HTTPException(status_code=403, detail="Not allowed")
    if body.team_id is not None:
        assert_can_assign_team(db, current.id, body.team_id)
        gp.team_id = body.team_id
    if body.name is not None:
        gp.name = body.name
    if body.visibility is not None:
        gp.visibility = Visibility.team if body.visibility == "team" else Visibility.private
    if body.inputs is not None:
        gp.inputs_json = body.inputs
    if body.recommendation is not None:
        gp.recommendation_json = body.recommendation
    if body.notes is not None:
        gp.notes_json = body.notes
    db.commit()
    db.refresh(gp)
    return gp_to_out(gp)


@router.delete("/{gameplan_id}", status_code=204)
def delete_gameplan(
    gameplan_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    gp = db.get(Gameplan, gameplan_id)
    if not gp or gp.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Gameplan not found")
    db.delete(gp)
    db.commit()
    return Response(status_code=204)


def gp_to_out(gp: Gameplan) -> GameplanOut:
    return GameplanOut(
        id=gp.id,
        owner_user_id=gp.owner_user_id,
        team_id=gp.team_id,
        name=gp.name,
        visibility=gp.visibility.value,
        inputs=gp.inputs_json,
        recommendation=gp.recommendation_json,
        notes=gp.notes_json or {"scouting": "", "coaching": "", "emphasis": ""},
        created_at=gp.created_at,
        updated_at=gp.updated_at,
    )

