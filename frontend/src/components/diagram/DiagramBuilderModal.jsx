import { useEffect, useState } from "react";
import DiagramBuilder from "./DiagramBuilder.jsx";
import { createEmptyDiagram } from "../../utils/diagramDefaults.js";

function cloneDiagram(d) {
  try {
    return structuredClone(d);
  } catch {
    return JSON.parse(JSON.stringify(d));
  }
}

export default function DiagramBuilderModal({
  open,
  onClose,
  diagram,
  defaultLinkedConceptName = null,
  defaultLinkedGameplanId = null,
  defaultLinkedOpponentId = null,
  defaultLinkedCallSheetRank = null,
  opponents,
  activeGameplanLabel,
  onSave,
}) {
  const [draft, setDraft] = useState(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!open) {
      setDraft(null);
      setSaveError("");
      return;
    }
    if (diagram) {
      setDraft(cloneDiagram(diagram));
      return;
    }
    const link = {
      linkedConceptName: defaultLinkedConceptName,
      linkedGameplanId: defaultLinkedGameplanId,
      linkedOpponentId: defaultLinkedOpponentId,
      linkedCallSheetRank: defaultLinkedCallSheetRank,
    };
    setDraft(
      createEmptyDiagram({
        name: defaultLinkedConceptName
          ? `${defaultLinkedConceptName} diagram`
          : "New diagram",
        link,
      }),
    );
  }, [
    open,
    diagram,
    defaultLinkedConceptName,
    defaultLinkedGameplanId,
    defaultLinkedOpponentId,
    defaultLinkedCallSheetRank,
  ]);

  if (!open || !draft) return null;

  const handleSave = async () => {
    setSaveError("");
    try {
      await onSave?.(draft);
      onClose();
    } catch (e) {
      setSaveError(e?.message || "Could not save diagram. Check Firestore rules and your connection.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-zinc-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="diagram-editor-title"
    >
      <div className="my-8 w-full max-w-4xl rounded-3xl border border-zinc-200/90 bg-white shadow-2xl shadow-zinc-950/20">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-label text-brand-700">
              Diagram editor
            </p>
            <h2 id="diagram-editor-title" className="font-display text-lg font-semibold text-zinc-950">
              {diagram ? "Edit diagram" : "New diagram"}
            </h2>
            {activeGameplanLabel ? (
              <p className="mt-1 text-xs text-zinc-500">
                Active gameplan link:{" "}
                <span className="font-medium text-zinc-700">{activeGameplanLabel}</span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">
                Save a gameplan to link diagrams to that install package.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-6">
          <DiagramBuilder diagram={draft} onChange={setDraft} opponents={opponents} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4">
          {saveError ? (
            <p className="mr-auto max-w-md text-sm text-red-600">{saveError}</p>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:bg-brand-700"
          >
            Save diagram
          </button>
        </div>
      </div>
    </div>
  );
}
