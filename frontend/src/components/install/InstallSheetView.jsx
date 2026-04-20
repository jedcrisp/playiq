import InstallSheetHeader from "./InstallSheetHeader.jsx";
import LinkedDiagramsPanel from "./LinkedDiagramsPanel.jsx";

const ROWS = [
  { key: "why_it_works", title: "Why it works" },
  { key: "coaching_point", title: "Coaching point", alt: "coaching_note" },
  { key: "formation", title: "Formation" },
  { key: "motion", title: "Motion" },
  {
    key: "likely_defensive_adjustment",
    title: "Expected defensive adjustment",
    alt: "expected_adjustment",
  },
  { key: "counter", title: "Counter" },
];

function pick(item, row) {
  const v = item[row.key];
  if (v) return v;
  if (row.alt && item[row.alt]) return item[row.alt];
  return "—";
}

function FieldBlock({ title, children }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white print:border-zinc-300 print:shadow-none">
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

export default function InstallSheetView({
  conceptItem,
  gameplanName,
  gameplanNotes,
  matchedRuleLabel,
  diagrams,
  defensiveSnapshot,
}) {
  const item = conceptItem;

  return (
    <div
      id="print-install-sheet"
      className="install-sheet-print space-y-6 rounded-3xl border border-zinc-200/90 bg-gradient-to-b from-zinc-50/90 to-white p-6 shadow-inner ring-1 ring-zinc-950/[0.03] print:rounded-none print:border-zinc-400 print:bg-white print:p-8 print:shadow-none sm:p-8"
    >
      <InstallSheetHeader
        conceptName={item?.concept || "Concept"}
        gameplanName={gameplanName}
        matchedRuleLabel={matchedRuleLabel}
      />

      {defensiveSnapshot ? (
        <p className="rounded-xl border border-zinc-200 bg-white/90 px-4 py-3 text-xs leading-relaxed text-zinc-700 print:border-zinc-300">
          <span className="font-semibold text-zinc-900">Defensive picture: </span>
          {defensiveSnapshot}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {ROWS.map((row) => (
          <FieldBlock key={row.key} title={row.title}>
            {pick(item, row)}
          </FieldBlock>
        ))}
      </div>

      {gameplanNotes ? (
        <section className="rounded-2xl border border-zinc-200 bg-white print:border-zinc-300">
          <div className="border-b border-zinc-100 px-4 py-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600">
              Gameplan notes
            </h3>
          </div>
          <div className="grid gap-3 px-4 py-3 text-sm text-zinc-800 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-semibold uppercase text-zinc-500">Scouting</p>
              <p className="mt-1 whitespace-pre-wrap">{gameplanNotes.scouting || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-zinc-500">Coaching</p>
              <p className="mt-1 whitespace-pre-wrap">{gameplanNotes.coaching || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-zinc-500">Emphasis</p>
              <p className="mt-1 whitespace-pre-wrap">{gameplanNotes.emphasis || "—"}</p>
            </div>
          </div>
        </section>
      ) : null}

      <LinkedDiagramsPanel diagrams={diagrams} />

      <p className="text-center text-[10px] font-medium text-zinc-400 print:text-zinc-500">
        Generated from PlayIQ — for staff use only.
      </p>
    </div>
  );
}
