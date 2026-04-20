export default function GameplanNotesPanel({
  title = "Analyst notes",
  notes,
  onChange,
  disabled,
}) {
  const fields = [
    { key: "scouting", label: "Scouting notes" },
    { key: "coaching", label: "Coaching notes" },
    { key: "emphasis", label: "Gameplan emphasis" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4">
      <h3 className="font-display text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-1 text-xs font-medium text-zinc-500">
        Stored locally with this {title.toLowerCase().includes("gameplan") ? "gameplan" : "profile"}.
      </p>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label
              htmlFor={`note-${f.key}`}
              className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500"
            >
              {f.label}
            </label>
            <textarea
              id={`note-${f.key}`}
              rows={3}
              disabled={disabled}
              value={notes?.[f.key] ?? ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:cursor-not-allowed disabled:bg-zinc-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
