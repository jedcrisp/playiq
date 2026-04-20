export default function AnalyticsSummaryCard({ title, value, subtitle }) {
  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-card-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-zinc-500">{subtitle}</p> : null}
    </article>
  );
}
