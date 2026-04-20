import { formatMatchedRule } from "../utils/ruleLabels.js";

function Panel({ title, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white print:border-zinc-300 print:shadow-none ${className}`}
    >
      <div className="border-b border-zinc-100 bg-zinc-50/90 px-4 py-2.5 print:bg-white">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 print:text-zinc-800">
          {title}
        </h3>
      </div>
      <div className="px-4 py-3 text-sm leading-relaxed text-zinc-800 print:text-zinc-900">
        {children}
      </div>
    </section>
  );
}

export default function CallSheetView({ result, inputs, matchedRuleLabel }) {
  const recs = result?.recommendations || [];
  const rule =
    matchedRuleLabel || formatMatchedRule(result?.matched_rule || "");

  const conceptsLine = recs.map((r) => r.concept).join(" · ");

  const whyBullets = recs.map((r, i) => (
    <li key={r.rank ?? i} className="print:marker:text-zinc-800">
      <span className="font-semibold text-zinc-900">{r.concept}:</span>{" "}
      {r.why_it_works}
    </li>
  ));

  return (
    <div
      id="print-call-sheet"
      className="call-sheet-print space-y-5 rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50/80 to-white p-5 shadow-inner ring-1 ring-zinc-950/[0.03] print:border-zinc-400 print:bg-white print:p-6 print:shadow-none sm:p-6"
    >
      <header className="border-b border-dashed border-zinc-200 pb-4 print:border-zinc-300">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700 print:text-zinc-800">
          PlayIQ — Call sheet
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 print:text-black">
          Gameplan worksheet
        </h2>
        {inputs ? (
          <dl className="mt-3 grid gap-1 text-xs text-zinc-600 sm:grid-cols-2 print:text-zinc-800">
            <div>
              <dt className="font-medium text-zinc-500">Look</dt>
              <dd>
                {inputs.defensive_front} · {inputs.coverage_shell} · {inputs.pressure_tendency}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500">Attack & style</dt>
              <dd>
                {inputs.defender_to_attack} · {inputs.weakness_type} · {inputs.offensive_style}
              </dd>
            </div>
          </dl>
        ) : null}
        <p className="mt-2 text-xs text-zinc-500 print:text-zinc-700">
          Matched rule pack: <span className="font-medium text-zinc-800">{rule}</span>
        </p>
        {result?.strategic_summary ? (
          <p className="mt-3 rounded-lg border border-zinc-200 bg-white/80 p-3 text-sm leading-relaxed text-zinc-800 print:border-zinc-300">
            <span className="font-semibold text-zinc-900">Strategic summary: </span>
            {result.strategic_summary}
          </p>
        ) : null}
      </header>

      <Panel title="Primary concepts">
        <ol className="list-decimal space-y-2 pl-4 marker:font-semibold">
          {recs.map((r) => (
            <li key={r.rank} className="pl-1">
              <span className="font-semibold text-zinc-900">{r.concept}</span>
              <span className="text-zinc-500"> — Rank {r.rank}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-600 print:text-zinc-800">
          <span className="font-semibold text-zinc-800">Install line:</span> {conceptsLine}
        </p>
      </Panel>

      <Panel title="Why these concepts">
        <ul className="list-disc space-y-2 pl-4 text-zinc-800">{whyBullets}</ul>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
        <Panel title="Formation / presentation">
          <ul className="space-y-3">
            {recs.map((r) => (
              <li key={`f-${r.rank}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {r.concept}
                </p>
                <p className="mt-0.5">{r.formation}</p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Motion / manipulation">
          <ul className="space-y-3">
            {recs.map((r) => (
              <li key={`m-${r.rank}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {r.concept}
                </p>
                <p className="mt-0.5">{r.motion}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
        <Panel title="Expected defensive adjustment">
          <ul className="space-y-3">
            {recs.map((r) => (
              <li key={`a-${r.rank}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {r.concept}
                </p>
                <p className="mt-0.5">
                  {r.likely_defensive_adjustment || r.expected_adjustment}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Counter punch">
          <ul className="space-y-3">
            {recs.map((r) => (
              <li key={`c-${r.rank}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {r.concept}
                </p>
                <p className="mt-0.5">{r.counter}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Coaching emphasis">
        <ul className="space-y-3">
          {recs.map((r) => (
            <li key={`n-${r.rank}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {r.concept}
              </p>
              <p className="mt-0.5 text-zinc-800">
                {r.coaching_point || r.coaching_note}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
