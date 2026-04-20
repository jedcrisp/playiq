import { ROUTE_TYPES } from "../../utils/routePresets.js";
import { DEFENSE_ROLES, OFFENSE_ROLES } from "../../utils/diagramDefaults.js";

const TOOLS = [
  { id: "select", label: "Select / move" },
  { id: "offense", label: "Place offense" },
  { id: "defense", label: "Place defense" },
  { id: "route", label: "Routes" },
  { id: "motion", label: "Motion" },
  { id: "block", label: "Run / block" },
];

export default function DiagramToolbar({
  tool,
  onToolChange,
  offenseRole,
  onOffenseRoleChange,
  defenseRole,
  onDefenseRoleChange,
  routeType,
  onRouteTypeChange,
  field,
  onFieldChange,
  onClearRoutes,
  onClearMotionPaths,
  onClearBlockPaths,
  onClearMarkers,
  motionDraftLen = 0,
  blockDraftLen = 0,
  onFinishMotion,
  onCancelMotion,
  onFinishBlock,
  onCancelBlock,
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-4">
      <div className="flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onToolChange(t.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tool === t.id
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
          Field
          <select
            value={field}
            onChange={(e) => onFieldChange(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900"
          >
            <option value="half">Half field (toward one goal)</option>
            <option value="full">Full field (balanced LOS)</option>
          </select>
        </label>

        {(tool === "offense" || tool === "route") && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
            Offense marker
            <select
              value={offenseRole}
              onChange={(e) => onOffenseRoleChange(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900"
            >
              {OFFENSE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}

        {tool === "defense" && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
            Defense marker
            <select
              value={defenseRole}
              onChange={(e) => onDefenseRoleChange(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900"
            >
              {DEFENSE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}

        {tool === "route" && (
          <label className="flex flex-col gap-1 text-xs font-semibold text-zinc-600">
            Route type
            <select
              value={routeType}
              onChange={(e) => onRouteTypeChange(e.target.value)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm text-zinc-900"
            >
              {ROUTE_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {tool === "route" ? (
        <p className="text-xs leading-relaxed text-zinc-600">
          Tap an offensive player to select them, then use{" "}
          <span className="font-semibold text-zinc-800">Add route</span> on the canvas.
        </p>
      ) : null}

      {tool === "motion" ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-zinc-600">
            Click the field to trace motion ({motionDraftLen} pts)
          </p>
          <button
            type="button"
            disabled={motionDraftLen < 2}
            onClick={onFinishMotion}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            Finish motion
          </button>
          <button
            type="button"
            onClick={onCancelMotion}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
          >
            Clear draft
          </button>
        </div>
      ) : null}

      {tool === "block" ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-zinc-600">
            Click to trace blocking / run path ({blockDraftLen} pts)
          </p>
          <button
            type="button"
            disabled={blockDraftLen < 2}
            onClick={onFinishBlock}
            className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            Finish path
          </button>
          <button
            type="button"
            onClick={onCancelBlock}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
          >
            Clear draft
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-zinc-200/80 pt-3">
        <button
          type="button"
          onClick={onClearRoutes}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Clear routes
        </button>
        <button
          type="button"
          onClick={onClearMotionPaths}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Clear motion
        </button>
        <button
          type="button"
          onClick={onClearBlockPaths}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Clear run/block
        </button>
        <button
          type="button"
          onClick={onClearMarkers}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100"
        >
          Clear all players
        </button>
      </div>
    </div>
  );
}
