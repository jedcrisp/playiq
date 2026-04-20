export default function StrategicSummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-200/70 bg-gradient-to-br from-brand-50/95 via-white to-indigo-50/40 p-5 shadow-card-sm ring-1 ring-brand-900/[0.04]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-400/20 blur-2xl" aria-hidden />
      <p className="relative text-[11px] font-bold uppercase tracking-label text-brand-800">
        Strategic summary
      </p>
      <p className="relative mt-2 text-sm leading-relaxed text-zinc-800">{summary}</p>
    </div>
  );
}
