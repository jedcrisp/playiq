import { useEffect, useId, useRef, useState } from "react";

export default function SaveGameplanModal({ open, onClose, onConfirm, defaultName = "" }) {
  const titleId = useId();
  const inputRef = useRef(null);
  const [name, setName] = useState(defaultName);
  const [visibility, setVisibility] = useState("private");

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setVisibility("private");
      const t = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(t);
    }
  }, [open, defaultName]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-4 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-card ring-1 ring-zinc-950/5">
        <h2 id={titleId} className="font-display text-lg font-semibold text-zinc-950">
          Save gameplan
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Name this look so you can load it from Saved Gameplans later.
        </p>
        <label htmlFor="gameplan-name" className="mt-4 block text-sm font-medium text-zinc-700">
          Gameplan name
        </label>
        <input
          ref={inputRef}
          id="gameplan-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const trimmed = name.trim();
              if (trimmed) onConfirm({ name: trimmed, visibility });
            }
            if (e.key === "Escape") onClose();
          }}
          placeholder="e.g. Week 7 — 3rd down vs 3-safety"
          className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
        />
        <label htmlFor="gameplan-vis" className="mt-4 block text-sm font-medium text-zinc-700">
          Visibility
        </label>
        <select
          id="gameplan-vis"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
        >
          <option value="private">Private (only me)</option>
          <option value="team">Team shared</option>
        </select>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => onConfirm({ name: name.trim(), visibility })}
            className="rounded-xl bg-gradient-to-b from-brand-600 to-brand-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/25 hover:from-brand-500 hover:to-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
