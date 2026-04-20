export default function GameDaySummaryPanel({ title, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card-sm">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <div className="mt-2 text-sm text-zinc-700">{children}</div>
    </section>
  );
}
