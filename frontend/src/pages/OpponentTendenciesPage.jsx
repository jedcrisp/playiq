import AnalyticsSummaryCard from "../components/analytics/AnalyticsSummaryCard.jsx";
import FrequencyChart from "../components/analytics/FrequencyChart.jsx";
import TendencyInsightPanel from "../components/analytics/TendencyInsightPanel.jsx";

export default function OpponentTendenciesPage({ opponents, selectedOpponentId, onSelectOpponentId, analytics, loading, error, filters, onFiltersChange, onRefresh }) {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Opponent tendencies</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">Data-backed opponent profile</h1>
        <p className="mt-3 text-sm text-zinc-600">See observed front, coverage, and pressure frequencies from tracked scouting snaps.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-6">
        <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-2" value={selectedOpponentId || ""} onChange={(e) => onSelectOpponentId(e.target.value)}>
          <option value="">Select opponent</option>
          {opponents.map((o) => <option key={o.id} value={o.id}>{o.opponentName}</option>)}
        </select>
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Game label" value={filters.game_label || ""} onChange={(e) => onFiltersChange({ ...filters, game_label: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Down" value={filters.down || ""} onChange={(e) => onFiltersChange({ ...filters, down: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Distance" value={filters.distance_bucket || ""} onChange={(e) => onFiltersChange({ ...filters, distance_bucket: e.target.value })} />
        <button type="button" onClick={onRefresh} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
      </div>

      {loading ? <p className="text-sm text-zinc-500">Loading tendency analytics...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!loading && !error && (!analytics || !analytics.sample_size) ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
          No opponent tendency data yet for the current filters. Add scouting entries or adjust filters.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <AnalyticsSummaryCard title="Sample size" value={analytics?.sample_size || 0} />
        <AnalyticsSummaryCard title="Top coverage" value={analytics?.coverage_frequency?.[0]?.label || "—"} subtitle={analytics?.coverage_frequency?.[0] ? `${analytics.coverage_frequency[0].pct}%` : ""} />
        <AnalyticsSummaryCard title="Top pressure" value={analytics?.pressure_frequency?.[0]?.label || "—"} subtitle={analytics?.pressure_frequency?.[0] ? `${analytics.pressure_frequency[0].pct}%` : ""} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FrequencyChart title="Front frequency" rows={analytics?.front_frequency || []} />
        <FrequencyChart title="Coverage frequency" rows={analytics?.coverage_frequency || []} />
        <FrequencyChart title="Pressure frequency" rows={analytics?.pressure_frequency || []} />
      </div>

      {!!analytics?.coverage_by_down_distance?.length ? (
        <section className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-900">Coverage by down and distance</h3>
          <table className="min-w-full divide-y divide-zinc-200 text-xs">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="px-3 py-2 text-left">Situation</th>
                <th className="px-3 py-2 text-left">Top coverage</th>
                <th className="px-3 py-2 text-left">Rate</th>
                <th className="px-3 py-2 text-left">Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {analytics.coverage_by_down_distance.map((row) => (
                <tr key={`${row.situation}-${row.top_coverage}`}>
                  <td className="px-3 py-2">{row.situation}</td>
                  <td className="px-3 py-2">{row.top_coverage}</td>
                  <td className="px-3 py-2">{row.pct}%</td>
                  <td className="px-3 py-2">{row.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      <TendencyInsightPanel insights={analytics?.insights || []} />
    </div>
  );
}
