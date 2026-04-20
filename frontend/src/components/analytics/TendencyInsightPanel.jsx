export default function TendencyInsightPanel({ insights = [] }) {
  return (
    <section className="rounded-2xl border border-brand-200/70 bg-brand-50/40 p-4">
      <h3 className="text-sm font-semibold text-brand-900">Coaching insights</h3>
      {insights.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-600">Add more scouting snaps for stronger tendency insights.</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-zinc-800">
          {insights.map((line, idx) => (
            <li key={`${line}-${idx}`}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
