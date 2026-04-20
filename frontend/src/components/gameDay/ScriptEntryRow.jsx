export default function ScriptEntryRow({ entry, onChange, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="grid gap-2 rounded-xl border border-zinc-200 bg-white p-3 sm:grid-cols-12">
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-1"
        value={entry.position}
        onChange={(e) => onChange({ ...entry, position: Number(e.target.value || 1) })}
        placeholder="#"
      />
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2"
        value={entry.play_name}
        onChange={(e) => onChange({ ...entry, play_name: e.target.value })}
        placeholder="Concept / play"
      />
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-1"
        value={entry.formation}
        onChange={(e) => onChange({ ...entry, formation: e.target.value })}
        placeholder="Formation"
      />
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-1"
        value={entry.motion}
        onChange={(e) => onChange({ ...entry, motion: e.target.value })}
        placeholder="Motion"
      />
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2"
        value={entry.target_defensive_look}
        onChange={(e) => onChange({ ...entry, target_defensive_look: e.target.value })}
        placeholder="Target look"
      />
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2"
        value={entry.objective_tag}
        onChange={(e) => onChange({ ...entry, objective_tag: e.target.value })}
        placeholder="Objective tag"
      />
      <input
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2"
        value={entry.next_call}
        onChange={(e) => onChange({ ...entry, next_call: e.target.value })}
        placeholder="Companion / next"
      />
      <textarea
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-9"
        rows={2}
        value={entry.notes || ""}
        onChange={(e) => onChange({ ...entry, notes: e.target.value })}
        placeholder="Why included / expected reaction / notes"
      />
      <div className="flex gap-2 sm:col-span-3 sm:justify-end">
        <button type="button" className="rounded border border-zinc-200 px-2 py-1 text-xs" onClick={onMoveUp}>
          Up
        </button>
        <button type="button" className="rounded border border-zinc-200 px-2 py-1 text-xs" onClick={onMoveDown}>
          Down
        </button>
        <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
