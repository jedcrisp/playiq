import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, getStoredToken, setStoredToken, signIn, signInWithGoogleIdToken, signUp } from "../lib/api.js";
import { consumeGoogleRedirectIdToken, signInWithGoogleRedirect } from "../lib/firebase.js";

const AuthContext = createContext(null);

/** One exchange per page load (Strict Mode / parallel effects share this). */
let googleIdTokenExchangePromise = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const redirectToken = await consumeGoogleRedirectIdToken();
        if (cancelled) return;
        if (redirectToken) {
          if (!googleIdTokenExchangePromise) {
            googleIdTokenExchangePromise = signInWithGoogleIdToken(redirectToken);
          }
          const data = await googleIdTokenExchangePromise;
          if (cancelled) return;
          setAuthError("");
          setStoredToken(data.access_token);
          setUser(data.user);
          setLoading(false);
          return;
        }
      } catch (err) {
        setStoredToken("");
        setUser(null);
        setAuthError(err?.message || "Google sign-in failed. Check API URL and CORS, then try again.");
        setLoading(false);
        return;
      }
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      fetchMe()
        .then((me) => {
          if (!cancelled) setUser(me);
        })
        .catch(() => {
          setStoredToken("");
          setUser(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      clearAuthError() {
        setAuthError("");
      },
      async login(payload) {
        const data = await signIn(payload);
        setStoredToken(data.access_token);
        setUser(data.user);
        setAuthError("");
        return data.user;
      },
      async signup(payload) {
        const data = await signUp(payload);
        setStoredToken(data.access_token);
        setUser(data.user);
        setAuthError("");
        return data.user;
      },
      async loginWithGoogle() {
        setAuthError("");
        await signInWithGoogleRedirect();
      },
      logout() {
        setStoredToken("");
        setUser(null);
        setAuthError("");
      },
      setUser,
    }),
    [user, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

