from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import ReportNote, User
from ..schemas import AnalyticsResponse, ReportNoteCreate, ReportNoteOut
from ..services.access import assert_can_assign_team, user_team_ids
from ..services.analytics_service import fetch_filtered_plays
from ..services.report_service import build_opponent_report, build_self_scout_report

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _scope_filters(current: User, team_ids: list[int], **kwargs):
    return dict(kwargs)


@router.get("/opponent", response_model=AnalyticsResponse)
def opponent_analytics(
    opponent_profile_id: int | None = None,
    game_label: str | None = None,
    down: int | None = None,
    distance_bucket: str | None = None,
    field_zone: str | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AnalyticsResponse:
    team_ids = user_team_ids(db, current.id)
    plays = fetch_filtered_plays(
        db,
        _scope_filters(
            current,
            team_ids,
            opponent_profile_id=opponent_profile_id,
            game_label=game_label,
            down=down,
            distance_bucket=distance_bucket,
            field_zone=field_zone,
            side="defense",
        ),
        user_id=current.id,
        team_ids=team_ids,
    )
    report = build_opponent_report(plays)
    return AnalyticsResponse(**report)


@router.get("/self-scout", response_model=AnalyticsResponse)
def self_scout_analytics(
    game_label: str | None = None,
    down: int | None = None,
    distance_bucket: str | None = None,
    field_zone: str | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AnalyticsResponse:
    team_ids = user_team_ids(db, current.id)
    plays = fetch_filtered_plays(
        db,
        _scope_filters(
            current,
            team_ids,
            game_label=game_label,
            down=down,
            distance_bucket=distance_bucket,
            field_zone=field_zone,
            side="self",
        ),
        user_id=current.id,
        team_ids=team_ids,
    )
    report = build_self_scout_report(plays)
    return AnalyticsResponse(**report)


@router.get("/report/opponent", response_model=AnalyticsResponse)
def opponent_report(
    opponent_profile_id: int | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AnalyticsResponse:
    return opponent_analytics(
        opponent_profile_id=opponent_profile_id,
        db=db,
        current=current,
    )


@router.get("/report/self-scout", response_model=AnalyticsResponse)
def self_scout_report(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AnalyticsResponse:
    return self_scout_analytics(db=db, current=current)


@router.post("/report-notes", response_model=ReportNoteOut, status_code=201)
def create_report_note(
    body: ReportNoteCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> ReportNoteOut:
    team_ids = user_team_ids(db, current.id)
    team_id = team_ids[0] if team_ids else None
    if team_id:
        assert_can_assign_team(db, current.id, team_id)
    row = ReportNote(
        team_id=team_id,
        owner_user_id=current.id,
        report_type=body.report_type,
        scope_id=body.scope_id,
        title=body.title,
        content=body.content,
        tags=body.tags,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row  # type: ignore[return-value]


@router.get("/report-notes", response_model=list[ReportNoteOut])
def list_report_notes(
    report_type: str | None = None,
    scope_id: int | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[ReportNoteOut]:
    team_ids = user_team_ids(db, current.id)
    q = db.query(ReportNote).filter(
        (ReportNote.owner_user_id == current.id) | (ReportNote.team_id.in_(team_ids or [-1]))
    )
    if report_type:
        q = q.filter(ReportNote.report_type == report_type)
    if scope_id is not None:
        q = q.filter(ReportNote.scope_id == scope_id)
    return q.order_by(ReportNote.updated_at.desc()).all()  # type: ignore[return-value]


@router.get("/bridge/opponent-summary")
def opponent_bridge_summary(
    opponent_profile_id: int | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> dict:
    team_ids = user_team_ids(db, current.id)
    plays = fetch_filtered_plays(
        db,
        _scope_filters(
            current,
            team_ids,
            opponent_profile_id=opponent_profile_id,
            side="defense",
        ),
        user_id=current.id,
        team_ids=team_ids,
    )
    report = build_opponent_report(plays)
    return {
        "sample_size": report["sample_size"],
        "top_fronts": report["front_frequency"][:3],
        "top_coverages": report["coverage_frequency"][:3],
        "top_pressures": report["pressure_frequency"][:3],
        "insights": report["insights"][:3],
    }

