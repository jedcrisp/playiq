/**
 * Dropdown option catalog (mirrors recommendation_engine/options.py).
 * Kept client-side so the planner works without a separate API host.
 */
export const INPUT_OPTIONS = {
  defensive_front: ["4-3", "3-4", "4-2-5", "3-3-5", "Multiple / Hybrid"],
  coverage_shell: [
    "Cover 1",
    "Cover 2",
    "Cover 3",
    "Cover 4 / Quarters",
    "Cover 6",
    "Match Quarters",
    "Palms",
    "2-Man",
    "Robber",
    "Fire Zone",
    "Tampa 2",
    "Man Free",
    "Unknown / Mixed",
    "Mixed / Rotation-heavy",
  ],
  pressure_tendency: ["Four-man rush", "Blitz-heavy", "Sim pressure", "Edge pressure", "Unknown"],
  defender_to_attack: [
    "Mike linebacker",
    "Will linebacker",
    "Sam linebacker",
    "Boundary corner",
    "Field corner",
    "Nickel",
    "Strong safety",
    "Free safety",
    "Edge defender",
  ],
  weakness_type: [
    "Slow in space",
    "Bites on play action",
    "Jumps underneath routes",
    "Poor tackler",
    "Late to rotate",
    "Overaggressive",
    "Struggles in man coverage",
    "Struggles in zone drops",
  ],
  offensive_style: ["Spread", "Air Raid", "Pro Style", "RPO", "West Coast", "Balanced"],
};

export function fetchOptions() {
  return Promise.resolve(INPUT_OPTIONS);
}
