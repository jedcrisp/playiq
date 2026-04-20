import RecommendationConceptCard from "./RecommendationConceptCard.jsx";
import StrategicSummaryCard from "./StrategicSummaryCard.jsx";
import EmptyState from "./EmptyState.jsx";
import CallSheetView from "./CallSheetView.jsx";
import ViewModeToggle from "./ViewModeToggle.jsx";
import { formatMatchedRule } from "../utils/ruleLabels.js";

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3" aria-hidden>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-card-sm"
        >
          <div className="h-28 bg-gradient-to-br from-zinc-100 via-zinc-50 to-white" />
          <div className="space-y-4 p-5">
            <div className="h-3 w-3/4 rounded-full bg-zinc-200" />
            <div className="h-3 w-full rounded-full bg-zinc-100" />
            <div className="h-3 w-5/6 rounded-full bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecommendationResults({
  result,
  inputs,
  loading,
  viewMode,
  onViewModeChange,
  onRequestSave,
  saveDisabled,
  onCreateDiagramFromConcept,
  onAttachDiagramFromConcept,
  onOpenInstallSheet,
  observedTendencySummary,
}) {
  const hasResult = Boolean(result?.recommendations?.length);
  const showToggle = hasResult && !loading;

  const recommendationGrid = hasResult ? (
    <div className="space-y-6 print:hidden">
      {result.strategic_summary ? (
        <StrategicSummaryCard summary={result.strategic_summary} />
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        {result.recommendations.map((rec) => (
          <RecommendationConceptCard
            key={rec.rank}
            item={rec}
            onCreateDiagram={onCreateDiagramFromConcept}
            onAttachDiagram={onAttachDiagramFromConcept}
            onOpenInstallSheet={onOpenInstallSheet}
          />
        ))}
      </div>
    </div>
  ) : null;

  const callSheet = hasResult ? (
    <CallSheetView result={result} inputs={inputs} />
  ) : null;

  const activeBody =
    viewMode === "callsheet" ? callSheet : recommendationGrid;

  if (!hasResult && !loading) {
    return (
      <section aria-labelledby="results-heading" className="space-y-4">
        <div>
          <h2
            id="results-heading"
            className="font-display text-xl font-semibold tracking-tight text-zinc-950"
          >
            Plan output
          </h2>
          <p className="mt-1.5 text-sm text-zinc-500">
            Generate a plan to see recommendations and a printable call sheet.
          </p>
        </div>
        <EmptyState
          title="No plan loaded"
          description="Set your defensive inputs and select Generate plan. You can save finished looks to Saved Gameplans and reopen them anytime on this device."
        />
      </section>
    );
  }

  return (
    <section aria-labelledby="results-heading" className="space-y-6">
      {observedTendencySummary?.sample_size ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 print:hidden">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
            Observed scouting data
          </p>
          <p className="mt-1 text-xs text-zinc-600">
            Sample: {observedTendencySummary.sample_size} snaps
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <p className="text-xs text-zinc-700">
              <span className="font-semibold">Top coverages: </span>
              {(observedTendencySummary.top_coverages || [])
                .map((x) => `${x.label} (${x.pct}%)`)
                .join(", ") || "—"}
            </p>
            <p className="text-xs text-zinc-700">
              <span className="font-semibold">Top pressures: </span>
              {(observedTendencySummary.top_pressures || [])
                .map((x) => `${x.label} (${x.pct}%)`)
                .join(", ") || "—"}
            </p>
            <p className="text-xs text-zinc-700">
              <span className="font-semibold">Top fronts: </span>
              {(observedTendencySummary.top_fronts || [])
                .map((x) => `${x.label} (${x.pct}%)`)
                .join(", ") || "—"}
            </p>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2
            id="results-heading"
            className="font-display text-xl font-semibold tracking-tight text-zinc-950"
          >
            Plan output
          </h2>
          {hasResult && !loading ? (
            <p className="mt-1.5 text-sm text-zinc-600">
              Rule pack:{" "}
              <span className="font-semibold text-zinc-900">
                {formatMatchedRule(result.matched_rule)}
              </span>
            </p>
          ) : (
            <p className="mt-1.5 text-sm text-zinc-500">Generating recommendations…</p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          {showToggle ? (
            <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
          ) : null}
          {hasResult ? (
            <>
              <button
                type="button"
                disabled={saveDisabled}
                onClick={onRequestSave}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save gameplan
              </button>
              {viewMode === "callsheet" ? (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-md shadow-zinc-900/20 transition hover:bg-zinc-800"
                >
                  Print call sheet
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="relative min-h-[120px]">
        {loading && !hasResult ? <ResultsSkeleton /> : null}

        {loading && hasResult ? (
          <div className="relative print:hidden">
            <div className="pointer-events-none opacity-50">{activeBody}</div>
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-[2px]">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/90 bg-white px-5 py-3.5 shadow-card-sm">
                <span
                  className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
                  aria-hidden
                />
                <p className="text-sm font-medium text-zinc-800">Updating plan…</p>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && hasResult ? activeBody : null}
      </div>
    </section>
  );
}
