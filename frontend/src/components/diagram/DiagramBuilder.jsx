import { useCallback, useEffect, useState } from "react";
import DiagramCanvas from "./DiagramCanvas.jsx";
import DiagramToolbar from "./DiagramToolbar.jsx";
import { uploadDiagramPlayImage } from "../../lib/diagramImageUpload.js";
import { emptyCanvas } from "../../utils/diagramDefaults.js";

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneCanvasSafe(c) {
  try {
    return structuredClone(c && typeof c === "object" ? c : emptyCanvas());
  } catch {
    return JSON.parse(JSON.stringify(c || emptyCanvas()));
  }
}

export default function DiagramBuilder({ diagram, onChange, opponents = [] }) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadPhotoError, setUploadPhotoError] = useState("");
  const [tool, setTool] = useState("select");
  const [offenseRole, setOffenseRole] = useState("Z");
  const [defenseRole, setDefenseRole] = useState("CB");
  const [routeType, setRouteType] = useState("go");
  const [selectedMarkerId, setSelectedMarkerId] = useState(null);
  const [motionDraft, setMotionDraft] = useState([]);
  const [blockDraft, setBlockDraft] = useState([]);

  useEffect(() => {
    if (tool !== "motion") setMotionDraft([]);
    if (tool !== "block") setBlockDraft([]);
  }, [tool]);

  const onChangeCanvas = useCallback(
    (updater) => {
      onChange((d) => {
        const next = { ...d };
        const c = cloneCanvasSafe(d.canvas);
        updater(c);
        next.canvas = c;
        return next;
      });
    },
    [onChange],
  );

  const handleAddMotionPoint = useCallback((pt) => {
    setMotionDraft((prev) => [...prev, pt]);
  }, []);

  const handleAddBlockPoint = useCallback((pt) => {
    setBlockDraft((prev) => [...prev, pt]);
  }, []);

  const finishMotion = () => {
    if (motionDraft.length < 2) return;
    onChangeCanvas((c) => {
      c.motionPaths = c.motionPaths || [];
      c.motionPaths.push({ id: uid("mp"), points: [...motionDraft] });
    });
    setMotionDraft([]);
  };

  const finishBlock = () => {
    if (blockDraft.length < 2) return;
    onChangeCanvas((c) => {
      c.blockPaths = c.blockPaths || [];
      c.blockPaths.push({ id: uid("bp"), points: [...blockDraft] });
    });
    setBlockDraft([]);
  };

  const clearRoutes = () => {
    if (!window.confirm("Remove all route lines?")) return;
    onChangeCanvas((c) => {
      c.routes = [];
    });
  };

  const clearMotionPaths = () => {
    if (!window.confirm("Remove saved motion paths?")) return;
    onChangeCanvas((c) => {
      c.motionPaths = [];
    });
    setMotionDraft([]);
  };

  const clearBlockPaths = () => {
    if (!window.confirm("Remove run / blocking paths?")) return;
    onChangeCanvas((c) => {
      c.blockPaths = [];
    });
    setBlockDraft([]);
  };

  const clearMarkers = () => {
    if (!window.confirm("Remove all player markers?")) return;
    onChangeCanvas((c) => {
      c.offenseMarkers = [];
      c.defenseMarkers = [];
      c.routes = [];
    });
    setSelectedMarkerId(null);
  };

  const canvas = diagram.canvas;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Diagram name
          <input
            type="text"
            value={diagram.name}
            onChange={(e) => onChange((d) => ({ ...d, name: e.target.value }))}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Play name (on-field label)
          <input
            type="text"
            value={diagram.playName || ""}
            onChange={(e) => onChange((d) => ({ ...d, playName: e.target.value }))}
            placeholder="e.g. ZORRO RT NASTY"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Linked concept (optional)
          <input
            type="text"
            value={diagram.linkedConceptName || ""}
            onChange={(e) =>
              onChange((d) => ({
                ...d,
                linkedConceptName: e.target.value.trim() || null,
              }))
            }
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Link opponent profile (optional)
          <select
            value={diagram.linkedOpponentId || ""}
            onChange={(e) =>
              onChange((d) => ({
                ...d,
                linkedOpponentId: e.target.value || null,
              }))
            }
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
          >
            <option value="">None</option>
            {opponents.map((o) => (
              <option key={o.id} value={o.id}>
                {o.opponentName || o.id}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
        Install note
        <textarea
          value={diagram.installNote || ""}
          onChange={(e) => onChange((d) => ({ ...d, installNote: e.target.value }))}
          rows={2}
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
          placeholder="Short coaching cue for this drawing…"
        />
      </label>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-700">Upload play photo (optional)</p>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
          Drop a whiteboard snap, HUDL still, or wristband photo behind the field. Uses Firebase Storage when
          <code className="mx-0.5 rounded bg-zinc-200/80 px-1">VITE_FIREBASE_STORAGE_BUCKET</code> is set.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-white px-3 py-2 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploadingPhoto}
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (!f) return;
                setUploadPhotoError("");
                setUploadingPhoto(true);
                try {
                  const url = await uploadDiagramPlayImage(f);
                  onChange((d) => ({ ...d, referenceImageUrl: url }));
                } catch (err) {
                  setUploadPhotoError(err?.message || "Upload failed");
                } finally {
                  setUploadingPhoto(false);
                }
              }}
            />
            {uploadingPhoto ? "Uploading…" : "Choose image"}
          </label>
          {diagram.referenceImageUrl ? (
            <button
              type="button"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              onClick={() => onChange((d) => ({ ...d, referenceImageUrl: null }))}
            >
              Remove photo
            </button>
          ) : null}
        </div>
        {uploadPhotoError ? <p className="mt-2 text-xs text-red-600">{uploadPhotoError}</p> : null}
      </div>

      <DiagramToolbar
        tool={tool}
        onToolChange={setTool}
        offenseRole={offenseRole}
        onOffenseRoleChange={setOffenseRole}
        defenseRole={defenseRole}
        onDefenseRoleChange={setDefenseRole}
        routeType={routeType}
        onRouteTypeChange={setRouteType}
        field={canvas.field || "half"}
        onFieldChange={(v) =>
          onChangeCanvas((c) => {
            c.field = v;
          })
        }
        onClearRoutes={clearRoutes}
        onClearMotionPaths={clearMotionPaths}
        onClearBlockPaths={clearBlockPaths}
        onClearMarkers={clearMarkers}
        motionDraftLen={motionDraft.length}
        blockDraftLen={blockDraft.length}
        onFinishMotion={finishMotion}
        onCancelMotion={() => setMotionDraft([])}
        onFinishBlock={finishBlock}
        onCancelBlock={() => setBlockDraft([])}
      />

      {diagram.playName ? (
        <p className="text-center font-display text-sm font-semibold text-zinc-800">
          {diagram.playName}
        </p>
      ) : null}

      <DiagramCanvas
        canvas={canvas}
        onChangeCanvas={onChangeCanvas}
        tool={tool}
        offenseRole={offenseRole}
        defenseRole={defenseRole}
        routeType={routeType}
        selectedMarkerId={selectedMarkerId}
        onSelectMarker={setSelectedMarkerId}
        motionDraft={motionDraft}
        blockDraft={blockDraft}
        onAddMotionPoint={handleAddMotionPoint}
        onAddBlockPoint={handleAddBlockPoint}
        referenceImageUrl={diagram.referenceImageUrl || null}
      />
    </div>
  );
}
