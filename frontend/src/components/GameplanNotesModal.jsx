import { useEffect, useState } from "react";
import GameplanNotesPanel from "./GameplanNotesPanel.jsx";

const empty = { scouting: "", coaching: "", emphasis: "" };

export default function GameplanNotesModal({ open, gameplan, onClose, onSave }) {
  const [notes, setNotes] = useState(empty);

  useEffect(() => {
    if (open && gameplan) {
      setNotes({ ...empty, ...gameplan.notes });
    }
  }, [open, gameplan]);

  if (!open || !gameplan) return null;

  const handleChange = (key, val) => {
    setNotes((n) => ({ ...n, [key]: val }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gp-notes-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-card">
        <h2 id="gp-notes-title" className="font-display text-lg font-semibold text-zinc-950">
          Notes — {gameplan.name}
        </h2>
        <div className="mt-4">
          <GameplanNotesPanel
            title="Gameplan notes"
            notes={notes}
            onChange={handleChange}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(notes);
              onClose();
            }}
            className="rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-500 hover:to-brand-600"
          >
            Save notes
          </button>
        </div>
      </div>
    </div>
  );
}
