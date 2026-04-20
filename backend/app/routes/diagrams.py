from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from starlette.responses import Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Diagram, User, Visibility
from ..schemas import DiagramCreate, DiagramOut, DiagramUpdate
from ..services.access import assert_can_assign_team, user_team_ids

router = APIRouter(prefix="/api/diagrams", tags=["diagrams"])


def _to_out(d: Diagram) -> DiagramOut:
    return DiagramOut(
        id=d.id,
        owner_user_id=d.owner_user_id,
        team_id=d.team_id,
        name=d.name,
        play_name=d.play_name,
        linked_concept_name=d.linked_concept_name,
        linked_gameplan_id=d.linked_gameplan_id,
        linked_opponent_profile_id=d.linked_opponent_profile_id,
        linked_call_sheet_rank=d.linked_call_sheet_rank,
        install_note=d.install_note,
        visibility=d.visibility.value,
        canvas=d.canvas_json or {},
        created_at=d.created_at,
        updated_at=d.updated_at,
    )


@router.get("", response_model=list[DiagramOut])
def list_diagrams(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[DiagramOut]:
    team_ids = user_team_ids(db, current.id)
    q = select(Diagram).where(
        or_(
            Diagram.owner_user_id == current.id,
            (Diagram.visibility == Visibility.team) & (Diagram.team_id.in_(team_ids or [-1])),
        )
    ).order_by(Diagram.updated_at.desc())
    return [_to_out(x) for x in db.scalars(q).all()]


@router.post("", response_model=DiagramOut, status_code=201)
def create_diagram(
    body: DiagramCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> DiagramOut:
    assert_can_assign_team(db, current.id, body.team_id)
    d = Diagram(
        owner_user_id=current.id,
        team_id=body.team_id,
        name=body.name,
        play_name=body.play_name,
        linked_concept_name=body.linked_concept_name,
        linked_gameplan_id=body.linked_gameplan_id,
        linked_opponent_profile_id=body.linked_opponent_profile_id,
        linked_call_sheet_rank=body.linked_call_sheet_rank,
        install_note=body.install_note,
        visibility=Visibility.team if body.visibility == "team" else Visibility.private,
        canvas_json=body.canvas,
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return _to_out(d)


@router.put("/{diagram_id}", response_model=DiagramOut)
def update_diagram(
    diagram_id: int,
    body: DiagramUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> DiagramOut:
    d = db.get(Diagram, diagram_id)
    if not d:
        raise HTTPException(status_code=404, detail="Diagram not found")
    is_owner = d.owner_user_id == current.id
    is_team_shared = d.visibility == Visibility.team and d.team_id in user_team_ids(db, current.id)
    if not is_owner and not is_team_shared:
        raise HTTPException(status_code=403, detail="Not allowed")
    if body.team_id is not None:
        assert_can_assign_team(db, current.id, body.team_id)
        d.team_id = body.team_id
    for attr in [
        "name",
        "play_name",
        "linked_concept_name",
        "linked_gameplan_id",
        "linked_opponent_profile_id",
        "linked_call_sheet_rank",
        "install_note",
    ]:
        val = getattr(body, attr)
        if val is not None:
            setattr(d, attr, val)
    if body.visibility is not None:
        d.visibility = Visibility.team if body.visibility == "team" else Visibility.private
    if body.canvas is not None:
        d.canvas_json = body.canvas
    db.commit()
    db.refresh(d)
    return _to_out(d)


@router.delete("/{diagram_id}", status_code=204)
def delete_diagram(
    diagram_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    d = db.get(Diagram, diagram_id)
    if not d or d.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Diagram not found")
    db.delete(d)
    db.commit()
    return Response(status_code=204)

