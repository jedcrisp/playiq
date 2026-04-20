from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class TeamRole(str, Enum):
    admin = "admin"
    coach = "coach"


class Visibility(str, Enum):
    private = "private"
    team = "team"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Team(Base):
    __tablename__ = "teams"
    __table_args__ = (UniqueConstraint("owner_user_id", "name", name="uq_team_owner_name"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(140), index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    owner = relationship("User")


class TeamMembership(Base):
    __tablename__ = "team_memberships"
    __table_args__ = (UniqueConstraint("user_id", "team_id", name="uq_team_membership"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), index=True)
    role: Mapped[TeamRole] = mapped_column(SAEnum(TeamRole), default=TeamRole.coach)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    team = relationship("Team")


class Gameplan(Base):
    __tablename__ = "gameplans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    visibility: Mapped[Visibility] = mapped_column(SAEnum(Visibility), default=Visibility.private)
    inputs_json: Mapped[dict] = mapped_column(JSONB)
    recommendation_json: Mapped[dict] = mapped_column(JSONB)
    notes_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class OpponentProfile(Base):
    __tablename__ = "opponent_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    opponent_name: Mapped[str] = mapped_column(String(180))
    team_level: Mapped[str] = mapped_column(String(80), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    visibility: Mapped[Visibility] = mapped_column(SAEnum(Visibility), default=Visibility.private)
    tendencies_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    analyst_notes_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Diagram(Base):
    __tablename__ = "diagrams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    play_name: Mapped[str] = mapped_column(String(180), default="")
    linked_concept_name: Mapped[str | None] = mapped_column(String(180), nullable=True)
    linked_gameplan_id: Mapped[int | None] = mapped_column(
        ForeignKey("gameplans.id"), nullable=True, index=True
    )
    linked_opponent_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("opponent_profiles.id"), nullable=True, index=True
    )
    linked_call_sheet_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    install_note: Mapped[str] = mapped_column(Text, default="")
    visibility: Mapped[Visibility] = mapped_column(SAEnum(Visibility), default=Visibility.private)
    canvas_json: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    entity_type: Mapped[str] = mapped_column(String(40), index=True)  # gameplan|opponent|diagram
    entity_id: Mapped[int] = mapped_column(Integer, index=True)
    content: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class AISummary(Base):
    __tablename__ = "ai_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    gameplan_id: Mapped[int | None] = mapped_column(ForeignKey("gameplans.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(180), default="AI Gameplan Summary")
    content: Mapped[str] = mapped_column(Text)
    model_name: Mapped[str] = mapped_column(String(120), default="mock")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class AnalysisQuery(Base):
    __tablename__ = "analysis_queries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    gameplan_id: Mapped[int | None] = mapped_column(ForeignKey("gameplans.id"), nullable=True, index=True)
    opponent_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("opponent_profiles.id"), nullable=True, index=True
    )
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    model_name: Mapped[str] = mapped_column(String(120), default="mock")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    gameplan_id: Mapped[int | None] = mapped_column(ForeignKey("gameplans.id"), nullable=True, index=True)
    opponent_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("opponent_profiles.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(180), default="Coaching Assistant Session")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"), index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    role: Mapped[str] = mapped_column(String(20))  # user|assistant|system
    content: Mapped[str] = mapped_column(Text)
    model_name: Mapped[str] = mapped_column(String(120), default="mock")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ScoutingPlay(Base):
    __tablename__ = "scouting_plays"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    opponent_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("opponent_profiles.id"), nullable=True, index=True
    )
    source_type: Mapped[str] = mapped_column(String(20), default="manual")  # manual|csv
    game_label: Mapped[str] = mapped_column(String(120), default="")
    side: Mapped[str] = mapped_column(String(20), default="defense")  # offense|defense|self
    down: Mapped[int] = mapped_column(Integer, default=1)
    distance_bucket: Mapped[str] = mapped_column(String(40), default="")
    field_zone: Mapped[str] = mapped_column(String(60), default="")
    hash: Mapped[str] = mapped_column(String(20), default="")
    personnel: Mapped[str] = mapped_column(String(40), default="")
    formation: Mapped[str] = mapped_column(String(60), default="")
    motion: Mapped[str] = mapped_column(String(80), default="")
    defensive_front: Mapped[str] = mapped_column(String(60), default="")
    coverage_shell: Mapped[str] = mapped_column(String(60), default="")
    pressure_type: Mapped[str] = mapped_column(String(60), default="")
    concept_name: Mapped[str] = mapped_column(String(120), default="")
    yards: Mapped[int] = mapped_column(Integer, default=0)
    explosive: Mapped[bool] = mapped_column(default=False)
    success: Mapped[bool] = mapped_column(default=False)
    play_type: Mapped[str] = mapped_column(String(20), default="pass")  # run|pass|other
    result_notes: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[str] = mapped_column(String(255), default="")
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ReportNote(Base):
    __tablename__ = "report_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    report_type: Mapped[str] = mapped_column(String(40), index=True)  # opponent|self_scout|dataset
    scope_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(160), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Script(Base):
    __tablename__ = "scripts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    gameplan_id: Mapped[int | None] = mapped_column(ForeignKey("gameplans.id"), nullable=True, index=True)
    opponent_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("opponent_profiles.id"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String(180))
    week_label: Mapped[str] = mapped_column(String(120), default="")
    total_planned_calls: Mapped[int] = mapped_column(Integer, default=15)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ScriptEntry(Base):
    __tablename__ = "script_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    script_id: Mapped[int] = mapped_column(ForeignKey("scripts.id"), index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=1, index=True)
    play_name: Mapped[str] = mapped_column(String(180), default="")
    formation: Mapped[str] = mapped_column(String(80), default="")
    motion: Mapped[str] = mapped_column(String(80), default="")
    objective_tag: Mapped[str] = mapped_column(String(40), default="")
    target_defensive_look: Mapped[str] = mapped_column(String(120), default="")
    why_included: Mapped[str] = mapped_column(Text, default="")
    expected_defensive_reaction: Mapped[str] = mapped_column(Text, default="")
    next_call: Mapped[str] = mapped_column(String(180), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class SituationPlan(Base):
    __tablename__ = "situation_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    team_id: Mapped[int | None] = mapped_column(ForeignKey("teams.id"), nullable=True, index=True)
    gameplan_id: Mapped[int | None] = mapped_column(ForeignKey("gameplans.id"), nullable=True, index=True)
    opponent_profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("opponent_profiles.id"), nullable=True, index=True
    )
    title: Mapped[str] = mapped_column(String(180))
    situation_type: Mapped[str] = mapped_column(String(60), index=True)
    alerts_risks: Mapped[str] = mapped_column(Text, default="")
    expected_defensive_tendencies: Mapped[str] = mapped_column(Text, default="")
    best_counters: Mapped[str] = mapped_column(Text, default="")
    coaching_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class SituationPlanCall(Base):
    __tablename__ = "situation_plan_calls"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    situation_plan_id: Mapped[int] = mapped_column(ForeignKey("situation_plans.id"), index=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    priority: Mapped[int] = mapped_column(Integer, default=1, index=True)
    concept_name: Mapped[str] = mapped_column(String(180), default="")
    formation: Mapped[str] = mapped_column(String(80), default="")
    motion: Mapped[str] = mapped_column(String(80), default="")
    linked_diagram_id: Mapped[int | None] = mapped_column(
        ForeignKey("diagrams.id"), nullable=True, index=True
    )
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

