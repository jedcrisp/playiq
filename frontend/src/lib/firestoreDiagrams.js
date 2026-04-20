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
import { sanitizeCanvasForFirestore } from "../utils/diagramFirestore.js";

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
    name: data.name || "",
    play_name: data.play_name || "",
    linked_concept_name: data.linked_concept_name || null,
    linked_gameplan_id: data.linked_gameplan_id ?? null,
    linked_opponent_profile_id: data.linked_opponent_profile_id ?? null,
    linked_call_sheet_rank: data.linked_call_sheet_rank ?? null,
    install_note: data.install_note || "",
    visibility: data.visibility || "private",
    team_id: data.team_id ?? null,
    canvas: data.canvas || {},
    reference_image_url: data.reference_image_url || null,
    created_at: asIso(data.created_at),
    updated_at: asIso(data.updated_at),
  };
}

export async function listDiagrams() {
  const uid = requireUserUid();
  const ref = collection(db, "diagrams");
  const q = query(ref, where("owner_uid", "==", uid), orderBy("updated_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapDoc);
}

export async function createDiagram(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "diagrams", id);
  await setDoc(ref, {
    owner_uid: uid,
    name: payload.name || "",
    play_name: payload.play_name || "",
    linked_concept_name: payload.linked_concept_name || null,
    linked_gameplan_id: payload.linked_gameplan_id ?? null,
    linked_opponent_profile_id: payload.linked_opponent_profile_id ?? null,
    linked_call_sheet_rank: payload.linked_call_sheet_rank ?? null,
    install_note: payload.install_note || "",
    visibility: payload.visibility || "private",
    team_id: payload.team_id ?? null,
    canvas: sanitizeCanvasForFirestore(payload.canvas || {}),
    reference_image_url: payload.reference_image_url || null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const row = await getDoc(ref);
  if (!row.exists()) {
    return {
      id: Number(id),
      name: payload.name || "",
      play_name: payload.play_name || "",
      linked_concept_name: payload.linked_concept_name || null,
      linked_gameplan_id: payload.linked_gameplan_id ?? null,
      linked_opponent_profile_id: payload.linked_opponent_profile_id ?? null,
      linked_call_sheet_rank: payload.linked_call_sheet_rank ?? null,
      install_note: payload.install_note || "",
      visibility: payload.visibility || "private",
      team_id: payload.team_id ?? null,
      canvas: sanitizeCanvasForFirestore(payload.canvas || {}),
      reference_image_url: payload.reference_image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return mapDoc(row);
}

export async function updateDiagramById(id, patch) {
  requireUserUid();
  const ref = doc(db, "diagrams", String(id));
  const update = { updated_at: serverTimestamp() };
  if ("name" in patch) update.name = patch.name;
  if ("play_name" in patch) update.play_name = patch.play_name;
  if ("linked_concept_name" in patch) update.linked_concept_name = patch.linked_concept_name;
  if ("linked_gameplan_id" in patch) update.linked_gameplan_id = patch.linked_gameplan_id;
  if ("linked_opponent_profile_id" in patch) {
    update.linked_opponent_profile_id = patch.linked_opponent_profile_id;
  }
  if ("linked_call_sheet_rank" in patch) update.linked_call_sheet_rank = patch.linked_call_sheet_rank;
  if ("install_note" in patch) update.install_note = patch.install_note;
  if ("visibility" in patch) update.visibility = patch.visibility;
  if ("team_id" in patch) update.team_id = patch.team_id;
  if ("canvas" in patch) update.canvas = sanitizeCanvasForFirestore(patch.canvas || {});
  if ("reference_image_url" in patch) update.reference_image_url = patch.reference_image_url;
  await updateDoc(ref, update);
  return { ok: true };
}

export async function deleteDiagramById(id) {
  requireUserUid();
  await deleteDoc(doc(db, "diagrams", String(id)));
  return { ok: true };
}

