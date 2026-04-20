import PageHeader from "./PageHeader.jsx";
import GameplanForm from "./GameplanForm.jsx";
import RecommendationResults from "./RecommendationResults.jsx";
import SavedGameplansPanel from "./SavedGameplansPanel.jsx";
import Banner from "./Banner.jsx";
import AISummaryCard from "./ai/AISummaryCard.jsx";
import GenerateAISummaryButton from "./ai/GenerateAISummaryButton.jsx";

export default function PlanWorkspace({
  options,
  values,
  onChange,
  onSubmit,
  loading,
  submitError,
  loadError,
  result,
  viewMode,
  onViewModeChange,
  onRequestSave,
  saveDisabled,
  savedGameplans,
  onLoadGameplan,
  onDeleteGameplan,
  onOpenGameplanNotes,
  saveBanner,
  onDismissBanner,
  onCreateDiagramFromConcept,
  onAttachDiagramFromConcept,
  onOpenInstallSheet,
  observedTendencySummary,
  aiSummary,
  aiSummaryLoading,
  aiSummaryError,
  onGenerateAISummary,
}) {
  return (
    <>
      <div className="print:hidden">
        <PageHeader />
      </div>

      {saveBanner ? (
        <div className="print:hidden">
          <Banner onDismiss={onDismissBanner}>{saveBanner}</Banner>
        </div>
      ) : null}

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10 lg:space-y-0">
        <div className="min-w-0 flex-1 space-y-10 lg:space-y-12">
          <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-card shadow-zinc-950/5 ring-1 ring-zinc-950/[0.04] backdrop-blur-sm print:hidden sm:p-8 lg:p-10">
            <div className="border-b border-zinc-100 pb-6">
              <h2 className="font-display text-lg font-semibold tracking-tight text-zinc-950">
                Defensive picture & matchup
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
                Build from film, then generate installs. Load an opponent profile from the
                Opponents tab to auto-fill tendencies.
              </p>
            </div>
            <div className="pt-8">
              {loadError ? (
                <p
                  className="mb-6 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm"
                  role="status"
                >
                  {loadError}
                </p>
              ) : null}
              <GameplanForm
                options={options}
                values={values}
                onChange={onChange}
                onSubmit={onSubmit}
                loading={loading}
                error={submitError}
              />
            </div>
          </section>

          <RecommendationResults
            result={result}
            inputs={values}
            loading={loading}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onRequestSave={onRequestSave}
            saveDisabled={saveDisabled}
            onCreateDiagramFromConcept={onCreateDiagramFromConcept}
            onAttachDiagramFromConcept={onAttachDiagramFromConcept}
            onOpenInstallSheet={onOpenInstallSheet}
            observedTendencySummary={observedTendencySummary}
          />

          {result?.recommendations?.length ? (
            <section className="space-y-3 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold text-zinc-950">AI assistance layer</h3>
                <GenerateAISummaryButton
                  loading={aiSummaryLoading}
                  onClick={onGenerateAISummary}
                  disabled={!result?.recommendations?.length}
                />
              </div>
              <p className="text-xs text-zinc-500">
                Rule-engine output is authoritative. AI content is an explanatory layer.
              </p>
              {aiSummaryError ? <p className="text-sm text-red-700">{aiSummaryError}</p> : null}
              {aiSummaryLoading ? (
                <div className="rounded-2xl border border-violet-200 bg-white/80 px-4 py-3 text-sm text-violet-800">
                  Building tactical AI summary from your structured plan context...
                </div>
              ) : null}
              <AISummaryCard
                summary={aiSummary?.content}
                modelName={aiSummary?.model_name}
                createdAt={aiSummary?.created_at}
                onSaveHint={
                  aiSummary?.id
                    ? "Saved to the linked gameplan record."
                    : "Tip: load/save a gameplan first to persist AI summary to database."
                }
              />
            </section>
          ) : null}
        </div>

        <div className="w-full shrink-0 print:hidden lg:w-80 xl:w-96">
          <SavedGameplansPanel
            gameplans={savedGameplans}
            onLoad={onLoadGameplan}
            onDelete={onDeleteGameplan}
            onNotes={onOpenGameplanNotes}
          />
        </div>
      </div>
    </>
  );
}
