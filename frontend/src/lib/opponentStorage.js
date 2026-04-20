const STORAGE_KEY = "playiq_opponent_profiles_v1";

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

const emptyNotes = () => ({
  scouting: "",
  coaching: "",
  emphasis: "",
});

const emptyTendencies = () => ({
  baseFront: "",
  primaryCoverage: "",
  secondaryCoverage: "",
  pressureTendency: "",
  keyDefender: "",
  weaknessType: "",
  offensiveStyle: "",
  scoutingNotes: "",
});

export function generateOpponentId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeProfile(raw) {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (typeof raw.opponentName !== "string") return null;
  const t = isRecord(raw.tendencies) ? raw.tendencies : {};
  const an = isRecord(raw.analystNotes) ? raw.analystNotes : {};
  return {
    id: raw.id,
    opponentName: raw.opponentName,
    teamLevel: typeof raw.teamLevel === "string" ? raw.teamLevel : "",
    notes: typeof raw.notes === "string" ? raw.notes : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : new Date().toISOString(),
    tendencies: {
      ...emptyTendencies(),
      ...t,
    },
    analystNotes: {
      ...emptyNotes(),
      ...an,
    },
  };
}

export function loadOpponents() {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(normalizeProfile).filter(Boolean);
}

function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function saveOpponent(profile) {
  const list = loadOpponents().filter((p) => p.id !== profile.id);
  list.unshift(profile);
  writeAll(list);
  return list;
}

export function deleteOpponent(id) {
  const list = loadOpponents().filter((p) => p.id !== id);
  writeAll(list);
  return list;
}

/** Map opponent tendencies → PlayIQ form `values` keys */
export function tendenciesToFormValues(tendencies, fallback = {}) {
  const t = tendencies || {};
  return {
    defensive_front: t.baseFront || fallback.defensive_front || "",
    coverage_shell: t.primaryCoverage || fallback.coverage_shell || "",
    pressure_tendency: t.pressureTendency || fallback.pressure_tendency || "",
    defender_to_attack: t.keyDefender || fallback.defender_to_attack || "",
    weakness_type: t.weaknessType || fallback.weakness_type || "",
    offensive_style: t.offensiveStyle || fallback.offensive_style || "",
  };
}
