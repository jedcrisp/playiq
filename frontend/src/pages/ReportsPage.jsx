import { useState } from "react";
import ReportView from "../components/analytics/ReportView.jsx";

export default function ReportsPage({ opponentReport, selfScoutReport, onLoadOpponentReport, onLoadSelfScoutReport, opponents, onSaveReportNote }) {
  const [selectedOpponentId, setSelectedOpponentId] = useState("");
  const [note, setNote] = useState("");
  const [tags, setTags] = useState("pressure, tendency alert");
  const [noteError, setNoteError] = useState("");

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Reports</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">Printable tendency reports</h1>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm sm:col-span-2" value={selectedOpponentId} onChange={(e) => setSelectedOpponentId(e.target.value)}>
            <option value="">Select opponent</option>
            {opponents.map((o) => <option key={o.id} value={o.id}>{o.opponentName}</option>)}
          </select>
          <button type="button" onClick={() => onLoadOpponentReport(selectedOpponentId)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Load opponent report</button>
          <button type="button" onClick={onLoadSelfScoutReport} className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700">Load self-scout report</button>
        </div>
      </div>

      {opponentReport ? <ReportView title="Opponent Tendency Report" subtitle="Observed coverage/front/pressure tendencies" report={opponentReport} onPrint={() => window.print()} printId="print-opponent-report" /> : null}
      {selfScoutReport ? <ReportView title="Self-Scout Report" subtitle="Own-offense tendency breakdown" report={selfScoutReport} onPrint={() => window.print()} printId="print-self-scout-report" /> : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-zinc-900">Report notes and tags</h3>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Add takeaway note..." />
        <input value={tags} onChange={(e) => setTags(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Tags e.g. pressure, red zone" />
        <button type="button" onClick={async () => {
          if (!note.trim()) {
            setNoteError("Add note content before saving.");
            return;
          }
          setNoteError("");
          await onSaveReportNote({ report_type: "opponent", scope_id: selectedOpponentId ? Number(selectedOpponentId) : null, title: "Analytics Note", content: note.trim(), tags });
          setNote("");
        }} className="mt-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Save note</button>
        {noteError ? <p className="mt-2 text-sm text-red-700">{noteError}</p> : null}
      </section>
    </div>
  );
}
