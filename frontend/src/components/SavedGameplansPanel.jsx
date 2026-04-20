import { formatTimestamp } from "../utils/formatTimestamp.js";
import { formatGameplanSummary } from "../utils/gameplanSummary.js";

export default function SavedGameplansPanel({ gameplans, onLoad, onDelete, onNotes }) {
  const empty = !gameplans?.length;

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/95 shadow-card-sm ring-1 ring-zinc-950/[0.03] backdrop-blur-sm">
        <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50/80 to-white px-5 py-4">
          <h2 className="font-display text-sm font-semibold text-zinc-950">Saved gameplans</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-500">
            On this device only. Add analyst notes per save.
          </p>
        </div>

        {empty ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-zinc-800">Nothing saved yet</p>
            <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">
              After you generate a plan, use <span className="font-semibold text-zinc-700">Save gameplan</span>{" "}
              to keep the full scenario. Open <span className="font-semibold text-zinc-700">Notes</span> for
              staff scouting and emphasis.
            </p>
          </div>
        ) : (
          <ul className="max-h-[min(70vh,560px)] divide-y divide-zinc-100 overflow-y-auto">
            {gameplans.map((g) => (
              <li key={g.id} className="px-5 py-4 transition hover:bg-zinc-50/80">
                <p className="truncate text-sm font-semibold text-zinc-950">{g.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {g.visibility === "team" ? "Shared with team" : "Private"}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-zinc-400">
                  {formatTimestamp(g.createdAt)}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-snug text-zinc-600">
                  {formatGameplanSummary(g.inputs)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onLoad(g)}
                    className="rounded-lg bg-gradient-to-b from-brand-600 to-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-brand-600/25 transition hover:from-brand-500 hover:to-brand-600"
                  >
                    Load
                  </button>
                  {onNotes ? (
                    <button
                      type="button"
                      onClick={() => onNotes(g)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
                    >
                      Notes
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDelete(g.id)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
