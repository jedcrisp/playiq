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

export async function listGameplans() {
  return request("/api/gameplans");
}
export async function createGameplan(payload) {
  return request("/api/gameplans", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateGameplan(id, payload) {
  return request(`/api/gameplans/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}
export async function deleteGameplan(id) {
  return request(`/api/gameplans/${id}`, { method: "DELETE" });
}

export async function listOpponents() {
  return request("/api/opponents");
}
export async function createOpponent(payload) {
  return request("/api/opponents", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateOpponent(id, payload) {
  return request(`/api/opponents/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}
export async function deleteOpponentById(id) {
  return request(`/api/opponents/${id}`, { method: "DELETE" });
}

export async function listDiagrams() {
  return request("/api/diagrams");
}
export async function createDiagram(payload) {
  return request("/api/diagrams", { method: "POST", body: JSON.stringify(payload) });
}
export async function updateDiagramById(id, payload) {
  return request(`/api/diagrams/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}
export async function deleteDiagramById(id) {
  return request(`/api/diagrams/${id}`, { method: "DELETE" });
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

function withQuery(path, params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) q.set(k, String(v));
  });
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return `${path}${suffix}`;
}

export async function listScoutingPlays(params = {}) {
  return request(withQuery("/api/scouting/plays", params));
}

export async function createScoutingPlay(payload) {
  return request("/api/scouting/plays", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateScoutingPlay(id, payload) {
  return request(`/api/scouting/plays/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteScoutingPlay(id) {
  return request(`/api/scouting/plays/${id}`, { method: "DELETE" });
}

export async function importScoutingCSV({ file, teamId = "", side = "defense" }) {
  const form = new FormData();
  form.append("file", file);
  if (teamId !== "" && teamId !== null && teamId !== undefined) form.append("team_id", String(teamId));
  form.append("side", side);
  return request("/api/scouting/import", { method: "POST", body: form });
}

export async function getScoutingTemplate() {
  return request("/api/scouting/template");
}

export async function getOpponentAnalytics(params = {}) {
  return request(withQuery("/api/analytics/opponent", params));
}

export async function getSelfScoutAnalytics(params = {}) {
  return request(withQuery("/api/analytics/self-scout", params));
}

export async function getOpponentBridgeSummary(opponentProfileId) {
  const suffix = opponentProfileId ? `?opponent_profile_id=${encodeURIComponent(opponentProfileId)}` : "";
  return request(`/api/analytics/bridge/opponent-summary${suffix}`);
}

export async function listReportNotes(params = {}) {
  return request(withQuery("/api/analytics/report-notes", params));
}

export async function createReportNote(payload) {
  return request("/api/analytics/report-notes", { method: "POST", body: JSON.stringify(payload) });
}

export async function getFormationIntelligence(params = {}) {
  return request(withQuery("/api/formation-intelligence", params));
}

export async function listScripts() {
  return request("/api/scripts");
}

export async function createScript(payload) {
  return request("/api/scripts", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateScript(id, payload) {
  return request(`/api/scripts/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteScript(id) {
  return request(`/api/scripts/${id}`, { method: "DELETE" });
}

export async function listScriptEntries(scriptId) {
  return request(`/api/scripts/${scriptId}/entries`);
}

export async function createScriptEntry(scriptId, payload) {
  return request(`/api/scripts/${scriptId}/entries`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateScriptEntry(entryId, payload) {
  return request(`/api/scripts/entries/${entryId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteScriptEntry(entryId) {
  return request(`/api/scripts/entries/${entryId}`, { method: "DELETE" });
}

export async function reorderScriptEntries(scriptId, entryIds) {
  return request(`/api/scripts/${scriptId}/reorder`, {
    method: "POST",
    body: JSON.stringify({ entry_ids: entryIds }),
  });
}

export async function listSituationPlans() {
  return request("/api/situations");
}

export async function createSituationPlan(payload) {
  return request("/api/situations", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateSituationPlan(id, payload) {
  return request(`/api/situations/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteSituationPlan(id) {
  return request(`/api/situations/${id}`, { method: "DELETE" });
}

export async function listSituationCalls(planId) {
  return request(`/api/situations/${planId}/calls`);
}

export async function createSituationCall(planId, payload) {
  return request(`/api/situations/${planId}/calls`, { method: "POST", body: JSON.stringify(payload) });
}

export async function updateSituationCall(callId, payload) {
  return request(`/api/situations/calls/${callId}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteSituationCall(callId) {
  return request(`/api/situations/calls/${callId}`, { method: "DELETE" });
}
