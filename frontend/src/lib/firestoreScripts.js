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
  writeBatch,
} from "firebase/firestore";
import { firebaseApp } from "./firebase.js";
import { db } from "./firestoreClient.js";

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

function mapScript(snapshot) {
  const d = snapshot.data() || {};
  return {
    id: Number(snapshot.id),
    name: d.name || "",
    opponent_profile_id: d.opponent_profile_id ?? null,
    gameplan_id: d.gameplan_id ?? null,
    week_label: d.week_label || "",
    total_planned_calls: Number(d.total_planned_calls || 15),
    notes: d.notes || "",
    team_id: d.team_id ?? null,
    created_at: asIso(d.created_at),
    updated_at: asIso(d.updated_at),
  };
}

function mapEntry(snapshot) {
  const d = snapshot.data() || {};
  return {
    id: Number(snapshot.id),
    script_id: Number(d.script_id),
    position: Number(d.position || 1),
    play_name: d.play_name || "",
    formation: d.formation || "",
    motion: d.motion || "",
    objective_tag: d.objective_tag || "",
    target_defensive_look: d.target_defensive_look || "",
    why_included: d.why_included || "",
    expected_defensive_reaction: d.expected_defensive_reaction || "",
    next_call: d.next_call || "",
    notes: d.notes || "",
    created_at: asIso(d.created_at),
    updated_at: asIso(d.updated_at),
  };
}

export async function listScripts() {
  const uid = requireUserUid();
  const q = query(collection(db, "scripts"), where("owner_uid", "==", uid), orderBy("updated_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapScript);
}

export async function createScript(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "scripts", id);
  await setDoc(ref, { owner_uid: uid, ...payload, created_at: serverTimestamp(), updated_at: serverTimestamp() });
  const row = await getDoc(ref);
  return row.exists() ? mapScript(row) : { id: Number(id), ...payload };
}

export async function updateScript(id, payload) {
  requireUserUid();
  await updateDoc(doc(db, "scripts", String(id)), { ...payload, updated_at: serverTimestamp() });
  return { ok: true };
}

export async function deleteScript(id) {
  requireUserUid();
  const entrySnap = await getDocs(query(collection(db, "script_entries"), where("script_id", "==", Number(id))));
  const batch = writeBatch(db);
  entrySnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "scripts", String(id)));
  await batch.commit();
  return { ok: true };
}

export async function listScriptEntries(scriptId) {
  const uid = requireUserUid();
  const q = query(
    collection(db, "script_entries"),
    where("owner_uid", "==", uid),
    where("script_id", "==", Number(scriptId)),
    orderBy("position", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapEntry);
}

export async function createScriptEntry(scriptId, payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "script_entries", id);
  await setDoc(ref, {
    owner_uid: uid,
    script_id: Number(scriptId),
    ...payload,
    position: Number(payload.position || 1),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const row = await getDoc(ref);
  return row.exists() ? mapEntry(row) : { id: Number(id), script_id: Number(scriptId), ...payload };
}

export async function updateScriptEntry(entryId, payload) {
  requireUserUid();
  await updateDoc(doc(db, "script_entries", String(entryId)), { ...payload, updated_at: serverTimestamp() });
  return { ok: true };
}

export async function deleteScriptEntry(entryId) {
  requireUserUid();
  await deleteDoc(doc(db, "script_entries", String(entryId)));
  return { ok: true };
}

export async function reorderScriptEntries(scriptId, entryIds) {
  requireUserUid();
  const batch = writeBatch(db);
  entryIds.forEach((id, idx) => {
    batch.update(doc(db, "script_entries", String(id)), {
      script_id: Number(scriptId),
      position: idx + 1,
      updated_at: serverTimestamp(),
    });
  });
  await batch.commit();
  return { ok: true };
}

