/**
 * Play diagram persistence (localStorage).
 */

import { emptyCanvas } from "../utils/diagramDefaults.js";

const STORAGE_KEY = "presnap_diagrams_v1";

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

export function generateDiagramId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function validateDiagram(d) {
  if (!isRecord(d)) return false;
  if (typeof d.id !== "string" || !d.id) return false;
  if (typeof d.name !== "string") return false;
  if (!isRecord(d.canvas)) return false;
  return true;
}

function normalizeDiagramShape(d) {
  const now = new Date().toISOString();
  const baseCanvas = emptyCanvas();
  const c = isRecord(d.canvas) ? d.canvas : {};
  const canvas = {
    ...baseCanvas,
    ...c,
    offenseMarkers: Array.isArray(c.offenseMarkers) ? c.offenseMarkers : [],
    defenseMarkers: Array.isArray(c.defenseMarkers) ? c.defenseMarkers : [],
    routes: Array.isArray(c.routes) ? c.routes : [],
    motionPaths: Array.isArray(c.motionPaths) ? c.motionPaths : [],
    blockPaths: Array.isArray(c.blockPaths) ? c.blockPaths : [],
    field: c.field === "full" ? "full" : "half",
  };
  return {
    ...d,
    name: typeof d.name === "string" ? d.name : "Untitled play",
    playName: typeof d.playName === "string" ? d.playName : "",
    linkedConceptName: d.linkedConceptName ?? null,
    linkedGameplanId: d.linkedGameplanId ?? null,
    linkedOpponentId: d.linkedOpponentId ?? null,
    linkedCallSheetRank:
      typeof d.linkedCallSheetRank === "number" ? d.linkedCallSheetRank : null,
    installNote: typeof d.installNote === "string" ? d.installNote : "",
    canvas,
    createdAt: typeof d.createdAt === "string" ? d.createdAt : now,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : now,
  };
}

export function loadDiagrams() {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(validateDiagram);
}

function writeAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function saveDiagram(diagram) {
  const id =
    diagram.id && typeof diagram.id === "string" && diagram.id.length > 0
      ? diagram.id
      : generateDiagramId();
  const now = new Date().toISOString();
  const normalized = normalizeDiagramShape({
    ...diagram,
    id,
    createdAt: diagram.createdAt || now,
    updatedAt: now,
  });
  const list = loadDiagrams().filter((d) => d.id !== normalized.id);
  list.unshift(normalized);
  writeAll(list);
  return list;
}

export function updateDiagram(id, patch) {
  const list = loadDiagrams();
  const idx = list.findIndex((d) => d.id === id);
  if (idx === -1) return list;
  const now = new Date().toISOString();
  const merged = normalizeDiagramShape({
    ...list[idx],
    ...patch,
    id,
    updatedAt: now,
  });
  const next = [...list];
  next[idx] = merged;
  writeAll(next);
  return next;
}

export function deleteDiagram(id) {
  const list = loadDiagrams().filter((d) => d.id !== id);
  writeAll(list);
  return list;
}

export function getDiagramById(id) {
  return loadDiagrams().find((d) => d.id === id) ?? null;
}

/** Diagrams linked to a concept name, gameplan, and/or opponent (any match). */
export function getDiagramsForContext({
  conceptName = null,
  gameplanId = null,
  opponentId = null,
}) {
  return loadDiagrams().filter((d) => {
    const byConcept =
      conceptName &&
      d.linkedConceptName &&
      d.linkedConceptName === conceptName;
    const byGp = gameplanId && d.linkedGameplanId === gameplanId;
    const byOp = opponentId && d.linkedOpponentId === opponentId;
    return Boolean(byConcept || byGp || byOp);
  });
}

export function filterDiagramsSearch(diagrams, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return diagrams;
  return diagrams.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      (d.linkedConceptName && d.linkedConceptName.toLowerCase().includes(q)) ||
      (d.playName && d.playName.toLowerCase().includes(q)),
  );
}

/** Filter a diagram list for an install sheet (concept + optional active gameplan). */
export function selectDiagramsForInstall(diagrams, { conceptName, gameplanId = null }) {
  if (!conceptName || !Array.isArray(diagrams)) return [];
  return diagrams.filter((d) => {
    if (!d.linkedConceptName || d.linkedConceptName !== conceptName) return false;
    if (d.linkedGameplanId && gameplanId && d.linkedGameplanId !== gameplanId) {
      return false;
    }
    return true;
  });
}

export function getDiagramsForInstall({ conceptName, gameplanId = null }) {
  return selectDiagramsForInstall(loadDiagrams(), { conceptName, gameplanId });
}
