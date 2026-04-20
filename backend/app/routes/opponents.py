from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import OpponentProfile, User, Visibility
from ..schemas import OpponentCreate, OpponentOut, OpponentUpdate
from ..services.access import assert_can_assign_team, user_team_ids

router = APIRouter(prefix="/api/opponents", tags=["opponents"])


def _to_out(r: OpponentProfile) -> OpponentOut:
    return OpponentOut(
        id=r.id,
        owner_user_id=r.owner_user_id,
        team_id=r.team_id,
        opponent_name=r.opponent_name,
        team_level=r.team_level,
        notes=r.notes,
        visibility=r.visibility.value,
        tendencies=r.tendencies_json or {},
        analyst_notes=r.analyst_notes_json or {},
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


@router.get("", response_model=list[OpponentOut])
def list_opponents(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[OpponentOut]:
    team_ids = user_team_ids(db, current.id)
    q = select(OpponentProfile).where(
        or_(
            OpponentProfile.owner_user_id == current.id,
            (OpponentProfile.visibility == Visibility.team)
            & (OpponentProfile.team_id.in_(team_ids or [-1])),
        )
    ).order_by(OpponentProfile.updated_at.desc())
    return [_to_out(x) for x in db.scalars(q).all()]


@router.post("", response_model=OpponentOut, status_code=201)
def create_opponent(
    body: OpponentCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> OpponentOut:
    assert_can_assign_team(db, current.id, body.team_id)
    row = OpponentProfile(
        owner_user_id=current.id,
        team_id=body.team_id,
        opponent_name=body.opponent_name,
        team_level=body.team_level,
        notes=body.notes,
        visibility=Visibility.team if body.visibility == "team" else Visibility.private,
        tendencies_json=body.tendencies,
        analyst_notes_json=body.analyst_notes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _to_out(row)


@router.put("/{opponent_id}", response_model=OpponentOut)
def update_opponent(
    opponent_id: int,
    body: OpponentUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> OpponentOut:
    row = db.get(OpponentProfile, opponent_id)
    if not row:
        raise HTTPException(status_code=404, detail="Opponent profile not found")
    is_owner = row.owner_user_id == current.id
    is_team_shared = (
        row.visibility == Visibility.team and row.team_id in user_team_ids(db, current.id)
    )
    if not is_owner and not is_team_shared:
        raise HTTPException(status_code=403, detail="Not allowed")
    if body.team_id is not None:
        assert_can_assign_team(db, current.id, body.team_id)
        row.team_id = body.team_id
    if body.opponent_name is not None:
        row.opponent_name = body.opponent_name
    if body.team_level is not None:
        row.team_level = body.team_level
    if body.notes is not None:
        row.notes = body.notes
    if body.visibility is not None:
        row.visibility = Visibility.team if body.visibility == "team" else Visibility.private
    if body.tendencies is not None:
        row.tendencies_json = body.tendencies
    if body.analyst_notes is not None:
        row.analyst_notes_json = body.analyst_notes
    db.commit()
    db.refresh(row)
    return _to_out(row)


@router.delete("/{opponent_id}", status_code=204)
def delete_opponent(
    opponent_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> None:
    row = db.get(OpponentProfile, opponent_id)
    if not row or row.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Opponent profile not found")
    db.delete(row)
    db.commit()
    return None

