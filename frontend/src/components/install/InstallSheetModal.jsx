import InstallSheetView from "./InstallSheetView.jsx";
import { formatMatchedRule } from "../../utils/ruleLabels.js";

function formatDefensiveSnapshot(inputs) {
  if (!inputs) return "";
  const a = [
    inputs.defensive_front,
    inputs.coverage_shell,
    inputs.pressure_tendency,
  ]
    .filter(Boolean)
    .join(" · ");
  const b = [
    inputs.defender_to_attack,
    inputs.weakness_type,
    inputs.offensive_style,
  ]
    .filter(Boolean)
    .join(" · ");
  return [a, b].filter(Boolean).join(" — ");
}

export default function InstallSheetModal({
  open,
  onClose,
  conceptItem,
  result,
  inputs,
  gameplanName,
  gameplanNotes,
  diagrams,
}) {
  if (!open || !conceptItem) return null;

  const matchedRuleLabel = formatMatchedRule(result?.matched_rule || "");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-zinc-950/50 p-4 backdrop-blur-[2px] print:static print:overflow-visible print:bg-transparent print:p-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-sheet-dialog-title"
    >
      <div className="my-6 w-full max-w-4xl print:my-0 print:max-w-none">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <h2 id="install-sheet-dialog-title" className="font-display text-lg font-semibold text-white">
            Install sheet
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow"
            >
              Print install sheet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/30 bg-transparent px-4 py-2 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>

        <InstallSheetView
          conceptItem={conceptItem}
          gameplanName={gameplanName}
          gameplanNotes={gameplanNotes}
          matchedRuleLabel={matchedRuleLabel}
          diagrams={diagrams}
          defensiveSnapshot={formatDefensiveSnapshot(inputs)}
        />
      </div>
    </div>
  );
}
