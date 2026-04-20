/**
 * Route geometry in diagram field coordinates (viewBox 0–100 × 0–54).
 * LOS ~y=18; offense works in y > 18 (toward bottom = forward toward defense in classic view).
 * "Upfield" = decreasing y toward LOS.
 */

export const ROUTE_TYPES = [
  "go",
  "slant",
  "out",
  "in",
  "post",
  "corner",
  "flat",
  "hitch",
  "curl",
  "wheel",
  "over",
  "drag",
];

/** @returns {Array<[number, number]>} polyline points including start */
export function routePointsForPreset(type, sx, sy) {
  const p = PRESETS[type] || PRESETS.go;
  return p(sx, sy);
}

const PRESETS = {
  go: (sx, sy) => {
    const len = 16;
    return [
      [sx, sy],
      [sx, sy - len],
    ];
  },
  slant: (sx, sy) => [
    [sx, sy],
    [sx + 5, sy - 9],
    [sx + 9, sy - 14],
  ],
  out: (sx, sy) => [
    [sx, sy],
    [sx + 2, sy - 4],
    [sx + 10, sy - 4],
  ],
  in: (sx, sy) => [
    [sx, sy],
    [sx - 2, sy - 4],
    [sx - 10, sy - 4],
  ],
  post: (sx, sy) => [
    [sx, sy],
    [sx + 1, sy - 8],
    [sx + 6, sy - 18],
  ],
  corner: (sx, sy) => [
    [sx, sy],
    [sx + 2, sy - 6],
    [sx + 12, sy - 16],
  ],
  flat: (sx, sy) => [
    [sx, sy],
    [sx + 8, sy + 1],
    [sx + 14, sy + 1],
  ],
  hitch: (sx, sy) => [
    [sx, sy],
    [sx, sy - 5],
    [sx, sy - 5],
  ],
  curl: (sx, sy) => [
    [sx, sy],
    [sx, sy - 8],
    [sx - 3, sy - 5],
  ],
  wheel: (sx, sy) => [
    [sx, sy],
    [sx + 1, sy - 4],
    [sx + 6, sy - 14],
    [sx + 10, sy - 22],
  ],
  over: (sx, sy) => [
    [sx, sy],
    [sx - 4, sy - 10],
    [sx - 10, sy - 18],
  ],
  drag: (sx, sy) => [
    [sx, sy],
    [sx + 6, sy - 2],
    [sx + 12, sy - 2],
  ],
};
