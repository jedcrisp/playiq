export default function Banner({ children, onDismiss, variant = "success" }) {
  const styles =
    variant === "success"
      ? "border-emerald-200/90 bg-emerald-50/95 text-emerald-950 shadow-sm"
      : "border-zinc-200 bg-zinc-50 text-zinc-800";

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3.5 text-sm ${styles}`}
      role="status"
    >
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-500 transition hover:bg-black/5 hover:text-zinc-800"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
