from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..models import Script, ScriptEntry
from .access import user_team_ids


def get_visible_script(db: Session, user_id: int, script_id: int) -> Script:
    team_ids = user_team_ids(db, user_id)
    row = db.scalar(
        select(Script).where(
            Script.id == script_id,
            or_(Script.owner_user_id == user_id, Script.team_id.in_(team_ids or [-1])),
        )
    )
    if not row:
        raise HTTPException(status_code=404, detail="Script not found")
    return row


def list_script_entries(db: Session, script_id: int) -> list[ScriptEntry]:
    q = select(ScriptEntry).where(ScriptEntry.script_id == script_id).order_by(ScriptEntry.position.asc())
    return list(db.scalars(q).all())
