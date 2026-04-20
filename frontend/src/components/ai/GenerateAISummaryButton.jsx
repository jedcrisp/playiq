export default function GenerateAISummaryButton({ loading, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white shadow-md shadow-violet-900/20 transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? "Generating AI summary..." : "Generate AI Summary"}
    </button>
  );
}
