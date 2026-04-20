export default function AISummaryCard({ summary, modelName, createdAt, onSaveHint }) {
  if (!summary) return null;
  return (
    <section className="rounded-3xl border border-violet-200/70 bg-gradient-to-br from-violet-50/70 via-white to-violet-50/30 p-5 shadow-card-sm ring-1 ring-violet-900/[0.05]">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-violet-200/60 pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700">
            AI Summary
          </p>
          <p className="mt-1 text-xs text-violet-900/80">
            Tactical assistant output layered on rule-engine recommendations.
          </p>
        </div>
        <p className="text-[11px] text-violet-700/80">
          {modelName ? `Model: ${modelName}` : ""}
          {createdAt ? ` • ${new Date(createdAt).toLocaleString()}` : ""}
        </p>
      </div>
      <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-800">
        {summary}
      </pre>
      {onSaveHint ? (
        <p className="mt-3 text-xs font-medium text-violet-700">{onSaveHint}</p>
      ) : null}
    </section>
  );
}
