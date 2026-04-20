from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field


class RecommendRequest(BaseModel):
    defensive_front: str = Field(..., description="Defensive front family")
    coverage_shell: str
    pressure_tendency: str
    defender_to_attack: str
    weakness_type: str
    offensive_style: str


class ConceptResponse(BaseModel):
    rank: int
    concept: str
    why_it_works: str
    stresses_defender: str = ""
    space_leverage: str = ""
    ideal_down_distance: str = ""
    formation: str
    motion: str
    likely_defensive_adjustment: str = ""
    expected_adjustment: str
    counter: str
    counter_recommendation: str = ""
    coaching_point: str = ""
    coaching_note: str = ""


class RecommendResponse(BaseModel):
    matched_rule: str
    strategic_summary: str = ""
    recommendations: list[ConceptResponse]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=120)


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleSignInRequest(BaseModel):
    id_token: str = Field(min_length=10)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamCreate(BaseModel):
    name: str = Field(min_length=2, max_length=140)


class TeamJoin(BaseModel):
    team_id: int
    role: Literal["admin", "coach"] = "coach"


class TeamOut(BaseModel):
    id: int
    name: str
    owner_user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TeamMembershipOut(BaseModel):
    id: int
    user_id: int
    team_id: int
    role: Literal["admin", "coach"]
    created_at: datetime

    model_config = {"from_attributes": True}


class GameplanBase(BaseModel):
    name: str
    visibility: Literal["private", "team"] = "private"
    team_id: int | None = None
    inputs: dict[str, Any]
    recommendation: dict[str, Any]
    notes: dict[str, Any] = Field(default_factory=lambda: {"scouting": "", "coaching": "", "emphasis": ""})


class GameplanCreate(GameplanBase):
    pass


class GameplanUpdate(BaseModel):
    name: str | None = None
    visibility: Literal["private", "team"] | None = None
    team_id: int | None = None
    inputs: dict[str, Any] | None = None
    recommendation: dict[str, Any] | None = None
    notes: dict[str, Any] | None = None


class GameplanOut(BaseModel):
    id: int
    owner_user_id: int
    team_id: int | None
    name: str
    visibility: Literal["private", "team"]
    inputs: dict[str, Any]
    recommendation: dict[str, Any]
    notes: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OpponentBase(BaseModel):
    opponent_name: str
    team_level: str = ""
    notes: str = ""
    visibility: Literal["private", "team"] = "private"
    team_id: int | None = None
    tendencies: dict[str, Any] = Field(default_factory=dict)
    analyst_notes: dict[str, Any] = Field(default_factory=dict)


class OpponentCreate(OpponentBase):
    pass


class OpponentUpdate(BaseModel):
    opponent_name: str | None = None
    team_level: str | None = None
    notes: str | None = None
    visibility: Literal["private", "team"] | None = None
    team_id: int | None = None
    tendencies: dict[str, Any] | None = None
    analyst_notes: dict[str, Any] | None = None


class OpponentOut(BaseModel):
    id: int
    owner_user_id: int
    team_id: int | None
    opponent_name: str
    team_level: str
    notes: str
    visibility: Literal["private", "team"]
    tendencies: dict[str, Any]
    analyst_notes: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DiagramBase(BaseModel):
    name: str
    play_name: str = ""
    linked_concept_name: str | None = None
    linked_gameplan_id: int | None = None
    linked_opponent_profile_id: int | None = None
    linked_call_sheet_rank: int | None = None
    install_note: str = ""
    visibility: Literal["private", "team"] = "private"
    team_id: int | None = None
    canvas: dict[str, Any] = Field(default_factory=dict)


class DiagramCreate(DiagramBase):
    pass


class DiagramUpdate(BaseModel):
    name: str | None = None
    play_name: str | None = None
    linked_concept_name: str | None = None
    linked_gameplan_id: int | None = None
    linked_opponent_profile_id: int | None = None
    linked_call_sheet_rank: int | None = None
    install_note: str | None = None
    visibility: Literal["private", "team"] | None = None
    team_id: int | None = None
    canvas: dict[str, Any] | None = None


