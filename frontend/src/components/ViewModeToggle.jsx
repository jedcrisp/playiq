const MODES = [
  { id: "recommendations", label: "Recommendations" },
  { id: "callsheet", label: "Call sheet" },
];

export default function ViewModeToggle({ value, onChange, disabled }) {
  return (
    <div
      className="inline-flex rounded-full border border-zinc-200/90 bg-zinc-100/90 p-1 shadow-inner"
      role="tablist"
      aria-label="Result view"
    >
      {MODES.map((m) => {
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(m.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm ${
              active
                ? "bg-white text-zinc-900 shadow-card-sm ring-1 ring-zinc-200/90"
                : "text-zinc-600 hover:text-zinc-900"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
