export default function DiagramCard({ diagram, onEdit, onDelete }) {
  const updated = diagram.updatedAt
    ? new Date(diagram.updatedAt).toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-card-sm ring-1 ring-zinc-950/[0.04]">
      <div className="border-b border-zinc-100 bg-gradient-to-br from-brand-50/80 via-white to-zinc-50/30 px-5 py-4">
        <h3 className="font-display text-base font-semibold text-zinc-950">{diagram.name}</h3>
        {diagram.playName ? (
          <p className="mt-1 text-sm font-medium text-brand-800">{diagram.playName}</p>
        ) : null}
        {diagram.linkedConceptName ? (
          <p className="mt-2 text-xs font-medium text-zinc-600">
            Concept: <span className="text-zinc-900">{diagram.linkedConceptName}</span>
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-400">No concept link</p>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 px-5 py-4">
        <p className="text-[11px] text-zinc-400">Updated {updated}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onEdit(diagram)}
            className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(diagram.id)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-red-800 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
