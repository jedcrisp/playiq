export default function PageHeader() {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-label text-brand-700">
        Plan workspace
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
        Build the plan{" "}
        <span className="bg-gradient-to-r from-brand-700 to-indigo-600 bg-clip-text text-transparent">
          before the snap
        </span>
      </h1>
      <p className="mt-3 text-sm font-medium text-zinc-500">Win before the snap</p>
      <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-zinc-600 sm:text-lg">
        Capture the defensive picture, pick the matchup you want to stress, and get{" "}
        <span className="font-semibold text-zinc-800">three ranked concepts</span> with
        formations, motion, and adjustment answers—driven by explicit rules, not generated
        diagrams.
      </p>
    </div>
  );
}