class DiagramOut(BaseModel):
    id: int
    owner_user_id: int
    team_id: int | None
    name: str
    play_name: str
    linked_concept_name: str | None
    linked_gameplan_id: int | None
    linked_opponent_profile_id: int | None
    linked_call_sheet_rank: int | None
    install_note: str
    visibility: Literal["private", "team"]
    canvas: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NoteCreate(BaseModel):
    entity_type: Literal["gameplan", "opponent", "diagram"]
    entity_id: int
    content: str
    team_id: int | None = None


class NoteUpdate(BaseModel):
    content: str


class NoteOut(BaseModel):
    id: int
    owner_user_id: int
    team_id: int | None
    entity_type: str
    entity_id: int
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AIGenerateSummaryRequest(BaseModel):
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    inputs: dict[str, Any] = Field(default_factory=dict)
    recommendation: dict[str, Any] = Field(default_factory=dict)
    save_to_gameplan: bool = True


class AIGenerateSummaryResponse(BaseModel):
    id: int | None = None
    content: str
    model_name: str
    created_at: datetime | None = None


class AIMatchupAnalysisRequest(BaseModel):
    question: str = Field(min_length=5, max_length=2000)
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    inputs: dict[str, Any] = Field(default_factory=dict)
    recommendation: dict[str, Any] = Field(default_factory=dict)
    save: bool = True


class AIMatchupAnalysisResponse(BaseModel):
    id: int | None = None
    answer: str
    model_name: str
    created_at: datetime | None = None


class AIChatMessageIn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AIChatRequest(BaseModel):
    session_id: int | None = None
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    inputs: dict[str, Any] = Field(default_factory=dict)
    recommendation: dict[str, Any] = Field(default_factory=dict)
    user_message: str = Field(min_length=2, max_length=4000)
    history: list[AIChatMessageIn] = Field(default_factory=list)


class AIChatMessageOut(BaseModel):
    id: int
    session_id: int
    role: Literal["user", "assistant"]
    content: str
    model_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AIChatResponse(BaseModel):
    session_id: int
    assistant_message: AIChatMessageOut


class ScoutingPlayBase(BaseModel):
    team_id: int | None = None
    opponent_profile_id: int | None = None
    source_type: Literal["manual", "csv"] = "manual"
    game_label: str = ""
    side: Literal["offense", "defense", "self"] = "defense"
    down: int = Field(ge=1, le=4)
    distance_bucket: str = ""
    field_zone: str = ""
    hash: str = ""
    personnel: str = ""
    formation: str = ""
    motion: str = ""
    defensive_front: str = ""
    coverage_shell: str = ""
    pressure_type: str = ""
    concept_name: str = ""
    yards: int = 0
    explosive: bool = False
    success: bool = False
    play_type: Literal["run", "pass", "other"] = "pass"
    result_notes: str = ""
    tags: str = ""


class ScoutingPlayCreate(ScoutingPlayBase):
    pass


class ScoutingPlayUpdate(BaseModel):
    opponent_profile_id: int | None = None
    game_label: str | None = None
    side: Literal["offense", "defense", "self"] | None = None
    down: int | None = Field(default=None, ge=1, le=4)
    distance_bucket: str | None = None
    field_zone: str | None = None
    hash: str | None = None
    personnel: str | None = None
    formation: str | None = None
    motion: str | None = None
    defensive_front: str | None = None
    coverage_shell: str | None = None
    pressure_type: str | None = None
    concept_name: str | None = None
    yards: int | None = None
    explosive: bool | None = None
    success: bool | None = None
    play_type: Literal["run", "pass", "other"] | None = None
    result_notes: str | None = None
    tags: str | None = None


