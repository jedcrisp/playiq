function pctOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function FrequencyChart({ title, rows = [], labelKey = "label", pctKey = "pct", countKey = "count" }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card-sm">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-xs text-zinc-500">No data yet</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rows.map((r, idx) => {
            const pct = pctOrZero(r[pctKey]);
            return (
              <li key={`${r[labelKey] || "item"}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium text-zinc-700">{r[labelKey] || "Unknown"}</span>
                  <span className="text-zinc-500">
                    {pct.toFixed(1)}%{countKey && r[countKey] !== undefined ? ` • ${r[countKey]}` : ""}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-zinc-100">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
