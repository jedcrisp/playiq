import { useEffect, useState } from "react";

const empty = {
  opponentName: "",
  teamLevel: "",
  notes: "",
  tendencies: {
    baseFront: "",
    primaryCoverage: "",
    secondaryCoverage: "",
    pressureTendency: "",
    keyDefender: "",
    weaknessType: "",
    offensiveStyle: "",
    scoutingNotes: "",
  },
  analystNotes: {
    scouting: "",
    coaching: "",
    emphasis: "",
  },
};

export default function OpponentProfileForm({ open, initial, onClose, onSave, options }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        opponentName: initial.opponentName || "",
        teamLevel: initial.teamLevel || "",
        notes: initial.notes || "",
        tendencies: { ...empty.tendencies, ...initial.tendencies },
        analystNotes: { ...empty.analystNotes, ...initial.analystNotes },
      });
    } else {
      setForm(empty);
    }
  }, [open, initial]);

  if (!open) return null;

  const setT = (key, val) =>
    setForm((f) => ({ ...f, tendencies: { ...f.tendencies, [key]: val } }));
  const setA = (key, val) =>
    setForm((f) => ({ ...f, analystNotes: { ...f.analystNotes, [key]: val } }));

  const select = (label, value, onChange, opts, id) => (
    <div>
      <label className="text-xs font-medium text-zinc-600" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
      >
        <option value="">—</option>
        {(opts || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-zinc-950">
          {initial ? "Edit opponent" : "New opponent profile"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600" htmlFor="opp-name">
              Opponent name *
            </label>
            <input
              id="opp-name"
              value={form.opponentName}
              onChange={(e) => setForm((f) => ({ ...f, opponentName: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600" htmlFor="opp-level">
              Team level / classification
            </label>
            <input
              id="opp-level"
              value={form.teamLevel}
              onChange={(e) => setForm((f) => ({ ...f, teamLevel: e.target.value }))}
              placeholder="Varsity, JV, 7-on-7…"
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-zinc-600" htmlFor="opp-notes">
              Profile notes
            </label>
            <textarea
              id="opp-notes"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm shadow-sm"
            />
          </div>
        </div>

        <h3 className="mt-6 font-display text-sm font-semibold text-zinc-950">Defensive tendencies</h3>
        <p className="text-xs font-medium text-zinc-500">
          Used to auto-fill the PlayIQ planner when you choose “Use for gameplan”.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {select("Base front", form.tendencies.baseFront, (v) => setT("baseFront", v), options?.defensive_front, "t-base")}
          {select(
            "Primary coverage",
            form.tendencies.primaryCoverage,
            (v) => setT("primaryCoverage", v),
            options?.coverage_shell,
            "t-pri",
          )}
          {select(
            "Secondary coverage",
            form.tendencies.secondaryCoverage,
            (v) => setT("secondaryCoverage", v),
            options?.coverage_shell,
            "t-sec",
          )}
          {select(
            "Pressure tendency",
            form.tendencies.pressureTendency,
            (v) => setT("pressureTendency", v),
            options?.pressure_tendency,
            "t-pr",
          )}
          {select(
            "Key defender to attack",
            form.tendencies.keyDefender,
            (v) => setT("keyDefender", v),
            options?.defender_to_attack,
            "t-def",
          )}
          {select(
            "Weakness type",
            form.tendencies.weaknessType,
            (v) => setT("weaknessType", v),
            options?.weakness_type,
            "t-weak",
          )}
          {select(
            "Default offensive style",
            form.tendencies.offensiveStyle,
            (v) => setT("offensiveStyle", v),
            options?.offensive_style,
            "t-off",
          )}
        </div>
        <div className="mt-3">
          <label className="text-xs font-medium text-zinc-600" htmlFor="t-scout">
            Custom scouting notes (tendencies)
          </label>
          <textarea
            id="t-scout"
            rows={2}
            value={form.tendencies.scoutingNotes}
            onChange={(e) => setT("scoutingNotes", e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm shadow-sm"
          />
        </div>

        <h3 className="mt-6 font-display text-sm font-semibold text-zinc-950">Analyst notes</h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-1">
          {["scouting", "coaching", "emphasis"].map((k) => (
            <div key={k}>
              <label className="text-xs font-medium capitalize text-zinc-600" htmlFor={`an-${k}`}>
                {k === "emphasis" ? "Gameplan emphasis" : `${k} notes`}
              </label>
              <textarea
                id={`an-${k}`}
                rows={2}
                value={form.analystNotes[k]}
                onChange={(e) => setA(k, e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm shadow-sm"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!form.opponentName.trim()}
            onClick={() => onSave(form)}
            className="rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-500 hover:to-brand-600 disabled:opacity-50"
          >
            Save profile
          </button>
        </div>
      </div>
    </div>
  );
}
