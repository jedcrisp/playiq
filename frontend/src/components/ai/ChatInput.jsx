import { useState } from "react";

export default function ChatInput({ onSend, loading }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;
        onSend(v);
        setValue("");
      }}
    >
      <textarea
        rows={2}
        value={value}
        disabled={loading}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask the coaching assistant a matchup question..."
        className="min-h-[54px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm disabled:bg-zinc-100"
      />
      <button
        type="submit"
        disabled={loading || !value.trim()}
        className="h-11 shrink-0 rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white disabled:opacity-40"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}
