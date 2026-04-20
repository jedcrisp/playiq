/**
 * Firestore cannot store "array of arrays" (e.g. [[1,2],[3,4]]). Route / motion / block
 * polylines must be stored as arrays of maps { x, y }.
 */
function pairToPoint(p) {
  if (p && typeof p === "object" && typeof p.x === "number" && typeof p.y === "number") {
    return { x: p.x, y: p.y };
  }
  if (Array.isArray(p) && p.length >= 2) {
    return { x: Number(p[0]) || 0, y: Number(p[1]) || 0 };
  }
  return { x: 0, y: 0 };
}

export function sanitizeCanvasForFirestore(canvas) {
  if (!canvas || typeof canvas !== "object") return {};
  let c;
  try {
    c = structuredClone(canvas);
  } catch {
    c = JSON.parse(JSON.stringify(canvas));
  }
  for (const r of c.routes || []) {
    if (Array.isArray(r.points)) r.points = r.points.map(pairToPoint);
  }
  for (const mp of c.motionPaths || []) {
    if (Array.isArray(mp.points)) mp.points = mp.points.map(pairToPoint);
  }
  for (const bp of c.blockPaths || []) {
    if (Array.isArray(bp.points)) bp.points = bp.points.map(pairToPoint);
  }
  return c;
}

/** Normalize a point to [x,y] for SVG path building (supports legacy + Firestore shapes). */
export function pointToPair(pt) {
  if (Array.isArray(pt) && pt.length >= 2) return [Number(pt[0]) || 0, Number(pt[1]) || 0];
  if (pt && typeof pt === "object") return [Number(pt.x) || 0, Number(pt.y) || 0];
  return [0, 0];
}
