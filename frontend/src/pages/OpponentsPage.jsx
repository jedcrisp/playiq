import { useState } from "react";
import OpponentProfileCard from "../components/OpponentProfileCard.jsx";
import OpponentProfileForm from "../components/OpponentProfileForm.jsx";
import GameplanNotesPanel from "../components/GameplanNotesPanel.jsx";
import { tendenciesToFormValues } from "../lib/opponentStorage.js";

export default function OpponentsPage({
  options,
  onApplyToPlanner,
  opponents,
  onCreateOpponent,
  onUpdateOpponent,
  onDeleteOpponent,
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notesOpen, setNotesOpen] = useState(null);

  const handleSaveDraft = async (draft) => {
    if (editing) {
      await onUpdateOpponent(editing.id, draft);
    } else {
      await onCreateOpponent(draft);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this opponent profile?")) return;
    onDeleteOpponent(id);
  };

  const handleUse = (profile) => {
    onApplyToPlanner(profile);
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">
          Opponent planning
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Opponent profiles
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg">
          Store scouting tendencies per opponent. Load a profile into the Plan workspace to
          auto-fill defensive inputs, then generate and save gameplans as usual.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:from-brand-500 hover:to-brand-600"
        >
          New opponent profile
        </button>
      </div>

      {!opponents?.length ? (
        <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/80 px-6 py-14 text-center shadow-inner shadow-zinc-950/5 backdrop-blur-sm">
          <p className="font-display text-sm font-semibold text-zinc-900">No opponent profiles yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Create a profile with base fronts, coverages, and pressure tags. You can attach
            analyst notes and push the tendency set straight into the recommendation form.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {opponents.map((p) => (
            <OpponentProfileCard
              key={p.id}
              profile={p}
              onUse={handleUse}
              onEdit={() => {
                setEditing(p);
                setFormOpen(true);
              }}
              onDelete={handleDelete}
              onView={() => setNotesOpen(p)}
            />
          ))}
        </div>
      )}

      <OpponentProfileForm
        open={formOpen}
        initial={editing}
        options={options}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSaveDraft}
      />

      {notesOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setNotesOpen(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-zinc-950">
              Analyst notes — {notesOpen.opponentName}
            </h2>
            <p className="mt-1 text-xs font-medium text-zinc-500">
              Profile notes and tendency scouting are saved per opponent on this device.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-600" htmlFor="prof-notes">
                  Profile notes
                </label>
                <textarea
                  id="prof-notes"
                  rows={2}
                  value={notesOpen.notes || ""}
                  onChange={(e) =>
                    setNotesOpen((p) => ({ ...p, notes: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-600" htmlFor="t-scout-2">
                  Tendency scouting notes
                </label>
                <textarea
                  id="t-scout-2"
                  rows={2}
                  value={notesOpen.tendencies?.scoutingNotes || ""}
                  onChange={(e) =>
                    setNotesOpen((p) => ({
                      ...p,
                      tendencies: { ...p.tendencies, scoutingNotes: e.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
                />
              </div>
              <GameplanNotesPanel
                title="Analyst notes"
                notes={notesOpen.analystNotes}
                onChange={(key, val) =>
                  setNotesOpen((p) => ({
                    ...p,
                    analystNotes: { ...p.analystNotes, [key]: val },
                  }))
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNotesOpen(null)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateOpponent(notesOpen.id, notesOpen);
                  setNotesOpen(null);
                }}
                className="rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-500 hover:to-brand-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
