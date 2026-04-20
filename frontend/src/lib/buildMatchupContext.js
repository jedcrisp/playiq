const emptyNotes = () => ({ scouting: "", coaching: "", emphasis: "" });

/**
 * Build AI prompt context from planner + Firestore-backed entities (no Postgres).
 */
export function buildMatchupContext(values, result, savedGameplans, activeGameplan, opponents, activeOpponent) {
  const gp =
    activeGameplan?.id != null ? savedGameplans.find((g) => g.id === activeGameplan.id) : null;
  const opp =
    activeOpponent?.id != null ? opponents.find((o) => o.id === activeOpponent.id) : null;

  let prior = "";
  const ai = gp?.aiSummary ?? gp?.ai_summary;
  if (ai) {
    if (typeof ai === "string") prior = ai;
    else if (typeof ai?.content === "string") prior = ai.content;
  }

  return {
    inputs: values || {},
    recommendation: result || {},
    gameplan_notes: gp?.notes || emptyNotes(),
    opponent_notes: opp?.notes || "",
    opponent_tendencies: opp?.tendencies || {},
    opponent_analyst_notes: opp?.analystNotes || {},
    prior_ai_summary: prior,
  };
}
