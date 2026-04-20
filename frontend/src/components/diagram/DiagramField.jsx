import { useId } from "react";

/** Field background (SVG). ViewBox 0 0 100 54 — LOS varies by variant. */
export default function DiagramField({ variant = "half", referenceImageUrl = null }) {
  const gid = useId().replace(/:/g, "");
  const gradId = `grass-${gid}`;
  const losY = variant === "full" ? 27 : 18;
  const lines = [];
  for (let y = 4; y < 54; y += 5) {
    lines.push(
      <line
        key={`h-${y}`}
        x1="0"
        y1={y}
        x2="100"
        y2={y}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.15"
      />,
    );
  }
  return (
    <>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cfe8d4" />
          <stop offset="45%" stopColor="#b8d9c0" />
          <stop offset="100%" stopColor="#a8cfae" />
        </linearGradient>
      </defs>
      {referenceImageUrl ? (
        <>
          <image
            href={referenceImageUrl}
            x="0"
            y="0"
            width="100"
            height="54"
            preserveAspectRatio="xMidYMid slice"
          />
          <rect x="0" y="0" width="100" height="54" fill={`url(#${gradId})`} opacity="0.72" rx="1" />
        </>
      ) : (
        <rect x="0" y="0" width="100" height="54" fill={`url(#${gradId})`} rx="1" />
      )}
      {lines}
      <rect x="0" y="0" width="100" height={losY} fill="rgba(59, 130, 246, 0.06)" />
      <line
        x1="0"
        y1={losY}
        x2="100"
        y2={losY}
        stroke="#1e3a5f"
        strokeWidth="0.5"
        strokeDasharray="2 1"
      />
      <text
        x="2"
        y="8"
        fill="#475569"
        fontSize="3.5"
        fontWeight="600"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        Defense
      </text>
      <text
        x="2"
        y="50"
        fill="#334155"
        fontSize="3.5"
        fontWeight="600"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        Offense
      </text>
    </>
  );
}
