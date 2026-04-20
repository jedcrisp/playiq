import { useState } from "react";
import AIContextStrip from "../components/ai/AIContextStrip.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function MatchupAnalysisPage({
  onAsk,
  loading,
  answer,
  error,
  onSaveToNotes,
  activeOpponentName,
  activeGameplanName,
}) {
  const [question, setQuestion] = useState("");
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-violet-700">
          AI Matchup Analysis
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Matchup assistant
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Ask focused matchup questions. AI answers are grounded in current structured recommendations,
          opponent profile context, and saved notes.
        </p>
        <AIContextStrip
          className="mt-2"
          opponentName={activeOpponentName}
          gameplanName={activeGameplanName}
        />
      </div>

      <form
        className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-card-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          const q = question.trim();
          if (!q) return;
          await onAsk(q);
        }}
      >
        <label className="text-xs font-semibold text-zinc-600" htmlFor="matchup-question">
          Coach question
        </label>
        <textarea
          id="matchup-question"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="How should we attack Cover 3 if the field safety rotates late?"
          className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
        />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            {loading ? "Analyzing..." : "Ask analysis"}
          </button>
        </div>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {answer ? (
        <section className="rounded-3xl border border-violet-200 bg-violet-50/50 p-5 shadow-card-sm ring-1 ring-violet-900/[0.04]">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700">
            AI Matchup Analysis
          </p>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-800">
            {answer}
          </pre>
          <button
            type="button"
            onClick={onSaveToNotes}
            className="mt-4 rounded-xl border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-800"
            disabled={!activeGameplanName}
          >
            Save answer to gameplan notes
          </button>
          {!activeGameplanName ? (
            <p className="mt-2 text-xs text-zinc-500">Load a gameplan to save this analysis into notes.</p>
          ) : null}
        </section>
      ) : !loading ? (
        <EmptyState
          title="No analysis yet"
          description="Ask a tactical question to generate AI matchup analysis grounded in your current structured context."
        />
      ) : null}
    </div>
  );
}
