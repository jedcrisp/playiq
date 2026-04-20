import AnalyticsSummaryCard from "../components/analytics/AnalyticsSummaryCard.jsx";
import FrequencyChart from "../components/analytics/FrequencyChart.jsx";
import TendencyInsightPanel from "../components/analytics/TendencyInsightPanel.jsx";

export default function SelfScoutPage({ analytics, loading, error, filters, onFiltersChange, onRefresh }) {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Self-scout</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">Own offense tendency audit</h1>
        <p className="mt-3 text-sm text-zinc-600">Track concept/formation/motion predictability and situational balance.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Game label" value={filters.game_label || ""} onChange={(e) => onFiltersChange({ ...filters, game_label: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Down" value={filters.down || ""} onChange={(e) => onFiltersChange({ ...filters, down: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Distance" value={filters.distance_bucket || ""} onChange={(e) => onFiltersChange({ ...filters, distance_bucket: e.target.value })} />
        <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Field zone" value={filters.field_zone || ""} onChange={(e) => onFiltersChange({ ...filters, field_zone: e.target.value })} />
        <button type="button" onClick={onRefresh} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Refresh</button>
      </div>

      {loading ? <p className="text-sm text-zinc-500">Loading self-scout analytics...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!loading && !error && (!analytics || !analytics.sample_size) ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-600">
          No self-scout sample yet. Add entries with side set to self to unlock this dashboard.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <AnalyticsSummaryCard title="Sample size" value={analytics?.sample_size || 0} />
        <AnalyticsSummaryCard title="Top concept" value={analytics?.top_concepts?.[0]?.label || "—"} subtitle={analytics?.top_concepts?.[0] ? `${analytics.top_concepts[0].pct}% usage` : ""} />
        <AnalyticsSummaryCard title="Top formation" value={analytics?.top_formations?.[0]?.label || "—"} subtitle={analytics?.top_formations?.[0] ? `${analytics.top_formations[0].pct}% usage` : ""} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <FrequencyChart title="Top concepts" rows={analytics?.top_concepts || []} />
        <FrequencyChart title="Top formations" rows={analytics?.top_formations || []} />
        <FrequencyChart title="Play type mix" rows={analytics?.play_type_mix || []} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FrequencyChart title="Success by concept" rows={analytics?.success_by_concept || []} />
        <FrequencyChart title="Explosive by concept" rows={analytics?.explosive_by_concept || []} />
      </div>

      <TendencyInsightPanel insights={analytics?.insights || []} />
    </div>
  );
}
