import GameDaySummaryPanel from "./GameDaySummaryPanel.jsx";

export default function PrintableGameDaySheet({
  opponent,
  tendencySummary,
  recommendation,
  scriptEntries,
  situationPlans,
  diagrams,
}) {
  return (
    <div id="print-game-day-sheet" className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6">
      <header className="border-b border-dashed border-zinc-300 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700">PlayIQ game day</p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">Game-Day Workflow Sheet</h2>
        <p className="text-xs text-zinc-600">Opponent: {opponent?.name || "Not selected"}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <GameDaySummaryPanel title="Top defensive tendencies">
          <p className="text-xs">Sample: {tendencySummary?.sample_size || 0} snaps</p>
          <p className="mt-1 text-xs">
            Coverages: {(tendencySummary?.top_coverages || []).map((x) => `${x.label} ${x.pct}%`).join(", ") || "—"}
          </p>
          <p className="mt-1 text-xs">
            Pressures: {(tendencySummary?.top_pressures || []).map((x) => `${x.label} ${x.pct}%`).join(", ") || "—"}
          </p>
        </GameDaySummaryPanel>
        <GameDaySummaryPanel title="Top recommended concepts">
          <ul className="space-y-1 text-xs">
            {(recommendation?.recommendations || []).slice(0, 5).map((rec) => (
              <li key={rec.rank}>
                #{rec.rank} {rec.concept} - {rec.formation} / {rec.motion}
              </li>
            ))}
            {!recommendation?.recommendations?.length ? <li>No recommendation loaded.</li> : null}
          </ul>
        </GameDaySummaryPanel>
      </div>

      <GameDaySummaryPanel title="Opening script">
        <ol className="space-y-1 text-xs">
          {(scriptEntries || []).slice(0, 20).map((e) => (
            <li key={e.id || `${e.position}-${e.play_name}`}>
              {e.position}. {e.play_name || "Unnamed call"} ({e.formation || "—"} / {e.motion || "—"})
            </li>
          ))}
          {!scriptEntries?.length ? <li>No script loaded.</li> : null}
        </ol>
      </GameDaySummaryPanel>

      <GameDaySummaryPanel title="Situational call menu">
        <ul className="space-y-1 text-xs">
          {(situationPlans || []).map((plan) => (
            <li key={plan.id}>
              <span className="font-semibold">{plan.situation_type}:</span> {plan.title}
            </li>
          ))}
          {!situationPlans?.length ? <li>No situation plans saved.</li> : null}
        </ul>
      </GameDaySummaryPanel>

      <GameDaySummaryPanel title="Linked diagrams">
        <ul className="space-y-1 text-xs">
          {(diagrams || []).slice(0, 8).map((d) => (
            <li key={d.id}>
              {d.name} {d.linkedConceptName ? `- ${d.linkedConceptName}` : ""}
            </li>
          ))}
          {!diagrams?.length ? <li>No diagrams linked.</li> : null}
        </ul>
      </GameDaySummaryPanel>
    </div>
  );
}
