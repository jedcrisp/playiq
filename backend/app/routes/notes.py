from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from starlette.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Note, User
from ..schemas import NoteCreate, NoteOut, NoteUpdate
from ..services.access import assert_can_assign_team

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("", response_model=list[NoteOut])
def list_notes(
    entity_type: str | None = Query(default=None),
    entity_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[NoteOut]:
    q = select(Note).where(Note.owner_user_id == current.id)
    if entity_type:
        q = q.where(Note.entity_type == entity_type)
    if entity_id:
        q = q.where(Note.entity_id == entity_id)
    return list(db.scalars(q.order_by(Note.updated_at.desc())).all())  # type: ignore[return-value]


@router.post("", response_model=NoteOut, status_code=201)
def create_note(
    body: NoteCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> NoteOut:
    assert_can_assign_team(db, current.id, body.team_id)
    row = Note(
        owner_user_id=current.id,
        team_id=body.team_id,
        entity_type=body.entity_type,
        entity_id=body.entity_id,
        content=body.content,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    body: NoteUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> NoteOut:
    row = db.get(Note, note_id)
    if not row or row.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Note not found")
    row.content = body.content
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    row = db.get(Note, note_id)
    if not row or row.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(row)
    db.commit()
    return Response(status_code=204)

