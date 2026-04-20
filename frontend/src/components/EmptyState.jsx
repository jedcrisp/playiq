export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-200 bg-white/70 px-6 py-14 text-center shadow-inner shadow-zinc-950/5 backdrop-blur-sm">
      <p className="font-display text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        {description}
      </p>
    </div>
  );
}
