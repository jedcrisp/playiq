import { useMemo, useState } from "react";
import ScoutingPlayTable from "../components/analytics/ScoutingPlayTable.jsx";
import ScoutingUploadPanel from "../components/analytics/ScoutingUploadPanel.jsx";

const emptyForm = {
  game_label: "",
  side: "defense",
  down: 1,
  distance_bucket: "",
  field_zone: "",
  hash: "",
  personnel: "",
  formation: "",
  motion: "",
  defensive_front: "",
  coverage_shell: "",
  pressure_type: "",
  concept_name: "",
  yards: 0,
  explosive: false,
  success: false,
  play_type: "pass",
  result_notes: "",
  tags: "",
  opponent_profile_id: "",
};

export default function ScoutingDataPage({
  plays,
  opponents,
  filters,
  onFiltersChange,
  onCreatePlay,
  onDeletePlay,
  onUpdatePlay,
  onUploadCsv,
  onDownloadTemplate,
  uploadLoading,
  loading,
  error,
}) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [validationError, setValidationError] = useState("");

  const opponentOptions = useMemo(() => opponents || [], [opponents]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setValidationError("");
  };

  const toPayload = (draft) => ({
    ...draft,
    opponent_profile_id: draft.opponent_profile_id ? Number(draft.opponent_profile_id) : null,
    down: Number(draft.down || 1),
    yards: Number(draft.yards || 0),
  });

  const validateForm = (draft) => {
    if (!draft.game_label?.trim()) return "Game / week is required.";
    if (!draft.distance_bucket?.trim()) return "Distance bucket is required.";
    if (!draft.field_zone?.trim()) return "Field zone is required.";
    if (Number(draft.down) < 1 || Number(draft.down) > 4) return "Down must be between 1 and 4.";
    return "";
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Scouting data</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Film and tendency ingestion
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Enter scouting snaps manually or import CSV. This data powers opponent tendency and self-scout analytics.
        </p>
      </div>

      <ScoutingUploadPanel
        onUpload={onUploadCsv}
        onDownloadTemplate={onDownloadTemplate}
        loading={uploadLoading}
      />

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card-sm">
        <h3 className="text-sm font-semibold text-zinc-900">Manual entry</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Game / week"
            value={form.game_label} onChange={(e) => setForm((f) => ({ ...f, game_label: e.target.value }))} />
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={form.opponent_profile_id}
            onChange={(e) => setForm((f) => ({ ...f, opponent_profile_id: e.target.value }))}>
            <option value="">Opponent (optional)</option>
            {opponentOptions.map((o) => <option key={o.id} value={o.id}>{o.opponentName}</option>)}
          </select>
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={form.side}
            onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))}>
            <option value="defense">Defense</option><option value="offense">Offense</option><option value="self">Self</option>
          </select>
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Down"
            value={form.down} onChange={(e) => setForm((f) => ({ ...f, down: Number(e.target.value || 1) }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Distance bucket"
            value={form.distance_bucket} onChange={(e) => setForm((f) => ({ ...f, distance_bucket: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Field zone"
            value={form.field_zone} onChange={(e) => setForm((f) => ({ ...f, field_zone: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Personnel"
            value={form.personnel} onChange={(e) => setForm((f) => ({ ...f, personnel: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Formation"
            value={form.formation} onChange={(e) => setForm((f) => ({ ...f, formation: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Motion"
            value={form.motion} onChange={(e) => setForm((f) => ({ ...f, motion: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Defensive front"
            value={form.defensive_front} onChange={(e) => setForm((f) => ({ ...f, defensive_front: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Coverage shell"
            value={form.coverage_shell} onChange={(e) => setForm((f) => ({ ...f, coverage_shell: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Pressure type"
            value={form.pressure_type} onChange={(e) => setForm((f) => ({ ...f, pressure_type: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Concept"
            value={form.concept_name} onChange={(e) => setForm((f) => ({ ...f, concept_name: e.target.value }))} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Yards"
            value={form.yards} onChange={(e) => setForm((f) => ({ ...f, yards: Number(e.target.value || 0) }))} />
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={form.play_type}
            onChange={(e) => setForm((f) => ({ ...f, play_type: e.target.value }))}>
            <option value="pass">Pass</option><option value="run">Run</option><option value="other">Other</option>
          </select>
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-3" placeholder="Tags (comma-separated)"
            value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          <textarea className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-3" rows={2} placeholder="Result notes"
            value={form.result_notes} onChange={(e) => setForm((f) => ({ ...f, result_notes: e.target.value }))} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700"><input type="checkbox" checked={form.explosive} onChange={(e) => setForm((f) => ({ ...f, explosive: e.target.checked }))} />Explosive</label>
          <label className="inline-flex items-center gap-2 text-sm text-zinc-700"><input type="checkbox" checked={form.success} onChange={(e) => setForm((f) => ({ ...f, success: e.target.checked }))} />Success</label>
          <button
            type="button"
            onClick={async () => {
              const nextError = validateForm(form);
              setValidationError(nextError);
              if (nextError) return;
              if (editingId) {
                await onUpdatePlay(editingId, toPayload(form));
                resetForm();
                return;
              }
              await onCreatePlay(toPayload(form));
              resetForm();
            }}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {editingId ? "Update scouting play" : "Add scouting play"}
          </button>
          {editingId ? (
            <button type="button" className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700" onClick={resetForm}>
              Cancel edit
            </button>
          ) : null}
        </div>
        {validationError ? <p className="mt-2 text-sm text-red-700">{validationError}</p> : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900">Scouting entries</h3>
        <div className="grid gap-2 sm:grid-cols-5">
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Game"
            value={filters.game_label || ""} onChange={(e) => onFiltersChange({ ...filters, game_label: e.target.value })} />
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={filters.side || ""}
            onChange={(e) => onFiltersChange({ ...filters, side: e.target.value })}>
            <option value="">All sides</option><option value="defense">Defense</option><option value="offense">Offense</option><option value="self">Self</option>
          </select>
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Down"
            value={filters.down || ""} onChange={(e) => onFiltersChange({ ...filters, down: e.target.value })} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Distance"
            value={filters.distance_bucket || ""} onChange={(e) => onFiltersChange({ ...filters, distance_bucket: e.target.value })} />
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Field zone"
            value={filters.field_zone || ""} onChange={(e) => onFiltersChange({ ...filters, field_zone: e.target.value })} />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {loading ? <p className="text-sm text-zinc-500">Loading scouting entries...</p> : null}
        <ScoutingPlayTable
          plays={plays}
          onDelete={onDeletePlay}
          onEdit={(play) => {
            setEditingId(play.id);
            setValidationError("");
            setForm({
              ...emptyForm,
              ...play,
              opponent_profile_id: play.opponent_profile_id ? String(play.opponent_profile_id) : "",
            });
          }}
        />
      </section>
    </div>
  );
}
