from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from starlette.responses import Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Script, ScriptEntry, User
from ..schemas import (
    ScriptCreate,
    ScriptEntryCreate,
    ScriptEntryOut,
    ScriptEntryUpdate,
    ScriptOut,
    ScriptReorderRequest,
    ScriptUpdate,
)
from ..services.access import assert_can_assign_team, user_team_ids
from ..services.script_service import get_visible_script, list_script_entries

router = APIRouter(prefix="/api/scripts", tags=["scripts"])


@router.get("", response_model=list[ScriptOut])
def list_scripts(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[ScriptOut]:
    team_ids = user_team_ids(db, current.id)
    q = select(Script).where(
        or_(Script.owner_user_id == current.id, Script.team_id.in_(team_ids or [-1]))
    ).order_by(Script.updated_at.desc())
    return list(db.scalars(q).all())  # type: ignore[return-value]


@router.post("", response_model=ScriptOut, status_code=201)
def create_script(
    body: ScriptCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ScriptOut:
    assert_can_assign_team(db, current.id, body.team_id)
    row = Script(owner_user_id=current.id, **body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.put("/{script_id}", response_model=ScriptOut)
def update_script(
    script_id: int,
    body: ScriptUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ScriptOut:
    row = get_visible_script(db, current.id, script_id)
    data = body.model_dump(exclude_unset=True)
    if "team_id" in data:
        assert_can_assign_team(db, current.id, data["team_id"])
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.delete("/{script_id}", status_code=204)
def delete_script(
    script_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    row = db.get(Script, script_id)
    if not row or row.owner_user_id != current.id:
        raise HTTPException(status_code=404, detail="Script not found")
    db.query(ScriptEntry).filter(ScriptEntry.script_id == script_id).delete()
    db.delete(row)
    db.commit()
    return Response(status_code=204)


@router.get("/{script_id}/entries", response_model=list[ScriptEntryOut])
def get_script_entries(
    script_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[ScriptEntryOut]:
    get_visible_script(db, current.id, script_id)
    return list_script_entries(db, script_id)  # type: ignore[return-value]


@router.post("/{script_id}/entries", response_model=ScriptEntryOut, status_code=201)
def create_script_entry(
    script_id: int,
    body: ScriptEntryCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ScriptEntryOut:
    get_visible_script(db, current.id, script_id)
    row = ScriptEntry(script_id=script_id, owner_user_id=current.id, **body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.put("/entries/{entry_id}", response_model=ScriptEntryOut)
def update_script_entry(
    entry_id: int,
    body: ScriptEntryUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ScriptEntryOut:
    row = db.get(ScriptEntry, entry_id)
    if not row:
        raise HTTPException(status_code=404, detail="Script entry not found")
    get_visible_script(db, current.id, row.script_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.delete("/entries/{entry_id}", status_code=204)
def delete_script_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    row = db.get(ScriptEntry, entry_id)
    if not row:
        raise HTTPException(status_code=404, detail="Script entry not found")
    get_visible_script(db, current.id, row.script_id)
    db.delete(row)
    db.commit()
    return Response(status_code=204)


@router.post("/{script_id}/reorder", response_model=list[ScriptEntryOut])
def reorder_script_entries(
    script_id: int,
    body: ScriptReorderRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[ScriptEntryOut]:
    get_visible_script(db, current.id, script_id)
    entries = list_script_entries(db, script_id)
    by_id = {e.id: e for e in entries}
    if set(body.entry_ids) != set(by_id.keys()):
        raise HTTPException(status_code=400, detail="entry_ids must match all script entries")
    for idx, entry_id in enumerate(body.entry_ids, start=1):
        by_id[entry_id].position = idx
    db.commit()
    return list_script_entries(db, script_id)  # type: ignore[return-value]
