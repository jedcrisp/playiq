import FrequencyChart from "./FrequencyChart.jsx";
import TendencyInsightPanel from "./TendencyInsightPanel.jsx";

const chartConfigs = [
  { key: "front_frequency", title: "Front frequency" },
  { key: "coverage_frequency", title: "Coverage frequency" },
  { key: "pressure_frequency", title: "Pressure frequency" },
  { key: "top_concepts", title: "Top concepts" },
  { key: "top_formations", title: "Top formations" },
  { key: "motion_usage", title: "Motion usage" },
  { key: "play_type_mix", title: "Play type mix" },
  { key: "success_by_concept", title: "Success by concept" },
  { key: "explosive_by_concept", title: "Explosive by concept" },
];

export default function ReportView({ title, subtitle, report, onPrint, printId = "print-analytics-report" }) {
  const sections = chartConfigs.filter((item) => Array.isArray(report?.[item.key]) && report[item.key].length);

  return (
    <div id={printId} className="space-y-5 rounded-3xl border border-zinc-200 bg-white p-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-dashed border-zinc-200 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700">PlayIQ report</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={onPrint}
          className="print:hidden rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Print report
        </button>
      </header>

      {sections.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <FrequencyChart key={section.key} title={section.title} rows={report?.[section.key] || []} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No report sections available yet for this sample.</p>
      )}

      <TendencyInsightPanel insights={report?.insights || []} />
    </div>
  );
}
