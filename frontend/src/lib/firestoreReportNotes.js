import { getAuth } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
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

export async function createReportNote(payload) {
  const uid = requireUserUid();
  const id = generateNumericId();
  await setDoc(doc(db, "report_notes", id), {
    owner_uid: uid,
    report_type: payload.report_type || "opponent",
    scope_id: payload.scope_id ?? null,
    title: payload.title || "Analytics Note",
    content: payload.content || "",
    tags: payload.tags || "",
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return { id: Number(id), ok: true };
}

