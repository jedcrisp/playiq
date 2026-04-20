const ROWS = [
  { key: "why_it_works", title: "Why it works" },
  { key: "stresses_defender", title: "What it stresses" },
  { key: "space_leverage", title: "Space & leverage" },
  { key: "ideal_down_distance", title: "Ideal down & distance" },
  { key: "formation", title: "Formation / presentation" },
  { key: "motion", title: "Motion / manipulation" },
  { key: "likely_defensive_adjustment", title: "Likely defensive adjustment", alt: "expected_adjustment" },
  { key: "counter", title: "Counter recommendation", alt: "counter_recommendation" },
  { key: "coaching_point", title: "Coaching point", alt: "coaching_note" },
];

function pick(item, row) {
  const v = item[row.key];
  if (v) return v;
  if (row.alt && item[row.alt]) return item[row.alt];
  return "—";
}

export default function RecommendationConceptCard({
  item,
  onCreateDiagram,
  onAttachDiagram,
  onOpenInstallSheet,
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-card-sm ring-1 ring-zinc-950/[0.04] transition hover:border-zinc-300/90 hover:shadow-card">
      <div className="border-b border-zinc-100 bg-gradient-to-br from-brand-50/90 via-white to-zinc-50/30 px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-label text-brand-700">
          Rank {item.rank}
        </p>
        <h3 className="font-display mt-1.5 text-lg font-semibold leading-snug tracking-tight text-zinc-950">
          {item.concept}
        </h3>
      </div>
      <dl className="flex flex-1 flex-col divide-y divide-zinc-100">
        {ROWS.map((row) => (
          <div key={row.key} className="px-5 py-3.5 transition group-hover:bg-zinc-50/40">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {row.title}
            </dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-zinc-700">
              {pick(item, row)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 border-t border-zinc-100 bg-zinc-50/50 px-5 py-4">
        <button
          type="button"
          onClick={() => onCreateDiagram?.(item)}
          className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          Create diagram
        </button>
        <button
          type="button"
          onClick={() => onAttachDiagram?.(item)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Attach diagram
        </button>
        <button
          type="button"
          onClick={() => onOpenInstallSheet?.(item)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Install sheet
        </button>
      </div>
    </article>
  );
}
