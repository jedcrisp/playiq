import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  signInWithRedirect,
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
export async function signInWithGoogleRedirect() {
  if (!firebaseApp) {
    throw new Error("Firebase config is missing. Set VITE_FIREBASE_* env values.");
  }
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
}

/** Shared across React Strict Mode double-mounts: second getRedirectResult() is always null. */
let redirectIdTokenPromise = null;

/**
 * Call on app load after returning from Google redirect. Returns ID token or null.
 * Result is cached per page load so Strict Mode / duplicate effects do not consume the redirect twice.
 */
export async function consumeGoogleRedirectIdToken() {
  if (!firebaseApp) return null;
  if (!redirectIdTokenPromise) {
    const auth = getAuth(firebaseApp);
    redirectIdTokenPromise = (async () => {
      const result = await getRedirectResult(auth).catch(() => null);
      if (!result?.user) return null;
      return result.user.getIdToken();
    })();
  }
  return redirectIdTokenPromise;
}

