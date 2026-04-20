export default function ChatMessageList({ messages }) {
  return (
    <div className="space-y-3">
      {messages.map((m, idx) => {
        const user = m.role === "user";
        return (
          <div key={`${m.role}-${idx}-${m.id || "tmp"}`} className={`flex ${user ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                user
                  ? "bg-zinc-900 text-white"
                  : "border border-violet-200 bg-violet-50/50 text-zinc-900"
              }`}
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                {user ? "Coach" : "Coaching Assistant"}
              </p>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.model_name && !user ? (
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-violet-700/70">
                  {m.model_name}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
