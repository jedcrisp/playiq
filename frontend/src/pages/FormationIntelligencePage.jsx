import AnalyticsSummaryCard from "../components/analytics/AnalyticsSummaryCard.jsx";
import FrequencyChart from "../components/analytics/FrequencyChart.jsx";
import TendencyInsightPanel from "../components/analytics/TendencyInsightPanel.jsx";

export default function FormationIntelligencePage({
  opponents,
  filters,
  onFiltersChange,
  data,
  loading,
  error,
  onRefresh,
}) {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Formation intelligence</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Formation-based tendency layer
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Connect opponent structures and your own usage tendencies by formation for game-day sequencing.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-7">
        <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={filters.scope || "all"} onChange={(e) => onFiltersChange({ ...filters, scope: e.target.value })}>
          <option value="all">All</option>
          <option value="opponent">Opponent-facing</option>
          <option value="self">Self-scout</option>
        </select>
        <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-2" value={filters.opponent_profile_id || ""} onChange={(e) => onFiltersChange({ ...filters, opponent_profile_id: e.target.value })}>
          <option value="">Opponent (optional)</option>
          {opponents.map((o) => <option key={o.id} value={o.id}>{o.opponentName}</option>)}
        </select>
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Game" value={filters.game_label || ""} onChange={(e) => onFiltersChange({ ...filters, game_label: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Down" value={filters.down || ""} onChange={(e) => onFiltersChange({ ...filters, down: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Distance" value={filters.distance_bucket || ""} onChange={(e) => onFiltersChange({ ...filters, distance_bucket: e.target.value })} />
        <button type="button" onClick={onRefresh} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
      </div>

      {loading ? <p className="text-sm text-zinc-500">Loading formation intelligence...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!loading && !error && (!data || !data.sample_size) ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
          No formation sample for these filters yet.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <AnalyticsSummaryCard title="Sample size" value={data?.sample_size || 0} />
        <AnalyticsSummaryCard title="Top formation" value={data?.formation_frequency?.[0]?.label || "—"} subtitle={data?.formation_frequency?.[0] ? `${data.formation_frequency[0].pct}%` : ""} />
        <AnalyticsSummaryCard title="Best explosive formation" value={data?.explosive_by_formation?.[0]?.formation || "—"} subtitle={data?.explosive_by_formation?.[0] ? `${data.explosive_by_formation[0].explosive_pct}% explosive` : ""} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FrequencyChart title="Formation frequency" rows={data?.formation_frequency || []} />
        <FrequencyChart title="Pressure by formation" rows={data?.pressure_by_formation || []} labelKey="formation" pctKey="pressure_pct" countKey="sample" />
        <FrequencyChart title="Motion by formation" rows={data?.motion_by_formation || []} labelKey="formation" pctKey="motion_pct" countKey="sample" />
      </div>

      {!!data?.defense_by_formation?.length ? (
        <section className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">Defensive look by formation</h3>
          <table className="min-w-full divide-y divide-zinc-200 text-xs">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-3 py-2 text-left">Formation</th>
                <th className="px-3 py-2 text-left">Top front</th>
                <th className="px-3 py-2 text-left">Top coverage</th>
                <th className="px-3 py-2 text-left">Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.defense_by_formation.map((row) => (
                <tr key={`${row.formation}-${row.top_coverage}`}>
                  <td className="px-3 py-2">{row.formation}</td>
                  <td className="px-3 py-2">{row.top_front} ({row.top_front_pct}%)</td>
                  <td className="px-3 py-2">{row.top_coverage} ({row.top_coverage_pct}%)</td>
                  <td className="px-3 py-2">{row.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <TendencyInsightPanel insights={data?.insights || []} />
    </div>
  );
}
