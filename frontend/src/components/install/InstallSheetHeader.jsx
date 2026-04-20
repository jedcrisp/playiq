export default function InstallSheetHeader({
  conceptName,
  gameplanName,
  matchedRuleLabel,
}) {
  return (
    <header className="border-b border-dashed border-zinc-300 pb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-800 print:text-zinc-800">
        PlayIQ — Install sheet
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-zinc-950 print:text-black">
        {conceptName}
      </h1>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-600 print:text-zinc-800">
        {gameplanName ? (
          <p>
            <span className="font-medium text-zinc-500">Gameplan:</span>{" "}
            <span className="font-semibold text-zinc-900">{gameplanName}</span>
          </p>
        ) : null}
        {matchedRuleLabel ? (
          <p>
            <span className="font-medium text-zinc-500">Rule pack:</span>{" "}
            <span className="font-semibold text-zinc-900">{matchedRuleLabel}</span>
          </p>
        ) : null}
      </div>
    </header>
  );
}
