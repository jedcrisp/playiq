import { useCallback, useRef } from "react";
import DiagramField from "./DiagramField.jsx";
import { pointToPair } from "../../utils/diagramFirestore.js";
import { routePointsForPreset } from "../../utils/routePresets.js";

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function toSvgPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

function polylineToPath(points) {
  if (!points?.length) return "";
  return points
    .map((pt, i) => {
      const [x, y] = pointToPair(pt);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function cloneCanvas(c) {
  try {
    return structuredClone(c);
  } catch {
    return JSON.parse(JSON.stringify(c));
  }
}

export default function DiagramCanvas({
  canvas,
  onChangeCanvas,
  tool,
  offenseRole,
  defenseRole,
  routeType,
  selectedMarkerId,
  onSelectMarker,
  motionDraft,
  blockDraft,
  onAddMotionPoint,
  onAddBlockPoint,
  readOnly = false,
  referenceImageUrl = null,
}) {
  const svgRef = useRef(null);

  const updateCanvas = useCallback(
    (fn) => {
      if (readOnly) return;
      onChangeCanvas((c) => fn(cloneCanvas(c)));
    },
    [onChangeCanvas, readOnly],
  );

  const handleFieldPointer = (e) => {
    if (readOnly) return;
    if (e.target.closest("[data-marker]")) return;
    const svg = svgRef.current;
    if (!svg) return;
    const { x, y } = toSvgPoint(svg, e.clientX, e.clientY);
    const nx = clamp(x, 1, 99);
    const ny = clamp(y, 1, 53);

    if (tool === "offense") {
      updateCanvas((c) => {
        c.offenseMarkers.push({
          id: uid("om"),
          role: offenseRole,
          x: nx,
          y: ny,
        });
      });
      return;
    }
    if (tool === "defense") {
      updateCanvas((c) => {
        c.defenseMarkers.push({
          id: uid("dm"),
          role: defenseRole,
          x: nx,
          y: ny,
        });
      });
      return;
    }
    if (tool === "motion") {
      onAddMotionPoint?.([nx, ny]);
      return;
    }
    if (tool === "block") {
      onAddBlockPoint?.([nx, ny]);
      return;
    }
    if (tool === "select") {
      onSelectMarker?.(null);
    }
  };

  const handleMarkerPointerDown = (e, kind, id) => {
    e.stopPropagation();
    if (readOnly) return;
    if (tool === "route") {
      onSelectMarker?.(id);
      return;
    }
    if (tool !== "select") return;
    onSelectMarker?.(id);
    const svg = svgRef.current;
    if (!svg) return;
    const marker = e.currentTarget;

    const move = (ev) => {
      const { x, y } = toSvgPoint(svg, ev.clientX, ev.clientY);
      const nx = clamp(x, 1, 99);
      const ny = clamp(y, 1, 53);
      updateCanvas((c) => {
        const list = kind === "o" ? c.offenseMarkers : c.defenseMarkers;
        const m = list.find((mm) => mm.id === id);
        if (m) {
          m.x = nx;
          m.y = ny;
        }
      });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const addRouteFromSelection = () => {
    if (readOnly) return;
    if (!selectedMarkerId || tool !== "route") return;
    updateCanvas((c) => {
      const m = c.offenseMarkers.find((mm) => mm.id === selectedMarkerId);
      if (!m) return;
      const pts = routePointsForPreset(routeType, m.x, m.y);
      c.routes.push({
        id: uid("rt"),
        markerId: m.id,
        routeType,
        points: pts,
      });
    });
  };

  const fieldVariant = canvas?.field === "full" ? "full" : "half";

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 100 54"
        className={`w-full h-auto rounded-xl border border-zinc-200 bg-zinc-100 shadow-inner touch-none select-none ${
          readOnly ? "cursor-default" : "cursor-crosshair"
        }`}
        onPointerDown={handleFieldPointer}
        role="img"
        aria-label="Play diagram canvas"
      >
        <DiagramField variant={fieldVariant} referenceImageUrl={referenceImageUrl} />

        {canvas.motionPaths?.map((mp) => (
          <path
            key={mp.id}
            d={polylineToPath(mp.points)}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="0.45"
            strokeDasharray="1.2 0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {motionDraft?.length > 1 && (
          <path
            d={polylineToPath(motionDraft)}
            fill="none"
            stroke="#a78bfa"
            strokeWidth="0.35"
            strokeDasharray="0.8 0.6"
          />
        )}

        {canvas.blockPaths?.map((bp) => (
          <path
            key={bp.id}
            d={polylineToPath(bp.points)}
            fill="none"
            stroke="#b45309"
            strokeWidth="0.55"
            strokeLinecap="round"
          />
        ))}
        {blockDraft?.length > 1 && (
          <path
            d={polylineToPath(blockDraft)}
            fill="none"
            stroke="#d97706"
            strokeWidth="0.45"
            strokeDasharray="1 0.5"
          />
        )}

        {canvas.routes?.map((r) => (
          <path
            key={r.id}
            d={polylineToPath(r.points)}
            fill="none"
            stroke="#0f172a"
            strokeWidth="0.42"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {canvas.defenseMarkers?.map((dm) => {
          const sel = selectedMarkerId === dm.id;
          return (
            <g
              key={dm.id}
              data-marker
              onPointerDown={(e) => handleMarkerPointerDown(e, "d", dm.id)}
              style={{ cursor: readOnly ? "default" : tool === "select" ? "grab" : "default" }}
            >
              <circle
                cx={dm.x}
                cy={dm.y}
                r={sel ? 2.8 : 2.4}
                fill="#fecaca"
                stroke={sel ? "#991b1b" : "#dc2626"}
                strokeWidth="0.35"
              />
              <text
                x={dm.x}
                y={dm.y + 1.1}
                textAnchor="middle"
                fill="#7f1d1d"
                fontSize="2.2"
                fontWeight="700"
                style={{ pointerEvents: "none", fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {dm.role}
              </text>
            </g>
          );
        })}

        {canvas.offenseMarkers?.map((om) => {
          const sel = selectedMarkerId === om.id;
          return (
            <g
              key={om.id}
              data-marker
              onPointerDown={(e) => handleMarkerPointerDown(e, "o", om.id)}
              style={{
                cursor: readOnly
                  ? "default"
                  : tool === "select" || tool === "route"
                    ? "grab"
                    : "default",
              }}
            >
              <circle
                cx={om.x}
                cy={om.y}
                r={sel ? 2.8 : 2.4}
                fill="#bfdbfe"
                stroke={sel ? "#1d4ed8" : "#2563eb"}
                strokeWidth="0.35"
              />
              <text
                x={om.x}
                y={om.y + 1.1}
                textAnchor="middle"
                fill="#1e3a8a"
                fontSize="2.2"
                fontWeight="700"
                style={{ pointerEvents: "none", fontFamily: "Inter, system-ui, sans-serif" }}
              >
                {om.role}
              </text>
            </g>
          );
        })}
      </svg>
      {!readOnly && tool === "route" && selectedMarkerId && (
        <button
          type="button"
          onClick={addRouteFromSelection}
          className="absolute bottom-3 right-3 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-700"
        >
          Add {routeType} route
        </button>
      )}
    </div>
  );
}
