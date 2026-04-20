import { useState } from "react";

export default function SignupPage({ onSignup, onShowLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-label text-brand-700">PlayIQ</p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
        Create account
      </h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setLoading(true);
          try {
            await onSignup({ full_name: fullName, email, password });
          } catch (err) {
            setError(err.message || "Sign up failed");
          } finally {
            setLoading(false);
          }
        }}
      >
        <label className="block text-xs font-semibold text-zinc-600">
          Full name
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold text-zinc-600">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-semibold text-zinc-600">
          Password (min 8 chars)
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <button
        type="button"
        onClick={onShowLogin}
        className="mt-4 text-sm font-medium text-brand-700 hover:underline"
      >
        Already have an account? Sign in
      </button>
    </div>
  );
}

