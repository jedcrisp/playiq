import { apiUrl } from "../config/api.js";

const jsonHeaders = { "Content-Type": "application/json" };
const TOKEN_KEY = "presnap_auth_token_v1";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredToken(token) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token);
}

function extractErrorMessage(data) {
  const detail = data?.detail;
  if (detail == null) return "Request failed";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message || "Invalid request")
      .join("; ");
  }
  if (typeof detail === "object" && Array.isArray(detail.errors)) {
    return detail.errors.join("; ");
  }
  try {
    return JSON.stringify(detail);
  } catch {
    return "Request failed";
  }
}

export async function fetchOptions() {
  const res = await fetch(apiUrl("/api/options"));
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data;
}

export async function fetchRecommend(payload) {
  const res = await fetch(apiUrl("/api/recommend"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data;
}

async function request(path, init = {}, { auth = true } = {}) {
  const token = getStoredToken();
  const headers = { ...(init.headers || {}) };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (!(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(apiUrl(path), { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(extractErrorMessage(data));
  return data;
}

export async function signUp(payload) {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { auth: false });
}

export async function signIn(payload) {
  return request("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { auth: false });
}

export async function signInWithGoogleIdToken(idToken) {
  return request(
    "/api/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    },
    { auth: false },
  );
}

export async function fetchMe() {
  return request("/api/auth/me");
}

export async function listTeams() {
  return request("/api/teams");
}

export async function listMemberships() {
  return request("/api/teams/memberships");
}

export async function createTeam(payload) {
  return request("/api/teams", { method: "POST", body: JSON.stringify(payload) });
}

export async function joinTeam(payload) {
  return request("/api/teams/join", { method: "POST", body: JSON.stringify(payload) });
}

export async function generateAISummary(payload) {
  return request("/api/ai/summary", { method: "POST", body: JSON.stringify(payload) });
}

export async function runMatchupAnalysis(payload) {
  return request("/api/ai/analysis", { method: "POST", body: JSON.stringify(payload) });
}

export async function sendCoachingChat(payload) {
  return request("/api/ai/chat", { method: "POST", body: JSON.stringify(payload) });
}
