import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMe, getStoredToken, setStoredToken, signIn, signInWithGoogleIdToken, signUp } from "../lib/api.js";
import { signInWithGooglePopup } from "../lib/firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((me) => setUser(me))
      .catch(() => {
        setStoredToken("");
        setUser(null);
      })
      .finally(() => setLoading(false));
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
        const idToken = await signInWithGooglePopup();
        const data = await signInWithGoogleIdToken(idToken);
        setStoredToken(data.access_token);
        setUser(data.user);
        return data.user;
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

