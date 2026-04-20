import { useMemo, useState } from "react";
import DiagramCard from "../components/diagram/DiagramCard.jsx";
import { filterDiagramsSearch } from "../lib/diagramStorage.js";

export default function DiagramLibraryPage({
  diagrams,
  onNewDiagram,
  onEditDiagram,
  onDeleteDiagram,
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => filterDiagramsSearch(diagrams, query),
    [diagrams, query],
  );

  const handleDelete = (id) => {
    if (!window.confirm("Delete this diagram?")) return;
    onDeleteDiagram(id);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Diagram library</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Saved diagrams
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Build installs visually, link them to concepts and gameplans, and print install sheets from the
          Plan workspace.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, concept, or play…"
          className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm shadow-sm sm:max-w-lg"
        />
        <button
          type="button"
          onClick={onNewDiagram}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700"
        >
          New diagram
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-8 py-16 text-center">
          <p className="font-medium text-zinc-800">No diagrams yet</p>
          <p className="mt-2 text-sm text-zinc-500">
            Create one from a recommendation card or click New diagram.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <DiagramCard
              key={d.id}
              diagram={d}
              onEdit={onEditDiagram}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
