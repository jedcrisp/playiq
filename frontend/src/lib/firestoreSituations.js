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

function mapPlan(snapshot) {
  const d = snapshot.data() || {};
  return {
    id: Number(snapshot.id),
    title: d.title || "",
    situation_type: d.situation_type || "",
    gameplan_id: d.gameplan_id ?? null,
    opponent_profile_id: d.opponent_profile_id ?? null,
    alerts_risks: d.alerts_risks || "",
    expected_defensive_tendencies: d.expected_defensive_tendencies || "",
    best_counters: d.best_counters || "",
    coaching_note: d.coaching_note || "",
    team_id: d.team_id ?? null,
    created_at: asIso(d.created_at),
    updated_at: asIso(d.updated_at),
  };
}

function mapCall(snapshot) {
  const d = snapshot.data() || {};
  return {
    id: Number(snapshot.id),
    plan_id: Number(d.plan_id),
    priority: Number(d.priority || 1),
    concept_name: d.concept_name || "",
    formation: d.formation || "",
    motion: d.motion || "",
    linked_diagram_id: d.linked_diagram_id ?? null,
    note: d.note || "",
    created_at: asIso(d.created_at),
    updated_at: asIso(d.updated_at),
  };
}

export async function listSituationPlans() {
  const uid = requireUserUid();
  const q = query(collection(db, "situation_plans"), where("owner_uid", "==", uid), orderBy("updated_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapPlan);
}

export async function createSituationPlan(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "situation_plans", id);
  await setDoc(ref, { owner_uid: uid, ...payload, created_at: serverTimestamp(), updated_at: serverTimestamp() });
  const row = await getDoc(ref);
  return row.exists() ? mapPlan(row) : { id: Number(id), ...payload };
}

export async function updateSituationPlan(id, payload) {
  requireUserUid();
  await updateDoc(doc(db, "situation_plans", String(id)), { ...payload, updated_at: serverTimestamp() });
  return { ok: true };
}

export async function deleteSituationPlan(id) {
  requireUserUid();
  const callSnap = await getDocs(query(collection(db, "situation_calls"), where("plan_id", "==", Number(id))));
  const batch = writeBatch(db);
  callSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "situation_plans", String(id)));
  await batch.commit();
  return { ok: true };
}

export async function listSituationCalls(planId) {
  const uid = requireUserUid();
  const q = query(
    collection(db, "situation_calls"),
    where("owner_uid", "==", uid),
    where("plan_id", "==", Number(planId)),
    orderBy("priority", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapCall);
}

export async function createSituationCall(planId, payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  const ref = doc(db, "situation_calls", id);
  await setDoc(ref, {
    owner_uid: uid,
    plan_id: Number(planId),
    ...payload,
    priority: Number(payload.priority || 1),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const row = await getDoc(ref);
  return row.exists() ? mapCall(row) : { id: Number(id), plan_id: Number(planId), ...payload };
}

export async function updateSituationCall(callId, payload) {
  requireUserUid();
  await updateDoc(doc(db, "situation_calls", String(callId)), { ...payload, updated_at: serverTimestamp() });
  return { ok: true };
}

export async function deleteSituationCall(callId) {
  requireUserUid();
  await deleteDoc(doc(db, "situation_calls", String(callId)));
  return { ok: true };
}

