/**
 * Persist saved gameplans in localStorage (no backend).
 * Schema versioned via STORAGE_KEY for future migrations.
 */

const STORAGE_KEY = "presnap_saved_gameplans_v2";

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

function validateGameplan(g) {
  if (!isRecord(g)) return false;
  if (typeof g.id !== "string" || !g.id) return false;
  if (typeof g.name !== "string") return false;
  if (typeof g.createdAt !== "string") return false;
  if (!isRecord(g.inputs)) return false;
  if (!isRecord(g.recommendation)) return false;
  if (typeof g.recommendation.matched_rule !== "string") return false;
  if (!Array.isArray(g.recommendation.recommendations)) return false;
  return true;
}

function migrateV1List(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(validateGameplan)
    .map((g) => ({
      ...g,
      notes: isRecord(g.notes) ? { ...emptyNotes(), ...g.notes } : emptyNotes(),
    }));
}

export function generateGameplanId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `gp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadSavedGameplans() {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = safeParse(raw);
    return migrateV1List(parsed);
  }
  const legacyRaw = localStorage.getItem("presnap_saved_gameplans_v1");
  if (legacyRaw) {
    const migrated = migrateV1List(safeParse(legacyRaw));
    if (migrated.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  }
  return [];
}

function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function saveGameplanToStorage(gameplan) {
  const list = loadSavedGameplans();
  const normalized = {
    ...gameplan,
    notes: isRecord(gameplan.notes)
      ? { ...emptyNotes(), ...gameplan.notes }
      : emptyNotes(),
  };
  const next = [normalized, ...list.filter((g) => g.id !== normalized.id)];
  writeAll(next);
  return next;
}

export function deleteGameplanFromStorage(id) {
  const list = loadSavedGameplans().filter((g) => g.id !== id);
  writeAll(list);
  return list;
}

export function updateGameplanNotes(id, notes) {
  const list = loadSavedGameplans().map((g) =>
    g.id === id
      ? { ...g, notes: { ...emptyNotes(), ...notes } }
      : g,
  );
  writeAll(list);
  return list;
}
