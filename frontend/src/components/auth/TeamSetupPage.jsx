import { useState } from "react";

export default function TeamSetupPage({ onCreateTeam, onJoinTeam, onContinueSolo }) {
  const [name, setName] = useState("");
  const [joinTeamId, setJoinTeamId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-card">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-950">
        Team setup
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Create a team or join one to collaborate on shared gameplans and opponent profiles.
        Anything you create here is saved to your signed-in account automatically—you do not
        add teams or game data in the Firebase console.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <form
          className="space-y-3 rounded-2xl border border-zinc-200 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setLoading(true);
            try {
              await onCreateTeam({ name });
              setName("");
            } catch (err) {
              setError(err.message || "Failed creating team");
            } finally {
              setLoading(false);
            }
          }}
        >
          <p className="text-sm font-semibold text-zinc-900">Create team</p>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team name"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Create
          </button>
        </form>

        <form
          className="space-y-3 rounded-2xl border border-zinc-200 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const raw = joinTeamId.trim();
            const digits = raw.replace(/\D/g, "");
            if (!digits) {
              setError("Enter the numeric team ID your admin shared.");
              return;
            }
            setError("");
            setLoading(true);
            try {
              await onJoinTeam({ team_id: digits, role: "coach" });
              setJoinTeamId("");
            } catch (err) {
              setError(err.message || "Failed joining team");
            } finally {
              setLoading(false);
            }
          }}
        >
          <p className="text-sm font-semibold text-zinc-900">Join existing team</p>
          <p className="text-xs text-zinc-500">
            Paste the numeric team ID your coach or admin shared. (You have no teams yet, so
            there is nothing to pick from a list.)
          </p>
          <input
            value={joinTeamId}
            onChange={(e) => setJoinTeamId(e.target.value)}
            placeholder="e.g. 1776728336184777"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
            inputMode="numeric"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading || !joinTeamId.trim()}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800"
          >
            Join
          </button>
        </form>
      </div>
      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={onContinueSolo}
        className="mt-6 text-sm font-medium text-zinc-600 underline"
      >
        Continue in solo mode for now
      </button>
    </div>
  );
}