class ScoutingPlayOut(ScoutingPlayBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CSVImportResponse(BaseModel):
    inserted: int
    errors: list[str]


class AnalyticsResponse(BaseModel):
    sample_size: int
    front_frequency: list[dict[str, Any]] = Field(default_factory=list)
    coverage_frequency: list[dict[str, Any]] = Field(default_factory=list)
    pressure_frequency: list[dict[str, Any]] = Field(default_factory=list)
    coverage_by_down_distance: list[dict[str, Any]] = Field(default_factory=list)
    pressure_by_field_zone: list[dict[str, Any]] = Field(default_factory=list)
    explosive_by_coverage: list[dict[str, Any]] = Field(default_factory=list)
    success_by_coverage: list[dict[str, Any]] = Field(default_factory=list)
    explosive_by_concept: list[dict[str, Any]] = Field(default_factory=list)
    top_concepts: list[dict[str, Any]] = Field(default_factory=list)
    top_formations: list[dict[str, Any]] = Field(default_factory=list)
    motion_usage: list[dict[str, Any]] = Field(default_factory=list)
    play_type_mix: list[dict[str, Any]] = Field(default_factory=list)
    success_by_concept: list[dict[str, Any]] = Field(default_factory=list)
    success_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    insights: list[str] = Field(default_factory=list)


class ReportNoteCreate(BaseModel):
    report_type: Literal["opponent", "self_scout", "dataset"]
    scope_id: int | None = None
    title: str = ""
    content: str
    tags: str = ""


class ReportNoteOut(BaseModel):
    id: int
    team_id: int | None
    owner_user_id: int
    report_type: str
    scope_id: int | None
    title: str
    content: str
    tags: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FormationIntelligenceResponse(BaseModel):
    sample_size: int
    formation_frequency: list[dict[str, Any]] = Field(default_factory=list)
    defense_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    pressure_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    explosive_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    success_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    concept_usage_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    run_pass_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    motion_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    down_distance_by_formation: list[dict[str, Any]] = Field(default_factory=list)
    insights: list[str] = Field(default_factory=list)


class ScriptBase(BaseModel):
    team_id: int | None = None
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    name: str
    week_label: str = ""
    total_planned_calls: int = Field(default=15, ge=1, le=40)
    notes: str = ""


class ScriptCreate(ScriptBase):
    pass


class ScriptUpdate(BaseModel):
    team_id: int | None = None
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    name: str | None = None
    week_label: str | None = None
    total_planned_calls: int | None = Field(default=None, ge=1, le=40)
    notes: str | None = None


class ScriptOut(ScriptBase):
    id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScriptEntryBase(BaseModel):
    position: int = Field(default=1, ge=1, le=99)
    play_name: str = ""
    formation: str = ""
    motion: str = ""
    objective_tag: str = ""
    target_defensive_look: str = ""
    why_included: str = ""
    expected_defensive_reaction: str = ""
    next_call: str = ""
    notes: str = ""


class ScriptEntryCreate(ScriptEntryBase):
    pass


class ScriptEntryUpdate(BaseModel):
    position: int | None = Field(default=None, ge=1, le=99)
    play_name: str | None = None
    formation: str | None = None
    motion: str | None = None
    objective_tag: str | None = None
    target_defensive_look: str | None = None
    why_included: str | None = None
    expected_defensive_reaction: str | None = None
    next_call: str | None = None
    notes: str | None = None


class ScriptEntryOut(ScriptEntryBase):
    id: int
    script_id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ScriptReorderRequest(BaseModel):
    entry_ids: list[int] = Field(default_factory=list)


class SituationPlanBase(BaseModel):
    team_id: int | None = None
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    title: str
    situation_type: str
    alerts_risks: str = ""
    expected_defensive_tendencies: str = ""
    best_counters: str = ""
    coaching_note: str = ""


class SituationPlanCreate(SituationPlanBase):
    pass


class SituationPlanUpdate(BaseModel):
    team_id: int | None = None
    gameplan_id: int | None = None
    opponent_profile_id: int | None = None
    title: str | None = None
    situation_type: str | None = None
    alerts_risks: str | None = None
    expected_defensive_tendencies: str | None = None
    best_counters: str | None = None
    coaching_note: str | None = None


class SituationPlanOut(SituationPlanBase):
    id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SituationPlanCallBase(BaseModel):
    priority: int = Field(default=1, ge=1, le=99)
    concept_name: str = ""
    formation: str = ""
    motion: str = ""
    linked_diagram_id: int | None = None
    note: str = ""


class SituationPlanCallCreate(SituationPlanCallBase):
    pass


class SituationPlanCallUpdate(BaseModel):
    priority: int | None = Field(default=None, ge=1, le=99)
    concept_name: str | None = None
    formation: str | None = None
    motion: str | None = None
    linked_diagram_id: int | None = None
    note: str | None = None


class SituationPlanCallOut(SituationPlanCallBase):
    id: int
    situation_plan_id: int
    owner_user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
