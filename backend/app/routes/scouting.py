from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from starlette.responses import Response
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import OpponentProfile, ScoutingPlay, User
from ..schemas import CSVImportResponse, ScoutingPlayCreate, ScoutingPlayOut, ScoutingPlayUpdate
from ..services.access import assert_can_assign_team, user_team_ids
from ..services.scouting_import_service import csv_template_text, parse_csv_rows

router = APIRouter(prefix="/api/scouting", tags=["scouting"])


def _visible_predicates(current: User, team_ids: list[int]):
    return or_(ScoutingPlay.created_by == current.id, ScoutingPlay.team_id.in_(team_ids or [-1]))


def _resolve_opponent_profile_id(
    db: Session,
    *,
    current: User,
    opponent_profile_id: int | None,
    team_ids: list[int],
) -> int | None:
    if opponent_profile_id is None:
        return None
    opp = db.get(OpponentProfile, opponent_profile_id)
    if not opp:
        raise HTTPException(status_code=404, detail="Opponent profile not found")
    allowed = opp.owner_user_id == current.id or (
        opp.team_id is not None and opp.team_id in team_ids
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed for that opponent profile")
    return opp.id


@router.get("/template")
def scouting_template() -> dict[str, str]:
    return {"csv": csv_template_text()}


@router.get("/plays", response_model=list[ScoutingPlayOut])
def list_scouting_plays(
    game_label: str | None = None,
    side: str | None = None,
    opponent_profile_id: int | None = None,
    down: int | None = None,
    distance_bucket: str | None = None,
    field_zone: str | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[ScoutingPlayOut]:
    team_ids = user_team_ids(db, current.id)
    preds = [_visible_predicates(current, team_ids)]
    if game_label:
        preds.append(ScoutingPlay.game_label == game_label)
    if side:
        preds.append(ScoutingPlay.side == side)
    if opponent_profile_id:
        preds.append(ScoutingPlay.opponent_profile_id == opponent_profile_id)
    if down:
        preds.append(ScoutingPlay.down == down)
    if distance_bucket:
        preds.append(ScoutingPlay.distance_bucket == distance_bucket)
    if field_zone:
        preds.append(ScoutingPlay.field_zone == field_zone)
    q = select(ScoutingPlay).where(and_(*preds)).order_by(ScoutingPlay.created_at.desc())
    return list(db.scalars(q).all())  # type: ignore[return-value]


@router.post("/plays", response_model=ScoutingPlayOut, status_code=201)
def create_scouting_play(
    body: ScoutingPlayCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ScoutingPlayOut:
    team_ids = user_team_ids(db, current.id)
    assert_can_assign_team(db, current.id, body.team_id)
    resolved_opp_id = _resolve_opponent_profile_id(
        db,
        current=current,
        opponent_profile_id=body.opponent_profile_id,
        team_ids=team_ids,
    )
    row = ScoutingPlay(
        team_id=body.team_id,
        opponent_profile_id=resolved_opp_id,
        source_type=body.source_type,
        game_label=body.game_label,
        side=body.side,
        down=body.down,
        distance_bucket=body.distance_bucket,
        field_zone=body.field_zone,
        hash=body.hash,
        personnel=body.personnel,
        formation=body.formation,
        motion=body.motion,
        defensive_front=body.defensive_front,
        coverage_shell=body.coverage_shell,
        pressure_type=body.pressure_type,
        concept_name=body.concept_name,
        yards=body.yards,
        explosive=body.explosive,
        success=body.success,
        play_type=body.play_type,
        result_notes=body.result_notes,
        tags=body.tags,
        created_by=current.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.put("/plays/{play_id}", response_model=ScoutingPlayOut)
def update_scouting_play(
    play_id: int,
    body: ScoutingPlayUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ScoutingPlayOut:
    row = db.get(ScoutingPlay, play_id)
    if not row:
        raise HTTPException(status_code=404, detail="Scouting play not found")
    if row.created_by != current.id and row.team_id not in user_team_ids(db, current.id):
        raise HTTPException(status_code=403, detail="Not allowed")
    payload = body.model_dump(exclude_unset=True)
    team_ids = user_team_ids(db, current.id)
    if "opponent_profile_id" in payload:
        payload["opponent_profile_id"] = _resolve_opponent_profile_id(
            db,
            current=current,
            opponent_profile_id=payload["opponent_profile_id"],
            team_ids=team_ids,
        )
    for k, v in payload.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.delete("/plays/{play_id}", status_code=204)
def delete_scouting_play(
    play_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> Response:
    row = db.get(ScoutingPlay, play_id)
    if not row:
        raise HTTPException(status_code=404, detail="Scouting play not found")
    if row.created_by != current.id and row.team_id not in user_team_ids(db, current.id):
        raise HTTPException(status_code=404, detail="Scouting play not found")
    db.delete(row)
    db.commit()
    return Response(status_code=204)


@router.post("/import", response_model=CSVImportResponse)
async def import_scouting_csv(
    file: UploadFile = File(...),
    team_id: int | None = Form(default=None),
    side: str = Form(default="defense"),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> CSVImportResponse:
    assert_can_assign_team(db, current.id, team_id)
    raw = (await file.read()).decode("utf-8", errors="replace")
    rows, errors = parse_csv_rows(raw)
    if errors:
        return CSVImportResponse(inserted=0, errors=errors)
    inserted = 0
    for r in rows:
        opponent_profile_id = None
        if r.get("opponent_name"):
            team_ids = user_team_ids(db, current.id)
            opp = db.scalar(
                select(OpponentProfile).where(
                    OpponentProfile.opponent_name == r["opponent_name"],
                    or_(
                        OpponentProfile.owner_user_id == current.id,
                        OpponentProfile.team_id.in_(team_ids or [-1]),
                    ),
                )
            )
            opponent_profile_id = opp.id if opp else None
        row = ScoutingPlay(
            team_id=team_id,
            opponent_profile_id=opponent_profile_id,
            source_type="csv",
            game_label=r["game_label"],
            side=(r.get("side") or side),
            down=r["down"],
            distance_bucket=r["distance_bucket"],
            field_zone=r["field_zone"],
            hash=r["hash"],
            personnel=r["personnel"],
            formation=r["formation"],
            motion=r["motion"],
            defensive_front=r["defensive_front"],
            coverage_shell=r["coverage_shell"],
            pressure_type=r["pressure_type"],
            concept_name=r["concept_name"],
            yards=r["yards"],
            explosive=r["explosive"],
            success=r["success"],
            play_type=r["play_type"],
            result_notes=r["result_notes"],
            tags=r["tags"],
            created_by=current.id,
        )
        db.add(row)
        inserted += 1
    db.commit()
    return CSVImportResponse(inserted=inserted, errors=[])

