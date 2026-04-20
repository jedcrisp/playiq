from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Team, TeamMembership, TeamRole, User
from ..schemas import TeamCreate, TeamJoin, TeamMembershipOut, TeamOut

router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("", response_model=list[TeamOut])
def list_my_teams(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[TeamOut]:
    memberships = db.scalars(
        select(TeamMembership).where(TeamMembership.user_id == current.id)
    ).all()
    team_ids = [m.team_id for m in memberships]
    if not team_ids:
        return []
    return list(db.scalars(select(Team).where(Team.id.in_(team_ids))).all())  # type: ignore[return-value]


@router.get("/memberships", response_model=list[TeamMembershipOut])
def list_my_memberships(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> list[TeamMembershipOut]:
    return list(
        db.scalars(select(TeamMembership).where(TeamMembership.user_id == current.id)).all()
    )  # type: ignore[return-value]


@router.post("", response_model=TeamOut)
def create_team(
    body: TeamCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> TeamOut:
    cleaned = body.name.strip()
    exists = db.scalar(
        select(Team).where(Team.owner_user_id == current.id, Team.name == cleaned)
    )
    if exists:
        raise HTTPException(
            status_code=400,
            detail="You already have a team with this name. Pick a different name.",
        )
    team = Team(name=cleaned, owner_user_id=current.id)
    db.add(team)
    db.flush()
    db.add(TeamMembership(user_id=current.id, team_id=team.id, role=TeamRole.admin))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not create team (database constraint). If this persists after retrying, "
                "run the SQL migration in backend/scripts/migrate_teams_name_per_owner.sql on Postgres."
            ),
        ) from None
    db.refresh(team)
    return team  # type: ignore[return-value]


@router.post("/join", response_model=TeamMembershipOut)
def join_team(
    body: TeamJoin,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> TeamMembershipOut:
    team = db.get(Team, body.team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    existing = db.scalar(
        select(TeamMembership).where(
            TeamMembership.user_id == current.id, TeamMembership.team_id == body.team_id
        )
    )
    if existing:
        return existing  # type: ignore[return-value]
    membership = TeamMembership(
        user_id=current.id,
        team_id=body.team_id,
        role=TeamRole.admin if body.role == "admin" else TeamRole.coach,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership  # type: ignore[return-value]

