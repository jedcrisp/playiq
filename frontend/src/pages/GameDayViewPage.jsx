import PrintableGameDaySheet from "../components/gameDay/PrintableGameDaySheet.jsx";

export default function GameDayViewPage({
  activeOpponent,
  observedTendencySummary,
  result,
  selectedScriptEntries,
  situationPlans,
  diagrams,
}) {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl print:hidden">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Game day view</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Weekly plan to sideline sheet
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Fast scan of tendencies, recommendations, opening script, and situational menu for game-day execution.
        </p>
      </div>
      <div className="print:hidden">
        <button type="button" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white" onClick={() => window.print()}>
          Print game day sheet
        </button>
      </div>
      <PrintableGameDaySheet
        opponent={activeOpponent}
        tendencySummary={observedTendencySummary}
        recommendation={result}
        scriptEntries={selectedScriptEntries}
        situationPlans={situationPlans}
        diagrams={diagrams}
      />
    </div>
  );
}
