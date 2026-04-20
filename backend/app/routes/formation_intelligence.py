from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import User
from ..schemas import FormationIntelligenceResponse
from ..services.access import user_team_ids
from ..services.analytics_service import fetch_filtered_plays
from ..services.formation_intelligence_service import build_formation_intelligence

router = APIRouter(prefix="/api/formation-intelligence", tags=["formation-intelligence"])


@router.get("", response_model=FormationIntelligenceResponse)
def get_formation_intelligence(
    scope: str = "all",
    opponent_profile_id: int | None = None,
    game_label: str | None = None,
    down: int | None = None,
    distance_bucket: str | None = None,
    field_zone: str | None = None,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> FormationIntelligenceResponse:
    team_ids = user_team_ids(db, current.id)
    side = None
    if scope == "opponent":
        side = "defense"
    elif scope == "self":
        side = "self"
    plays = fetch_filtered_plays(
        db,
        {
            "opponent_profile_id": opponent_profile_id,
            "game_label": game_label,
            "down": down,
            "distance_bucket": distance_bucket,
            "field_zone": field_zone,
            "side": side,
        },
        user_id=current.id,
        team_ids=team_ids,
    )
    return FormationIntelligenceResponse(**build_formation_intelligence(plays))
