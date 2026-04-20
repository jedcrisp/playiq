import { useState } from "react";

export default function ScoutingUploadPanel({ onUpload, onDownloadTemplate, loading }) {
  const [file, setFile] = useState(null);
  const [side, setSide] = useState("defense");

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card-sm">
      <h3 className="text-sm font-semibold text-zinc-900">CSV import</h3>
      <p className="mt-1 text-xs text-zinc-500">
        Upload scouting plays in bulk. Use the template for valid headers.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="sm:col-span-2"
        />
        <select
          value={side}
          onChange={(e) => setSide(e.target.value)}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        >
          <option value="defense">Defense</option>
          <option value="self">Self scout</option>
          <option value="offense">Offense</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!file || loading}
          onClick={() => onUpload?.({ file, side })}
          className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? "Importing..." : "Import CSV"}
        </button>
        <button
          type="button"
          onClick={onDownloadTemplate}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700"
        >
          Download template
        </button>
      </div>
    </section>
  );
}
