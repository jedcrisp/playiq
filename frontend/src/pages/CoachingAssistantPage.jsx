import ChatInput from "../components/ai/ChatInput.jsx";
import ChatMessageList from "../components/ai/ChatMessageList.jsx";
import AIContextStrip from "../components/ai/AIContextStrip.jsx";

export default function CoachingAssistantPage({
  messages,
  loading,
  onSend,
  error,
  activeOpponentName,
  activeGameplanName,
}) {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-violet-700">
          Coaching Assistant
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          AI coaching chat
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          Conversational planning support grounded in your selected matchup context and deterministic recommendations.
        </p>
        <AIContextStrip
          className="mt-2"
          opponentName={activeOpponentName}
          gameplanName={activeGameplanName}
        />
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-card-sm">
        <div className="max-h-[56vh] overflow-y-auto pr-1">
          {messages.length ? (
            <ChatMessageList messages={messages} />
          ) : (
            <p className="text-sm text-zinc-500">
              Start with a question like: “What is our best 3rd-and-medium concept here?”
            </p>
          )}
        </div>
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <ChatInput onSend={onSend} loading={loading} />
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
