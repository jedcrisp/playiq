import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

function hasRequiredConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export const firebaseApp = hasRequiredConfig()
  ? initializeApp(firebaseConfig)
  : null;

export async function initializeFirebaseAnalytics() {
  if (!firebaseApp || typeof window === "undefined") return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getAnalytics(firebaseApp);
}

/**
 * Full-page redirect (no popup). Avoids Cross-Origin-Opener-Policy / window.closed issues on production domains.
 */
/** Set right before leaving for Google; used to detect return + recover ID token if needed. */
const OAUTH_PENDING_KEY = "playiq_google_oauth_pending_ts";
const OAUTH_PENDING_MAX_MS = 20 * 60 * 1000;

function oauthPendingRecent() {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(OAUTH_PENDING_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < OAUTH_PENDING_MAX_MS;
  } catch {
    return false;
  }
}

function markOauthPending() {
  try {
    sessionStorage.setItem(OAUTH_PENDING_KEY, String(Date.now()));
  } catch {
    /* private mode / blocked */
  }
}

function clearOauthPending() {
  try {
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

function oauthRecoveryHintForCurrentHost() {
  if (typeof window === "undefined") {
    return "Use the same site address as when you started, then try again.";
  }
  const { protocol, host, hostname } = window.location;
  const hostUrl = `${protocol}//${host}`;
  if (hostname.startsWith("www.")) {
    const apex = hostname.slice(4);
    return `Use the same site address as when you started (for example always ${hostUrl} or always ${protocol}//${apex}), then try again.`;
  }
  return `Use the same site address as when you started (for example always ${hostUrl} or always ${protocol}//www.${hostname}), then try again.`;
}

/**
 * After redirect, Firebase can attach currentUser asynchronously.
 * Use auth state subscription (with timeout) instead of a short polling loop.
 */
async function waitForRedirectUser(auth, maxMs = 8000) {
  if (auth.currentUser) return auth.currentUser;
  return new Promise((resolve) => {
    let done = false;
    const finish = (user) => {
      if (done) return;
      done = true;
      try {
        unsubscribe();
      } catch {
        /* ignore */
      }
      clearTimeout(timer);
      resolve(user || auth.currentUser || null);
    };
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => finish(user),
      () => finish(null),
    );
    const timer = setTimeout(() => finish(null), maxMs);
  });
}

export async function signInWithGoogleRedirect() {
  if (!firebaseApp) {
    throw new Error("Firebase config is missing. Set VITE_FIREBASE_* env values.");
  }
  markOauthPending();
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
}

/**
 * Try Google popup first; return true when signed in, false to fall back to redirect.
 */
export async function tryGooglePopupSignIn() {
  if (!firebaseApp) {
    throw new Error("Firebase config is missing. Set VITE_FIREBASE_* env values.");
  }
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(auth, provider);
    if (!result?.user) return false;
    clearOauthPending();
    return true;
  } catch (err) {
    const code = String(err?.code || "");
    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      return false;
    }
    throw err;
  }
}

/** Shared across React Strict Mode double-mounts: second getRedirectResult() is always null. */
let redirectCompletionPromise = null;

/**
 * After Google redirect, recover session via getRedirectResult / auth state.
 * Returns a user-facing recovery message when OAuth was expected but no user appeared.
 */
export async function finalizeGoogleRedirect() {
  if (!firebaseApp) return null;
  if (!redirectCompletionPromise) {
    const auth = getAuth(firebaseApp);
    redirectCompletionPromise = (async () => {
      const pending = oauthPendingRecent();
      const result = await getRedirectResult(auth).catch(() => null);
      let user = result?.user ?? null;

      if (!user) {
        user = await waitForRedirectUser(auth);
      }

      if (user) {
        clearOauthPending();
        return null;
      }

      if (pending) {
        clearOauthPending();
        return `Google sign-in did not finish in this tab. ${oauthRecoveryHintForCurrentHost()}`;
      }

      return null;
    })();
  }
  return redirectCompletionPromise;
}

export function mapFirebaseUser(fbUser) {
  if (!fbUser) return null;
  const email = fbUser.email || "";
  const full_name = fbUser.displayName?.trim() || email.split("@")[0] || "Coach";
  return { id: fbUser.uid, email, full_name };
}

export async function firebaseSignOut() {
  if (!firebaseApp) return;
  await signOut(getAuth(firebaseApp));
}

export async function firebaseSignInEmailPassword(email, password) {
  if (!firebaseApp) throw new Error("Firebase config is missing. Set VITE_FIREBASE_* env values.");
  const auth = getAuth(firebaseApp);
  await signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function firebaseSignUpEmailPassword(email, password, displayName) {
  if (!firebaseApp) throw new Error("Firebase config is missing. Set VITE_FIREBASE_* env values.");
  const auth = getAuth(firebaseApp);
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (displayName?.trim()) {
    await updateProfile(cred.user, { displayName: displayName.trim() });
  }
}

