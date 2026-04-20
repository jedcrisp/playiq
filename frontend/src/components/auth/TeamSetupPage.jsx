import { useEffect, useState } from "react";

export default function TeamSetupPage({ teams, onCreateTeam, onJoinTeam, onContinueSolo }) {
  const [name, setName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teams?.length && !teamId) setTeamId(String(teams[0].id));
  }, [teams, teamId]);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-card">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-950">
        Team setup
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Create a team or join one to collaborate on shared gameplans and opponent profiles.
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
            if (!teamId) return;
            setError("");
            setLoading(true);
            try {
              await onJoinTeam({ team_id: Number(teamId), role: "coach" });
            } catch (err) {
              setError(err.message || "Failed joining team");
            } finally {
              setLoading(false);
            }
          }}
        >
          <p className="text-sm font-semibold text-zinc-900">Join existing team</p>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          >
            {!teams?.length ? <option value="">No teams found</option> : null}
            {teams?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !teamId}
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

