export default function SituationPlanCard({ plan, onLoad, onDelete }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">{plan.situation_type}</p>
      <h3 className="mt-1 text-sm font-semibold text-zinc-900">{plan.title}</h3>
      <p className="mt-2 line-clamp-2 text-xs text-zinc-600">{plan.coaching_note || "No coaching note yet."}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => onLoad(plan)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700">
          Open
        </button>
        <button type="button" onClick={() => onDelete(plan.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">
          Delete
        </button>
      </div>
    </article>
  );
}
