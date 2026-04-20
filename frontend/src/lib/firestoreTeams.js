import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseApp } from "./firebase.js";
import { db } from "./firestoreClient.js";

function requireUserUid() {
  if (!firebaseApp || !db) throw new Error("Firestore is not configured. Set VITE_FIREBASE_* env values.");
  const uid = getAuth(firebaseApp).currentUser?.uid;
  if (!uid) throw new Error("No Firebase session found. Sign in to manage teams.");
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

function membershipDocId(uid, teamId) {
  return `${uid}_${String(teamId)}`;
}

function mapTeam(snap) {
  const d = snap.data() || {};
  return {
    id: Number(snap.id),
    name: d.name || "",
    owner_user_id: 0,
    created_at: asIso(d.created_at),
    updated_at: asIso(d.updated_at),
  };
}

function mapMembership(docSnap) {
  const d = docSnap.data() || {};
  return {
    id: docSnap.id,
    user_id: d.user_uid || "",
    team_id: Number(d.team_id),
    role: d.role || "coach",
    created_at: asIso(d.created_at),
  };
}

export async function listTeams() {
  const uid = requireUserUid();
  const mq = query(collection(db, "team_memberships"), where("user_uid", "==", uid));
  const ms = await getDocs(mq);
  const teamIds = [...new Set(ms.docs.map((x) => x.data().team_id).filter(Boolean))];
  const teams = [];
  for (const tid of teamIds) {
    const ref = doc(db, "teams", String(tid));
    const snap = await getDoc(ref);
    if (snap.exists()) teams.push(mapTeam(snap));
  }
  teams.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return teams;
}

export async function listMemberships() {
  const uid = requireUserUid();
  const mq = query(collection(db, "team_memberships"), where("user_uid", "==", uid));
  const ms = await getDocs(mq);
  return ms.docs.map(mapMembership);
}

export async function createTeam(payload) {
  const uid = requireUserUid();
  const cleaned = String(payload?.name || "").trim();
  if (cleaned.length < 2) throw new Error("Team name must be at least 2 characters.");
  const teamId = generateNumericId();
  const teamRef = doc(db, "teams", teamId);
  const memRef = doc(db, "team_memberships", membershipDocId(uid, teamId));

  const existingName = await getDocs(
    query(collection(db, "team_memberships"), where("user_uid", "==", uid)),
  );
  for (const m of existingName.docs) {
    const tid = m.data().team_id;
    if (!tid) continue;
    const ts = await getDoc(doc(db, "teams", String(tid)));
    if (ts.exists() && (ts.data()?.name || "").trim().toLowerCase() === cleaned.toLowerCase()) {
      throw new Error("You already have a team with this name. Pick a different name.");
    }
  }

  const batch = writeBatch(db);
  batch.set(teamRef, {
    owner_uid: uid,
    name: cleaned,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  batch.set(memRef, {
    user_uid: uid,
    team_id: teamId,
    role: "admin",
    created_at: serverTimestamp(),
  });
  await batch.commit();
  const row = await getDoc(teamRef);
  return mapTeam(row);
}

export async function joinTeam(payload) {
  const uid = requireUserUid();
  const teamId = String(payload.team_id);
  const teamRef = doc(db, "teams", teamId);
  const ts = await getDoc(teamRef);
  if (!ts.exists()) throw new Error("Team not found.");
  const memRef = doc(db, "team_memberships", membershipDocId(uid, teamId));
  const existing = await getDoc(memRef);
  if (existing.exists()) {
    return mapMembership(existing);
  }
  await setDoc(memRef, {
    user_uid: uid,
    team_id: teamId,
    role: payload.role === "admin" ? "admin" : "coach",
    created_at: serverTimestamp(),
  });
  const row = await getDoc(memRef);
  return mapMembership(row);
}
