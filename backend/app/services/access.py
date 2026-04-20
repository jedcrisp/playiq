from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import Select, or_, select
from sqlalchemy.orm import Session

from ..models import Gameplan, OpponentProfile, TeamMembership, Visibility


def user_team_ids(db: Session, user_id: int) -> list[int]:
    return list(
        db.scalars(select(TeamMembership.team_id).where(TeamMembership.user_id == user_id)).all()
    )


def assert_can_assign_team(db: Session, user_id: int, team_id: int | None) -> None:
    if team_id is None:
        return
    team_ids = user_team_ids(db, user_id)
    if team_id not in team_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of that team",
        )


def scoped_query(
    model,
    db: Session,
    user_id: int,
) -> Select:
    team_ids = user_team_ids(db, user_id)
    q = select(model).where(model.owner_user_id == user_id)
    if team_ids:
        q = q.union_all(
            select(model).where(
                model.visibility == "team",  # SQLAlchemy enum stores value string.
                model.team_id.in_(team_ids),
            )
        )
    return q


def get_accessible_gameplan(db: Session, user_id: int, gameplan_id: int) -> Gameplan | None:
    team_ids = user_team_ids(db, user_id)
    return db.scalar(
        select(Gameplan).where(
            Gameplan.id == gameplan_id,
            or_(
                Gameplan.owner_user_id == user_id,
                (Gameplan.visibility == Visibility.team) & (Gameplan.team_id.in_(team_ids or [-1])),
            ),
        )
    )


def get_accessible_opponent(db: Session, user_id: int, opponent_id: int) -> OpponentProfile | None:
    team_ids = user_team_ids(db, user_id)
    return db.scalar(
        select(OpponentProfile).where(
            OpponentProfile.id == opponent_id,
            or_(
                OpponentProfile.owner_user_id == user_id,
                (OpponentProfile.visibility == Visibility.team)
                & (OpponentProfile.team_id.in_(team_ids or [-1])),
            ),
        )
    )

