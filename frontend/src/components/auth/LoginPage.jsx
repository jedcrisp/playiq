import { useEffect, useState } from "react";

export default function LoginPage({
  onLogin,
  onGoogleLogin,
  onShowSignup,
  sessionAuthError = "",
  onClearSessionAuthError,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (sessionAuthError) setError(sessionAuthError);
  }, [sessionAuthError]);

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-label text-brand-700">PlayIQ</p>
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Access your plans, opponents, and diagrams. Use the password fields for email sign-ups; use{" "}
        <span className="font-medium text-zinc-800">Continue with Google</span> if you registered with
        Google.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          onClearSessionAuthError?.();
          setLoading(true);
          try {
            await onLogin({ email, password });
          } catch (err) {
            setError(err.message || "Sign in failed");
          } finally {
            setLoading(false);
          }
        }}
      >
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
          Password
          <input
            type="password"
            required
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
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="mt-4">
        <button
          type="button"
          disabled={googleLoading || loading}
          onClick={async () => {
            setError("");
            onClearSessionAuthError?.();
            setGoogleLoading(true);
            try {
              await onGoogleLogin?.();
            } catch (err) {
              setError(err.message || "Google sign-in failed");
            } finally {
              setGoogleLoading(false);
            }
          }}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        >
          {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
        </button>
      </div>
      <button
        type="button"
        onClick={onShowSignup}
        className="mt-4 text-sm font-medium text-brand-700 hover:underline"
      >
        Need an account? Sign up
      </button>
    </div>
  );
}

