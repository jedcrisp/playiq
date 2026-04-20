import { useMemo, useState } from "react";
import { filterDiagramsSearch } from "../../lib/diagramStorage.js";

export default function AttachDiagramModal({
  open,
  onClose,
  linkContext,
  diagrams,
  onAttach,
}) {
  const [query, setQuery] = useState("");
  const all = useMemo(() => diagrams || [], [diagrams]);
  const filtered = useMemo(
    () => filterDiagramsSearch(all, query),
    [all, query],
  );

  if (!open || !linkContext) return null;

  const handleAttach = async (diagramId) => {
    const patch = {
      linkedConceptName: linkContext.linkedConceptName ?? null,
      linkedGameplanId: linkContext.linkedGameplanId ?? null,
      linkedOpponentId: linkContext.linkedOpponentId ?? null,
      linkedCallSheetRank: linkContext.linkedCallSheetRank ?? null,
    };
    await onAttach?.(diagramId, patch);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-zinc-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="attach-diagram-title"
    >
      <div className="my-12 w-full max-w-lg rounded-3xl border border-zinc-200/90 bg-white shadow-2xl">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 id="attach-diagram-title" className="font-display text-lg font-semibold text-zinc-950">
            Attach existing diagram
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Updates the diagram’s links to this concept{linkContext.linkedGameplanId ? " and gameplan" : ""}.
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or linked concept…"
            className="mt-4 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto divide-y divide-zinc-100">
          {filtered.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-zinc-500">
              No diagrams match. Create one first.
            </li>
          ) : (
            filtered.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => handleAttach(d.id)}
                  className="flex w-full flex-col items-start gap-0.5 px-6 py-3 text-left hover:bg-zinc-50"
                >
                  <span className="font-semibold text-zinc-900">{d.name}</span>
                  {d.linkedConceptName ? (
                    <span className="text-xs text-zinc-500">
                      Was linked: {d.linkedConceptName}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-400">No prior concept link</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="flex justify-end border-t border-zinc-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
