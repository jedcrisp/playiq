export default function ScoutingPlayTable({ plays = [], onDelete, onEdit }) {
  if (!plays.length) {
    return <p className="text-sm text-zinc-500">No scouting plays match current filters.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
      <table className="min-w-full divide-y divide-zinc-200 text-xs">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>
            {[
              "Game",
              "Side",
              "Dn",
              "Dist",
              "Zone",
              "Pers",
              "Form",
              "Front",
              "Cov",
              "Pressure",
              "Yds",
              "Exp",
              "Actions",
            ].map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {plays.map((p) => (
            <tr key={p.id}>
              <td className="px-3 py-2">{p.game_label || "—"}</td>
              <td className="px-3 py-2">{p.side}</td>
              <td className="px-3 py-2">{p.down}</td>
              <td className="px-3 py-2">{p.distance_bucket || "—"}</td>
              <td className="px-3 py-2">{p.field_zone || "—"}</td>
              <td className="px-3 py-2">{p.personnel || "—"}</td>
              <td className="px-3 py-2">{p.formation || "—"}</td>
              <td className="px-3 py-2">{p.defensive_front || "—"}</td>
              <td className="px-3 py-2">{p.coverage_shell || "—"}</td>
              <td className="px-3 py-2">{p.pressure_type || "—"}</td>
              <td className="px-3 py-2">{p.yards}</td>
              <td className="px-3 py-2">{p.explosive ? "Yes" : "No"}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  onClick={() => onEdit?.(p)}
                  className="mr-2 rounded border border-zinc-200 px-2 py-1 text-zinc-700 hover:bg-zinc-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(p.id)}
                  className="rounded border border-red-200 px-2 py-1 text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
