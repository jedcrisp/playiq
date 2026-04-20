import { useMemo, useState } from "react";
import ScriptEntryRow from "../components/gameDay/ScriptEntryRow.jsx";

const emptyScript = {
  name: "",
  opponent_profile_id: "",
  gameplan_id: "",
  week_label: "",
  total_planned_calls: 15,
  notes: "",
};

const emptyEntry = {
  position: 1,
  play_name: "",
  formation: "",
  motion: "",
  objective_tag: "opener",
  target_defensive_look: "",
  why_included: "",
  expected_defensive_reaction: "",
  next_call: "",
  notes: "",
};

export default function ScriptBuilderPage({
  scripts,
  scriptEntries,
  selectedScriptId,
  onSelectScriptId,
  onSaveScript,
  onDeleteScript,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onReorderEntries,
  opponents,
  gameplans,
  recommendation,
  loading,
  error,
}) {
  const [form, setForm] = useState(emptyScript);
  const [entryDraft, setEntryDraft] = useState(emptyEntry);
  const activeEntries = useMemo(() => scriptEntries || [], [scriptEntries]);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Script builder</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Opening sequence planner
        </h1>
        <p className="mt-3 text-sm text-zinc-600">Build your first 10-20 calls, expected reactions, and companion answers.</p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-6">
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-2" placeholder="Script name" value={form.name} onChange={(e) => setForm((x) => ({ ...x, name: e.target.value }))} />
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={form.opponent_profile_id} onChange={(e) => setForm((x) => ({ ...x, opponent_profile_id: e.target.value }))}>
            <option value="">Opponent</option>
            {opponents.map((o) => <option key={o.id} value={o.id}>{o.opponentName}</option>)}
          </select>
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={form.gameplan_id} onChange={(e) => setForm((x) => ({ ...x, gameplan_id: e.target.value }))}>
            <option value="">Gameplan</option>
            {gameplans.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Week label" value={form.week_label} onChange={(e) => setForm((x) => ({ ...x, week_label: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Planned calls" value={form.total_planned_calls} onChange={(e) => setForm((x) => ({ ...x, total_planned_calls: Number(e.target.value || 15) }))} />
        </div>
        <textarea className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows={2} placeholder="Script note" value={form.notes} onChange={(e) => setForm((x) => ({ ...x, notes: e.target.value }))} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={async () => {
            if (!form.name.trim()) return;
            await onSaveScript({
              ...form,
              opponent_profile_id: form.opponent_profile_id ? Number(form.opponent_profile_id) : null,
              gameplan_id: form.gameplan_id ? Number(form.gameplan_id) : null,
            });
            setForm(emptyScript);
          }}>
            Save script
          </button>
          {recommendation?.recommendations?.slice(0, 3).map((rec, idx) => (
            <button
              key={rec.rank}
              type="button"
              className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700"
              onClick={() => setEntryDraft((x) => ({
                ...x,
                position: activeEntries.length + 1 + idx,
                play_name: rec.concept,
                formation: rec.formation,
                motion: rec.motion,
                target_defensive_look: rec.expected_adjustment || "",
              }))}
            >
              Prefill {rec.concept}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={selectedScriptId || ""} onChange={(e) => onSelectScriptId(e.target.value)}>
            <option value="">Select script</option>
            {scripts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {selectedScriptId ? (
            <button type="button" className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700" onClick={() => onDeleteScript(Number(selectedScriptId))}>
              Delete script
            </button>
          ) : null}
        </div>
        {loading ? <p className="mt-3 text-sm text-zinc-500">Loading script...</p> : null}
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      </section>

      {selectedScriptId ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Script entries</h3>
          <div className="grid gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:grid-cols-12">
            <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2" placeholder="Play name" value={entryDraft.play_name} onChange={(e) => setEntryDraft((x) => ({ ...x, play_name: e.target.value }))} />
            <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-1" placeholder="Form" value={entryDraft.formation} onChange={(e) => setEntryDraft((x) => ({ ...x, formation: e.target.value }))} />
            <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-1" placeholder="Motion" value={entryDraft.motion} onChange={(e) => setEntryDraft((x) => ({ ...x, motion: e.target.value }))} />
            <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2" placeholder="Target look" value={entryDraft.target_defensive_look} onChange={(e) => setEntryDraft((x) => ({ ...x, target_defensive_look: e.target.value }))} />
            <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2" placeholder="Objective tag" value={entryDraft.objective_tag} onChange={(e) => setEntryDraft((x) => ({ ...x, objective_tag: e.target.value }))} />
            <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-1" placeholder="#" value={entryDraft.position} onChange={(e) => setEntryDraft((x) => ({ ...x, position: Number(e.target.value || 1) }))} />
            <button type="button" className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white sm:col-span-3" onClick={async () => {
              if (!entryDraft.play_name.trim()) return;
              await onAddEntry(Number(selectedScriptId), entryDraft);
              setEntryDraft((x) => ({ ...emptyEntry, position: activeEntries.length + 2 }));
            }}>
              Add entry
            </button>
          </div>
          {activeEntries.map((entry, idx) => (
            <ScriptEntryRow
              key={entry.id}
              entry={entry}
              onChange={(next) => onUpdateEntry(entry.id, next)}
              onDelete={() => onDeleteEntry(entry.id)}
              onMoveUp={async () => {
                if (idx === 0) return;
                const ids = activeEntries.map((e) => e.id);
                [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                await onReorderEntries(Number(selectedScriptId), ids);
              }}
              onMoveDown={async () => {
                if (idx === activeEntries.length - 1) return;
                const ids = activeEntries.map((e) => e.id);
                [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
                await onReorderEntries(Number(selectedScriptId), ids);
              }}
            />
          ))}
          {!activeEntries.length ? <p className="text-sm text-zinc-500">No entries yet. Add your first scripted call.</p> : null}
        </section>
      ) : (
        <p className="text-sm text-zinc-500">Select a script to build entry sequence.</p>
      )}
    </div>
  );
}
