import { getAuth } from "firebase/auth";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { firebaseApp } from "./firebase.js";
import { db } from "./firestoreClient.js";

function requireUserUid() {
  if (!firebaseApp || !db) throw new Error("Firestore is not configured. Set VITE_FIREBASE_* env values.");
  const uid = getAuth(firebaseApp).currentUser?.uid;
  if (!uid) throw new Error("No Firebase session found. Sign in with Google to access Firestore data.");
  return uid;
}

function pct(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function topRows(map, total, topN = 8) {
  return [...map.entries()]
    .map(([label, count]) => ({ label, count, pct: pct(count, total) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

function valueOrUnknown(v, unknown = "Unknown") {
  const s = String(v ?? "").trim();
  return s || unknown;
}

function toRow(docSnap) {
  const d = docSnap.data() || {};
  return {
    ...d,
    id: Number(docSnap.id),
    down: Number(d.down || 0),
    yards: Number(d.yards || 0),
    explosive: Boolean(d.explosive),
    success: Boolean(d.success),
  };
}

function applyFilters(rows, filters = {}) {
  return rows.filter((r) => {
    if (filters.game_label && !String(r.game_label || "").toLowerCase().includes(String(filters.game_label).toLowerCase())) return false;
    if (filters.down && Number(r.down) !== Number(filters.down)) return false;
    if (filters.distance_bucket && String(r.distance_bucket || "") !== String(filters.distance_bucket)) return false;
    if (filters.field_zone && String(r.field_zone || "") !== String(filters.field_zone)) return false;
    return true;
  });
}

async function listOwnerScoutingRows() {
  const uid = requireUserUid();
  const q = query(collection(db, "scouting_plays"), where("owner_uid", "==", uid), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(toRow);
}

export async function getOpponentAnalytics(params = {}) {
  const rows = applyFilters(await listOwnerScoutingRows(), params)
    .filter((r) => r.side === "defense")
    .filter((r) => (params.opponent_profile_id ? Number(r.opponent_profile_id) === Number(params.opponent_profile_id) : true));
  const total = rows.length;
  const fronts = new Map();
  const coverages = new Map();
  const pressures = new Map();
  const bySituation = new Map();
  rows.forEach((r) => {
    const f = valueOrUnknown(r.defensive_front);
    const c = valueOrUnknown(r.coverage_shell);
    const p = valueOrUnknown(r.pressure_type);
    fronts.set(f, (fronts.get(f) || 0) + 1);
    coverages.set(c, (coverages.get(c) || 0) + 1);
    pressures.set(p, (pressures.get(p) || 0) + 1);
    const sit = `D${r.down || "?"} / ${valueOrUnknown(r.distance_bucket)}`;
    const bucket = bySituation.get(sit) || { total: 0, coverage: new Map() };
    bucket.total += 1;
    bucket.coverage.set(c, (bucket.coverage.get(c) || 0) + 1);
    bySituation.set(sit, bucket);
  });

  const coverage_by_down_distance = [...bySituation.entries()].map(([situation, bucket]) => {
    const top = [...bucket.coverage.entries()].sort((a, b) => b[1] - a[1])[0] || ["Unknown", 0];
    return {
      situation,
      top_coverage: top[0],
      pct: pct(top[1], bucket.total),
      sample: bucket.total,
    };
  }).sort((a, b) => b.sample - a.sample);

  const insights = [];
  const topCov = topRows(coverages, total, 1)[0];
  if (topCov && topCov.pct >= 45) insights.push(`${topCov.label} appears on ${topCov.pct}% of defensive snaps.`);
  const topPressure = topRows(pressures, total, 1)[0];
  if (topPressure && topPressure.pct >= 35) insights.push(`${topPressure.label} pressure shows ${topPressure.pct}% of snaps.`);
  if (!insights.length && total) insights.push("Tendency mix is balanced; sequence with formation/motion leverage.");

  return {
    sample_size: total,
    front_frequency: topRows(fronts, total),
    coverage_frequency: topRows(coverages, total),
    pressure_frequency: topRows(pressures, total),
    coverage_by_down_distance,
    insights,
  };
}

export async function getSelfScoutAnalytics(params = {}) {
  const rows = applyFilters(await listOwnerScoutingRows(), params).filter((r) => r.side === "self");
  const total = rows.length;
  const concepts = new Map();
  const formations = new Map();
  const playTypes = new Map();
  const conceptStats = new Map();
  rows.forEach((r) => {
    const concept = valueOrUnknown(r.concept_name);
    const formation = valueOrUnknown(r.formation);
    const playType = valueOrUnknown(r.play_type, "other");
    concepts.set(concept, (concepts.get(concept) || 0) + 1);
    formations.set(formation, (formations.get(formation) || 0) + 1);
    playTypes.set(playType, (playTypes.get(playType) || 0) + 1);
    const stats = conceptStats.get(concept) || { total: 0, success: 0, explosive: 0 };
    stats.total += 1;
    if (r.success) stats.success += 1;
    if (r.explosive) stats.explosive += 1;
    conceptStats.set(concept, stats);
  });

  const success_by_concept = [...conceptStats.entries()]
    .map(([label, s]) => ({ label, count: s.total, pct: pct(s.success, s.total) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);
  const explosive_by_concept = [...conceptStats.entries()]
    .map(([label, s]) => ({ label, count: s.total, pct: pct(s.explosive, s.total) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  const insights = [];
  const topConcept = topRows(concepts, total, 1)[0];
  if (topConcept && topConcept.pct >= 40) insights.push(`${topConcept.label} usage is ${topConcept.pct}% — tendency breaker advised.`);
  const topFormation = topRows(formations, total, 1)[0];
  if (topFormation && topFormation.pct >= 40) insights.push(`${topFormation.label} formation is ${topFormation.pct}% of calls.`);
  if (!insights.length && total) insights.push("Self-scout usage appears balanced across current sample.");

  return {
    sample_size: total,
    top_concepts: topRows(concepts, total),
    top_formations: topRows(formations, total),
    play_type_mix: topRows(playTypes, total),
    success_by_concept,
    explosive_by_concept,
    insights,
  };
}

export async function getFormationIntelligence(params = {}) {
  const scope = params.scope || "all";
  let rows = applyFilters(await listOwnerScoutingRows(), params);
  if (scope === "opponent") rows = rows.filter((r) => r.side === "defense");
  if (scope === "self") rows = rows.filter((r) => r.side === "self");
  if (params.opponent_profile_id) {
    rows = rows.filter((r) => Number(r.opponent_profile_id) === Number(params.opponent_profile_id));
  }
  const total = rows.length;
  const formations = new Map();
  const pressureByFormation = new Map();
  const motionByFormation = new Map();
  const explosiveByFormation = new Map();
  const defenseByFormation = new Map();

  rows.forEach((r) => {
    const formation = valueOrUnknown(r.formation);
    formations.set(formation, (formations.get(formation) || 0) + 1);

    const pressure = pressureByFormation.get(formation) || { total: 0, pressured: 0 };
    pressure.total += 1;
    if (valueOrUnknown(r.pressure_type) !== "Unknown") pressure.pressured += 1;
    pressureByFormation.set(formation, pressure);

    const motion = motionByFormation.get(formation) || { total: 0, motion: 0 };
    motion.total += 1;
    if (String(r.motion || "").trim()) motion.motion += 1;
    motionByFormation.set(formation, motion);

    const explosive = explosiveByFormation.get(formation) || { total: 0, explosive: 0 };
    explosive.total += 1;
    if (r.explosive) explosive.explosive += 1;
    explosiveByFormation.set(formation, explosive);

    const def = defenseByFormation.get(formation) || {
      total: 0,
      fronts: new Map(),
      coverages: new Map(),
    };
    def.total += 1;
    const front = valueOrUnknown(r.defensive_front);
    const cov = valueOrUnknown(r.coverage_shell);
    def.fronts.set(front, (def.fronts.get(front) || 0) + 1);
    def.coverages.set(cov, (def.coverages.get(cov) || 0) + 1);
    defenseByFormation.set(formation, def);
  });

  const pressure_by_formation = [...pressureByFormation.entries()]
    .map(([formation, s]) => ({ formation, sample: s.total, pressure_pct: pct(s.pressured, s.total) }))
    .sort((a, b) => b.sample - a.sample);
  const motion_by_formation = [...motionByFormation.entries()]
    .map(([formation, s]) => ({ formation, sample: s.total, motion_pct: pct(s.motion, s.total) }))
    .sort((a, b) => b.sample - a.sample);
  const explosive_by_formation = [...explosiveByFormation.entries()]
    .map(([formation, s]) => ({ formation, sample: s.total, explosive_pct: pct(s.explosive, s.total) }))
    .sort((a, b) => b.explosive_pct - a.explosive_pct);
  const defense_by_formation = [...defenseByFormation.entries()].map(([formation, s]) => {
    const topFront = [...s.fronts.entries()].sort((a, b) => b[1] - a[1])[0] || ["Unknown", 0];
    const topCoverage = [...s.coverages.entries()].sort((a, b) => b[1] - a[1])[0] || ["Unknown", 0];
    return {
      formation,
      top_front: topFront[0],
      top_front_pct: pct(topFront[1], s.total),
      top_coverage: topCoverage[0],
      top_coverage_pct: pct(topCoverage[1], s.total),
      sample: s.total,
    };
  }).sort((a, b) => b.sample - a.sample);

  const insights = [];
  const topFormation = topRows(formations, total, 1)[0];
  if (topFormation && topFormation.pct >= 35) insights.push(`${topFormation.label} is your primary look at ${topFormation.pct}% usage.`);
  if (!insights.length && total) insights.push("Formation distribution is balanced in the current filtered sample.");

  return {
    sample_size: total,
    formation_frequency: topRows(formations, total),
    pressure_by_formation,
    motion_by_formation,
    explosive_by_formation,
    defense_by_formation,
    insights,
  };
}

export async function getOpponentBridgeSummary(opponentProfileId) {
  const data = await getOpponentAnalytics({ opponent_profile_id: opponentProfileId || undefined });
  return {
    sample_size: data.sample_size || 0,
    top_coverages: (data.coverage_frequency || []).slice(0, 3),
    top_pressures: (data.pressure_frequency || []).slice(0, 3),
    top_fronts: (data.front_frequency || []).slice(0, 3),
  };
}

