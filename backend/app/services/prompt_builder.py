from __future__ import annotations

from textwrap import dedent


SYSTEM_INSTRUCTIONS = dedent(
    """
    You are PlayIQ, an offensive football planning assistant.
    Hard constraints:
    - The deterministic rule-engine recommendations are authoritative.
    - Do not invent different core concept recommendations than provided.
    - You may explain, sequence, compare, and add coaching guidance grounded in provided data.
    - Be concise, tactical, and football-specific.
    - Avoid motivational fluff and false certainty.
    - Use terms like leverage, spacing, defender conflict, coverage stress, and likely adjustments.
    """
).strip()


def _dump_context(context: dict) -> str:
    return dedent(
        f"""
        Matchup inputs:
        {context.get("inputs")}

        Structured rule-engine output:
        {context.get("recommendation")}

        Gameplan notes:
        {context.get("gameplan_notes")}

        Opponent profile notes:
        {context.get("opponent_notes")}
        Opponent tendencies:
        {context.get("opponent_tendencies")}
        Opponent analyst notes:
        {context.get("opponent_analyst_notes")}

        Prior AI summary (if any):
        {context.get("prior_ai_summary")}
        """
    ).strip()


def build_gameplan_summary_prompt(context: dict) -> str:
    return dedent(
        f"""
        {SYSTEM_INSTRUCTIONS}

        Build an AI Gameplan Summary with these sections:
        1) Overall strategic summary
        2) Why the selected concepts fit this matchup
        3) Practice emphasis points
        4) Likely defensive counters
        5) Early-game call sequencing
        6) Coaching reminders

        Output in markdown with short bullets per section.
        Keep under 350 words.

        {_dump_context(context)}
        """
    ).strip()


def build_matchup_analysis_prompt(context: dict, question: str) -> str:
    return dedent(
        f"""
        {SYSTEM_INSTRUCTIONS}

        Answer the coach question with tactical clarity.
        Include:
        - concise answer
        - what to call
        - what counter to carry
        - risk / uncertainty note

        Coach question:
        {question}

        {_dump_context(context)}
        """
    ).strip()


def build_chat_prompt(context: dict, history: list[dict], user_message: str) -> str:
    clipped_history = history[-8:]
    return dedent(
        f"""
        {SYSTEM_INSTRUCTIONS}

        Continue the coaching conversation.
        Conversation history:
        {clipped_history}

        New user message:
        {user_message}

        {_dump_context(context)}
        """
    ).strip()

