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
    opponent_name: data.opponent_name || "",
    team_level: data.team_level || "",
    notes: data.notes || "",
    visibility: data.visibility || "private",
    team_id: data.team_id ?? null,
    tendencies: data.tendencies || {},
    analyst_notes: data.analyst_notes || {},
    created_at: asIso(data.created_at),
    updated_at: asIso(data.updated_at),
  };
}

export async function listOpponents() {
  const uid = requireUserUid();
  const ref = collection(db, "opponents");
  const q = query(ref, where("owner_uid", "==", uid), orderBy("updated_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}

export async function createOpponent(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "opponents", id);
  await setDoc(ref, {
    owner_uid: uid,
    opponent_name: payload.opponent_name || "",
    team_level: payload.team_level || "",
    notes: payload.notes || "",
    visibility: payload.visibility || "private",
    team_id: payload.team_id ?? null,
    tendencies: payload.tendencies || {},
    analyst_notes: payload.analyst_notes || {},
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const row = await getDoc(ref);
  if (!row.exists()) {
    return {
      id: Number(id),
      opponent_name: payload.opponent_name || "",
      team_level: payload.team_level || "",
      notes: payload.notes || "",
      visibility: payload.visibility || "private",
      team_id: payload.team_id ?? null,
      tendencies: payload.tendencies || {},
      analyst_notes: payload.analyst_notes || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return mapDoc(row);
}

export async function updateOpponent(id, patch) {
  requireUserUid();
  const ref = doc(db, "opponents", String(id));
  const update = { updated_at: serverTimestamp() };
  if ("opponent_name" in patch) update.opponent_name = patch.opponent_name;
  if ("team_level" in patch) update.team_level = patch.team_level;
  if ("notes" in patch) update.notes = patch.notes;
  if ("visibility" in patch) update.visibility = patch.visibility;
  if ("team_id" in patch) update.team_id = patch.team_id;
  if ("tendencies" in patch) update.tendencies = patch.tendencies;
  if ("analyst_notes" in patch) update.analyst_notes = patch.analyst_notes;
  await updateDoc(ref, update);
  return { ok: true };
}

export async function deleteOpponentById(id) {
  requireUserUid();
  await deleteDoc(doc(db, "opponents", String(id)));
  return { ok: true };
}

