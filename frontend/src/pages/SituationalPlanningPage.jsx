import { useMemo, useState } from "react";
import SituationPlanCard from "../components/gameDay/SituationPlanCard.jsx";

const SITUATIONS = [
  "3rd and short",
  "3rd and medium",
  "3rd and long",
  "red zone",
  "backed up",
  "goal line",
  "2-minute",
  "openers / first 15",
  "plus territory / fringe red zone",
];

const emptyPlan = {
  title: "",
  situation_type: "3rd and medium",
  gameplan_id: "",
  opponent_profile_id: "",
  alerts_risks: "",
  expected_defensive_tendencies: "",
  best_counters: "",
  coaching_note: "",
};

const emptyCall = {
  priority: 1,
  concept_name: "",
  formation: "",
  motion: "",
  linked_diagram_id: "",
  note: "",
};

export default function SituationalPlanningPage({
  plans,
  calls,
  selectedPlanId,
  onSelectPlanId,
  onCreatePlan,
  onDeletePlan,
  onAddCall,
  onUpdateCall,
  onDeleteCall,
  gameplans,
  opponents,
  diagrams,
  recommendation,
  loading,
  error,
}) {
  const [planDraft, setPlanDraft] = useState(emptyPlan);
  const [callDraft, setCallDraft] = useState(emptyCall);
  const activeCalls = useMemo(() => calls || [], [calls]);

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-label text-brand-700">Situational planning</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
          Situation-specific call plans
        </h1>
        <p className="mt-3 text-sm text-zinc-600">Prepare menu answers for game-critical situations and link diagrams + notes.</p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Plan title" value={planDraft.title} onChange={(e) => setPlanDraft((x) => ({ ...x, title: e.target.value }))} />
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={planDraft.situation_type} onChange={(e) => setPlanDraft((x) => ({ ...x, situation_type: e.target.value }))}>
            {SITUATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={planDraft.gameplan_id} onChange={(e) => setPlanDraft((x) => ({ ...x, gameplan_id: e.target.value }))}>
            <option value="">Gameplan (optional)</option>
            {gameplans.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={planDraft.opponent_profile_id} onChange={(e) => setPlanDraft((x) => ({ ...x, opponent_profile_id: e.target.value }))}>
            <option value="">Opponent (optional)</option>
            {opponents.map((o) => <option key={o.id} value={o.id}>{o.opponentName}</option>)}
          </select>
        </div>
        <textarea className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows={2} placeholder="Expected defensive tendencies" value={planDraft.expected_defensive_tendencies} onChange={(e) => setPlanDraft((x) => ({ ...x, expected_defensive_tendencies: e.target.value }))} />
        <textarea className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows={2} placeholder="Best counters" value={planDraft.best_counters} onChange={(e) => setPlanDraft((x) => ({ ...x, best_counters: e.target.value }))} />
        <textarea className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm" rows={2} placeholder="Alerts / risks + coaching note" value={planDraft.coaching_note} onChange={(e) => setPlanDraft((x) => ({ ...x, coaching_note: e.target.value }))} />
        <button type="button" className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={async () => {
          if (!planDraft.title.trim()) return;
          await onCreatePlan({
            ...planDraft,
            gameplan_id: planDraft.gameplan_id ? Number(planDraft.gameplan_id) : null,
            opponent_profile_id: planDraft.opponent_profile_id ? Number(planDraft.opponent_profile_id) : null,
          });
          setPlanDraft(emptyPlan);
        }}>
          Save situation plan
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900">Saved plans</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {plans.map((plan) => (
            <SituationPlanCard key={plan.id} plan={plan} onLoad={(x) => onSelectPlanId(x.id)} onDelete={onDeletePlan} />
          ))}
        </div>
        {!plans.length ? <p className="text-sm text-zinc-500">No situation plans yet.</p> : null}
      </section>

      {selectedPlanId ? (
        <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Preferred calls</h3>
          <div className="grid gap-2 sm:grid-cols-6">
            <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Concept" value={callDraft.concept_name} onChange={(e) => setCallDraft((x) => ({ ...x, concept_name: e.target.value }))} />
            <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Formation" value={callDraft.formation} onChange={(e) => setCallDraft((x) => ({ ...x, formation: e.target.value }))} />
            <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Motion" value={callDraft.motion} onChange={(e) => setCallDraft((x) => ({ ...x, motion: e.target.value }))} />
            <select className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" value={callDraft.linked_diagram_id} onChange={(e) => setCallDraft((x) => ({ ...x, linked_diagram_id: e.target.value }))}>
              <option value="">Diagram</option>
              {diagrams.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <input className="rounded-xl border border-zinc-200 px-3 py-2 text-sm" placeholder="Priority" value={callDraft.priority} onChange={(e) => setCallDraft((x) => ({ ...x, priority: Number(e.target.value || 1) }))} />
            <button type="button" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onClick={async () => {
              if (!callDraft.concept_name.trim()) return;
              await onAddCall(Number(selectedPlanId), {
                ...callDraft,
                linked_diagram_id: callDraft.linked_diagram_id ? Number(callDraft.linked_diagram_id) : null,
              });
              setCallDraft((x) => ({ ...emptyCall, priority: activeCalls.length + 2 }));
            }}>
              Add call
            </button>
          </div>
          <div className="space-y-2">
            {activeCalls.map((call) => (
              <div key={call.id} className="grid gap-2 rounded-xl border border-zinc-200 p-3 sm:grid-cols-8">
                <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs" value={call.priority} onChange={(e) => onUpdateCall(call.id, { priority: Number(e.target.value || 1) })} />
                <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2" value={call.concept_name} onChange={(e) => onUpdateCall(call.id, { concept_name: e.target.value })} />
                <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs" value={call.formation || ""} onChange={(e) => onUpdateCall(call.id, { formation: e.target.value })} />
                <input className="rounded-lg border border-zinc-200 px-2 py-1 text-xs" value={call.motion || ""} onChange={(e) => onUpdateCall(call.id, { motion: e.target.value })} />
                <textarea className="rounded-lg border border-zinc-200 px-2 py-1 text-xs sm:col-span-2" rows={1} value={call.note || ""} onChange={(e) => onUpdateCall(call.id, { note: e.target.value })} />
                <button type="button" className="rounded border border-red-200 px-2 py-1 text-xs text-red-700" onClick={() => onDeleteCall(call.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          {!activeCalls.length && recommendation?.recommendations?.length ? (
            <p className="text-xs text-zinc-500">Tip: seed this plan with calls from current recommendation results.</p>
          ) : null}
          {loading ? <p className="text-sm text-zinc-500">Loading situation calls...</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
