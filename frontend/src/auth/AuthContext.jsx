import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, getStoredToken, setStoredToken, signIn, signInWithGoogleIdToken, signUp } from "../lib/api.js";
import { consumeGoogleRedirectIdToken, signInWithGoogleRedirect } from "../lib/firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const redirectToken = await consumeGoogleRedirectIdToken();
        if (cancelled) return;
        if (redirectToken) {
          const data = await signInWithGoogleIdToken(redirectToken);
          if (cancelled) return;
          setStoredToken(data.access_token);
          setUser(data.user);
          setLoading(false);
          return;
        }
      } catch {
        setStoredToken("");
        setUser(null);
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
      async login(payload) {
        const data = await signIn(payload);
        setStoredToken(data.access_token);
        setUser(data.user);
        return data.user;
      },
      async signup(payload) {
        const data = await signUp(payload);
        setStoredToken(data.access_token);
        setUser(data.user);
        return data.user;
      },
      async loginWithGoogle() {
        await signInWithGoogleRedirect();
      },
      logout() {
        setStoredToken("");
        setUser(null);
      },
      setUser,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

