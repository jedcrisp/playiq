from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import AISummary, AnalysisQuery, ChatMessage, ChatSession, User
from ..schemas import (
    AIChatRequest,
    AIChatResponse,
    AIChatMessageOut,
    AIGenerateSummaryRequest,
    AIGenerateSummaryResponse,
    AIMatchupAnalysisRequest,
    AIMatchupAnalysisResponse,
)
from ..services.ai_service import AIService
from ..services.context_builder import build_matchup_context
from ..services.prompt_builder import (
    build_chat_prompt,
    build_gameplan_summary_prompt,
    build_matchup_analysis_prompt,
)
from ..services.access import get_accessible_gameplan, get_accessible_opponent

router = APIRouter(prefix="/api/ai", tags=["ai"])
ai = AIService()


@router.post("/summary", response_model=AIGenerateSummaryResponse)
def generate_summary(
    body: AIGenerateSummaryRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AIGenerateSummaryResponse:
    gp = (
        get_accessible_gameplan(db, current.id, body.gameplan_id)
        if body.gameplan_id
        else None
    )
    if body.gameplan_id and not gp:
        raise HTTPException(status_code=404, detail="Gameplan not found")
    opp = (
        get_accessible_opponent(db, current.id, body.opponent_profile_id)
        if body.opponent_profile_id
        else None
    )
    if body.opponent_profile_id and not opp:
        raise HTTPException(status_code=404, detail="Opponent profile not found")
    context = build_matchup_context(
        db=db,
        gameplan_id=gp.id if gp else body.gameplan_id,
        opponent_profile_id=opp.id if opp else body.opponent_profile_id,
        inputs=body.inputs,
        recommendation=body.recommendation,
        gameplan=gp,
        opponent=opp,
    )
    prompt = build_gameplan_summary_prompt(context)
    content, model_name = ai.generate(prompt, fallback_hint="Generate a tactical gameplan summary.")
    row = None
    if body.save_to_gameplan:
        row = AISummary(
            owner_user_id=current.id,
            team_id=gp.team_id if gp else None,
            gameplan_id=gp.id if gp else body.gameplan_id,
            content=content,
            model_name=model_name,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return AIGenerateSummaryResponse(
        id=row.id if row else None,
        content=content,
        model_name=model_name,
        created_at=row.created_at if row else None,
    )


@router.post("/analysis", response_model=AIMatchupAnalysisResponse)
def matchup_analysis(
    body: AIMatchupAnalysisRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AIMatchupAnalysisResponse:
    gp = (
        get_accessible_gameplan(db, current.id, body.gameplan_id)
        if body.gameplan_id
        else None
    )
    if body.gameplan_id and not gp:
        raise HTTPException(status_code=404, detail="Gameplan not found")
    opp = (
        get_accessible_opponent(db, current.id, body.opponent_profile_id)
        if body.opponent_profile_id
        else None
    )
    if body.opponent_profile_id and not opp:
        raise HTTPException(status_code=404, detail="Opponent profile not found")
    context = build_matchup_context(
        db=db,
        gameplan_id=gp.id if gp else body.gameplan_id,
        opponent_profile_id=opp.id if opp else body.opponent_profile_id,
        inputs=body.inputs,
        recommendation=body.recommendation,
        gameplan=gp,
        opponent=opp,
    )
    prompt = build_matchup_analysis_prompt(context, body.question)
    answer, model_name = ai.generate(prompt, fallback_hint="Answer matchup question with call + counter.")
    row = None
    if body.save:
        row = AnalysisQuery(
            owner_user_id=current.id,
            team_id=(gp.team_id if gp else (opp.team_id if opp else None)),
            gameplan_id=gp.id if gp else body.gameplan_id,
            opponent_profile_id=opp.id if opp else body.opponent_profile_id,
            question=body.question,
            answer=answer,
            model_name=model_name,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return AIMatchupAnalysisResponse(
        id=row.id if row else None,
        answer=answer,
        model_name=model_name,
        created_at=row.created_at if row else None,
    )


@router.post("/chat", response_model=AIChatResponse)
def coaching_chat(
    body: AIChatRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> AIChatResponse:
    if body.session_id:
        session = db.get(ChatSession, body.session_id)
        if not session or session.owner_user_id != current.id:
            raise HTTPException(status_code=404, detail="Chat session not found")
    else:
        gp = (
            get_accessible_gameplan(db, current.id, body.gameplan_id)
            if body.gameplan_id
            else None
        )
        if body.gameplan_id and not gp:
            raise HTTPException(status_code=404, detail="Gameplan not found")
        opp = (
            get_accessible_opponent(db, current.id, body.opponent_profile_id)
            if body.opponent_profile_id
            else None
        )
        if body.opponent_profile_id and not opp:
            raise HTTPException(status_code=404, detail="Opponent profile not found")
        session = ChatSession(
            owner_user_id=current.id,
            team_id=(gp.team_id if gp else (opp.team_id if opp else None)),
            gameplan_id=gp.id if gp else body.gameplan_id,
            opponent_profile_id=opp.id if opp else body.opponent_profile_id,
            title="Coaching Assistant",
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    gp = (
        get_accessible_gameplan(db, current.id, body.gameplan_id or session.gameplan_id)
        if (body.gameplan_id or session.gameplan_id)
        else None
    )
    opp = (
        get_accessible_opponent(db, current.id, body.opponent_profile_id or session.opponent_profile_id)
        if (body.opponent_profile_id or session.opponent_profile_id)
        else None
    )
    context = build_matchup_context(
        db=db,
        gameplan_id=gp.id if gp else (body.gameplan_id or session.gameplan_id),
        opponent_profile_id=opp.id if opp else (body.opponent_profile_id or session.opponent_profile_id),
        inputs=body.inputs,
        recommendation=body.recommendation,
        gameplan=gp,
        opponent=opp,
    )
    user_row = ChatMessage(
        session_id=session.id,
        owner_user_id=current.id,
        role="user",
        content=body.user_message,
        model_name="user",
    )
    db.add(user_row)
    db.commit()
    db.refresh(user_row)

    prompt = build_chat_prompt(
        context,
        [{"role": m.role, "content": m.content} for m in body.history],
        body.user_message,
    )
    assistant_text, model_name = ai.generate(prompt, fallback_hint="Provide concise tactical coaching answer.")
    assistant_row = ChatMessage(
        session_id=session.id,
        owner_user_id=current.id,
        role="assistant",
        content=assistant_text,
        model_name=model_name,
    )
    db.add(assistant_row)
    db.commit()
    db.refresh(assistant_row)
    return AIChatResponse(
        session_id=session.id,
        assistant_message=AIChatMessageOut.model_validate(assistant_row),
    )

