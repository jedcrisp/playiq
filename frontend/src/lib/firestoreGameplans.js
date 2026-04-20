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

function requireUserUid() {
  if (!firebaseApp || !db) {
    throw new Error("Firestore is not configured. Set VITE_FIREBASE_* env values.");
  }
  const uid = getAuth(firebaseApp).currentUser?.uid;
  if (!uid) {
    throw new Error("No Firebase session found. Sign in with Google to access Firestore data.");
  }
  return uid;
}

function generateNumericId() {
  // Keep compatibility with existing numeric gameplan IDs used in UI/backend payloads.
  return String(Date.now() * 1000 + Math.floor(Math.random() * 1000));
}

function asIso(value) {
  if (!value) return new Date().toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function mapDoc(snapshot) {
  const data = snapshot.data() || {};
  return {
    id: Number(snapshot.id),
    name: data.name || "",
    visibility: data.visibility || "private",
    team_id: data.team_id ?? null,
    inputs: data.inputs || {},
    recommendation: data.recommendation || {},
    notes: data.notes || {},
    created_at: asIso(data.created_at),
    updated_at: asIso(data.updated_at),
  };
}

export async function listGameplans() {
  const uid = requireUserUid();
  const ref = collection(db, "gameplans");
  const q = query(ref, where("owner_uid", "==", uid), orderBy("updated_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}

export async function createGameplan(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "gameplans", id);
  await setDoc(ref, {
    owner_uid: uid,
    name: payload.name || "",
    visibility: payload.visibility || "private",
    team_id: payload.team_id ?? null,
    inputs: payload.inputs || {},
    recommendation: payload.recommendation || {},
    notes: payload.notes || {},
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const row = await getDoc(ref);
  if (!row.exists()) {
    return {
      id: Number(id),
      name: payload.name || "",
      visibility: payload.visibility || "private",
      team_id: payload.team_id ?? null,
      inputs: payload.inputs || {},
      recommendation: payload.recommendation || {},
      notes: payload.notes || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return mapDoc(row);
}

export async function updateGameplan(id, patch) {
  requireUserUid();
  const ref = doc(db, "gameplans", String(id));
  const update = { updated_at: serverTimestamp() };
  if ("name" in patch) update.name = patch.name;
  if ("visibility" in patch) update.visibility = patch.visibility;
  if ("team_id" in patch) update.team_id = patch.team_id;
  if ("inputs" in patch) update.inputs = patch.inputs;
  if ("recommendation" in patch) update.recommendation = patch.recommendation;
  if ("notes" in patch) update.notes = patch.notes;
  await updateDoc(ref, update);
  return { ok: true };
}

export async function deleteGameplan(id) {
  requireUserUid();
  await deleteDoc(doc(db, "gameplans", String(id)));
  return { ok: true };
}

