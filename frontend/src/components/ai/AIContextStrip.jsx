export default function AIContextStrip({ opponentName, gameplanName, className = "" }) {
  return (
    <p className={`text-xs text-zinc-500 ${className}`}>
      Context: {opponentName || "No opponent selected"} • {gameplanName || "No gameplan selected"}
    </p>
  );
}

