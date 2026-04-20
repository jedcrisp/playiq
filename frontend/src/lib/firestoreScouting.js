import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseApp } from "./firebase.js";
import { db } from "./firestoreClient.js";

const TEMPLATE_HEADERS = [
  "game_label",
  "side",
  "down",
  "distance_bucket",
  "field_zone",
  "hash",
  "personnel",
  "formation",
  "motion",
  "defensive_front",
  "coverage_shell",
  "pressure_type",
  "concept_name",
  "yards",
  "explosive",
  "success",
  "play_type",
  "result_notes",
  "tags",
  "opponent_profile_id",
];

function requireUserUid() {
  if (!firebaseApp || !db) throw new Error("Firestore is not configured. Set VITE_FIREBASE_* env values.");
  const uid = getAuth(firebaseApp).currentUser?.uid;
  if (!uid) throw new Error("No Firebase session found. Sign in with Google to access Firestore data.");
  return uid;
}

function generateNumericId() {
  return String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

function asIso(value) {
  if (!value) return new Date().toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function parseBool(v) {
  if (typeof v === "boolean") return v;
  return String(v || "").toLowerCase() === "true" || String(v || "") === "1";
}

function mapDoc(snapshot) {
  const d = snapshot.data() || {};
  return {
    id: Number(snapshot.id),
    game_label: d.game_label || "",
    side: d.side || "defense",
    down: Number(d.down || 1),
    distance_bucket: d.distance_bucket || "",
    field_zone: d.field_zone || "",
    hash: d.hash || "",
    personnel: d.personnel || "",
    formation: d.formation || "",
    motion: d.motion || "",
    defensive_front: d.defensive_front || "",
    coverage_shell: d.coverage_shell || "",
    pressure_type: d.pressure_type || "",
    concept_name: d.concept_name || "",
    yards: Number(d.yards || 0),
    explosive: parseBool(d.explosive),
    success: parseBool(d.success),
    play_type: d.play_type || "pass",
    result_notes: d.result_notes || "",
    tags: d.tags || "",
    opponent_profile_id: d.opponent_profile_id ?? null,
    created_at: asIso(d.created_at),
    updated_at: asIso(d.updated_at),
  };
}

function applyFilters(rows, params = {}) {
  return rows.filter((r) => {
    if (params.game_label && !String(r.game_label).toLowerCase().includes(String(params.game_label).toLowerCase())) return false;
    if (params.side && r.side !== params.side) return false;
    if (params.down && Number(r.down) !== Number(params.down)) return false;
    if (params.distance_bucket && r.distance_bucket !== params.distance_bucket) return false;
    if (params.field_zone && r.field_zone !== params.field_zone) return false;
    return true;
  });
}

export async function listScoutingPlays(params = {}) {
  const uid = requireUserUid();
  const q = query(collection(db, "scouting_plays"), where("owner_uid", "==", uid), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return applyFilters(snap.docs.map(mapDoc), params);
}

export async function createScoutingPlay(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "scouting_plays", id);
  await setDoc(ref, {
    owner_uid: uid,
    ...payload,
    down: Number(payload.down || 1),
    yards: Number(payload.yards || 0),
    explosive: Boolean(payload.explosive),
    success: Boolean(payload.success),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const row = await getDoc(ref);
  return row.exists() ? mapDoc(row) : { id: Number(id), ...payload };
}

export async function updateScoutingPlay(id, patch) {
  requireUserUid();
  await updateDoc(doc(db, "scouting_plays", String(id)), { ...patch, updated_at: serverTimestamp() });
  return { ok: true };
}

export async function deleteScoutingPlay(id) {
  requireUserUid();
  await deleteDoc(doc(db, "scouting_plays", String(id)));
  return { ok: true };
}

function csvRowToObject(headers, line) {
  const values = line.split(",").map((x) => x.trim());
  const out = {};
  headers.forEach((h, i) => {
    out[h] = values[i] ?? "";
  });
  return out;
}

export async function importScoutingCSV({ file, teamId = "", side = "defense" }) {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { inserted: 0, errors: ["CSV file is empty"] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const missing = TEMPLATE_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length) return { inserted: 0, errors: [`Missing CSV columns: ${missing.join(", ")}`] };
  const errors = [];
  let inserted = 0;
  for (let i = 1; i < lines.length; i += 1) {
    try {
      const raw = csvRowToObject(headers, lines[i]);
      await createScoutingPlay({
        ...raw,
        side: raw.side || side,
        team_id: teamId ? Number(teamId) : null,
        down: Number(raw.down || 1),
        yards: Number(raw.yards || 0),
        explosive: parseBool(raw.explosive),
        success: parseBool(raw.success),
        opponent_profile_id: raw.opponent_profile_id ? Number(raw.opponent_profile_id) : null,
      });
      inserted += 1;
    } catch (err) {
      errors.push(`Row ${i + 1}: ${err?.message || "Could not import row"}`);
    }
  }
  return { inserted, errors };
}

export async function getScoutingTemplate() {
  return { csv: `${TEMPLATE_HEADERS.join(",")}\n` };
}

