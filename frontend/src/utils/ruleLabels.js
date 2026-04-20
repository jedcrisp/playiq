/** Human-readable labels for engine rule ids returned by the API. */
const LABELS = {
  default_pack: "Balanced progression (default)",
  cover3_rotation: "Cover 3 — rotation timing",
  cover2_mike: "Cover 2 — conflict Mike",
  man_weak_db: "Man coverage — DB leverage",
  cover4_boundary_corner: "Quarters — flat conflict",
  blitz_quick_game: "Blitz — quick game",
  play_action_vs_biter: "Play action — linebacker keys",
  nickel_slow_space: "Nickel — space matchup",
  two_man_robber_shell: "2-Man / Robber — man answers",
  match_quarters_family: "Match quarters / Palms — pattern match",
  cover6_shell: "Cover 6 — split-field stress",
  rotation_heavy: "Rotation-heavy shell — movement answers",
  fire_zone: "Fire zone — hot game & screens",
  pro_run_complements: "Pro / balanced — run complements",
  slot_isolation_air: "Spread / Air Raid — slot isolation",
};

export function formatMatchedRule(ruleId) {
  if (!ruleId) return "";
  return LABELS[ruleId] || ruleId.replace(/_/g, " ");
}
