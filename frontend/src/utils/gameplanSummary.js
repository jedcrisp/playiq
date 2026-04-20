/**
 * One-line summary for saved gameplan rows, e.g. "Cover 3 • Mike LB • Spread".
 */
export function formatGameplanSummary(inputs) {
  if (!inputs || typeof inputs !== "object") return "—";
  const coverage = inputs.coverage_shell || "—";
  const defender = shortenDefender(inputs.defender_to_attack);
  const style = inputs.offensive_style || "—";
  return [coverage, defender, style].join(" • ");
}

const DEFENDER_SHORT = {
  "Mike linebacker": "Mike LB",
  "Will linebacker": "Will LB",
  "Sam linebacker": "Sam LB",
  "Boundary corner": "Boundary CB",
  "Field corner": "Field CB",
  Nickel: "Nickel",
  "Strong safety": "Strong S",
  "Free safety": "Free S",
  "Edge defender": "Edge",
};

function shortenDefender(label) {
  if (!label || typeof label !== "string") return "—";
  return DEFENDER_SHORT[label] ?? label;
}
