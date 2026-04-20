import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  finalizeGoogleRedirect,
  firebaseApp,
  firebaseSignInEmailPassword,
  firebaseSignOut,
  firebaseSignUpEmailPassword,
  mapFirebaseUser,
  signInWithGoogleRedirect,
  tryGooglePopupSignIn,
} from "../lib/firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!firebaseApp) {
      setLoading(false);
      return undefined;
    }
    const auth = getAuth(firebaseApp);
    let cancelled = false;
    finalizeGoogleRedirect().then((recovery) => {
      if (!cancelled && recovery) setAuthError(recovery);
    });
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (cancelled) return;
      setUser(mapFirebaseUser(fbUser));
      if (fbUser) setAuthError("");
      setLoading(false);
    });
    return () => {
      cancelled = true;
      unsub();
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
        setAuthError("");
        await firebaseSignInEmailPassword(payload.email, payload.password);
      },
      async signup(payload) {
        setAuthError("");
        await firebaseSignUpEmailPassword(payload.email, payload.password, payload.full_name);
      },
      async loginWithGoogle() {
        setAuthError("");
        const ok = await tryGooglePopupSignIn();
        if (ok && firebaseApp) return getAuth(firebaseApp).currentUser;
        await signInWithGoogleRedirect();
        return null;
      },
      async logout() {
        setAuthError("");
        await firebaseSignOut();
        setUser(null);
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
