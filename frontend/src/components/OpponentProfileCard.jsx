import { formatTimestamp } from "../utils/formatTimestamp.js";

function summarizeTendencies(t) {
  const front = t?.baseFront || "—";
  const cov = t?.primaryCoverage || "—";
  const sec = t?.secondaryCoverage;
  const line = sec ? `${front} · ${cov} / ${sec}` : `${front} · ${cov}`;
  return line;
}

export default function OpponentProfileCard({
  profile,
  onUse,
  onEdit,
  onDelete,
  onView,
}) {
  return (
    <article className="group flex flex-col rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-card-sm ring-1 ring-zinc-950/[0.03] transition hover:border-zinc-300/90 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display truncate text-base font-semibold text-zinc-950">
            {profile.opponentName}
          </h3>
          {profile.teamLevel ? (
            <p className="mt-0.5 text-xs font-medium text-zinc-500">{profile.teamLevel}</p>
          ) : null}
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600">
        {summarizeTendencies(profile.tendencies)}
      </p>
      <p className="mt-2 text-[11px] font-medium text-zinc-400">
        Updated {formatTimestamp(profile.updatedAt)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onUse(profile)}
          className="rounded-lg bg-gradient-to-b from-brand-600 to-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:from-brand-500 hover:to-brand-600"
        >
          Use for gameplan
        </button>
        <button
          type="button"
          onClick={() => onView(profile)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
        >
          Notes
        </button>
        <button
          type="button"
          onClick={() => onEdit(profile)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(profile.id)}
          className="rounded-lg border border-red-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
