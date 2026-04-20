import DiagramCanvas from "../diagram/DiagramCanvas.jsx";

export default function LinkedDiagramsPanel({ diagrams }) {
  if (!diagrams?.length) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 text-center text-sm text-zinc-500 print:border-zinc-300 print:bg-white">
        No diagrams linked yet. Create a diagram from the recommendation card or Diagrams library.
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600 print:text-zinc-800">
        Linked diagrams
      </h3>
      <div className="grid gap-6 print:grid-cols-1">
        {diagrams.map((d) => (
          <div
            key={d.id}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white print:break-inside-avoid print:border-zinc-300"
          >
            <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5 print:bg-white">
              <p className="font-semibold text-zinc-900">{d.name}</p>
              {d.playName ? (
                <p className="text-xs font-medium text-brand-800">{d.playName}</p>
              ) : null}
              {d.installNote ? (
                <p className="mt-1 text-xs leading-relaxed text-zinc-600">{d.installNote}</p>
              ) : null}
            </div>
            <div className="p-4">
              <DiagramCanvas
                readOnly
                canvas={d.canvas}
                onChangeCanvas={() => {}}
                tool="select"
                offenseRole="Z"
                defenseRole="CB"
                routeType="go"
                selectedMarkerId={null}
                onSelectMarker={() => {}}
                motionDraft={[]}
                blockDraft={[]}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
