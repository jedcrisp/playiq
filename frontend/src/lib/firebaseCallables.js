import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./firebase.js";

function functionsInstance() {
  if (!firebaseApp) throw new Error("Firebase is not configured.");
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-central1";
  return getFunctions(firebaseApp, region);
}

function mapCallableError(err) {
  const code = err?.code || "";
  const msg = err?.message || "Request failed";
  if (code === "functions/unauthenticated") return new Error("Sign in expired. Please sign in again.");
  if (code === "functions/invalid-argument") {
    try {
      const parsed = JSON.parse(msg);
      if (Array.isArray(parsed)) return new Error(parsed.join("; "));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return new Error(
          Object.entries(parsed)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join("; ") || msg,
        );
      }
    } catch {
      /* use msg */
    }
    return new Error(msg);
  }
  return new Error(msg);
}

async function call(name, data) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  if (!user) throw new Error("Sign in required.");
  await user.getIdToken();
  const fn = httpsCallable(functionsInstance(), name, { timeout: 120000 });
  try {
    const res = await fn(data);
    return res.data;
  } catch (e) {
    throw mapCallableError(e);
  }
}

export async function fetchRecommend(payload) {
  return call("api_recommend", payload);
}

export async function generateAISummary({ matchup_context }) {
  return call("ai_summary", { matchup_context });
}

export async function runMatchupAnalysis({ question, matchup_context }) {
  return call("ai_analysis", { question, matchup_context });
}

export async function sendCoachingChat(body) {
  const { session_id, gameplan_id, opponent_profile_id, user_message, history, matchup_context } = body;
  return call("ai_chat", {
    session_id: session_id ?? null,
    gameplan_id: gameplan_id ?? null,
    opponent_profile_id: opponent_profile_id ?? null,
    user_message,
    history: history || [],
    matchup_context: matchup_context || {},
  });
}
