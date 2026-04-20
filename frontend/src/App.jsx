import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth/AuthContext.jsx";
import LoginPage from "./components/auth/LoginPage.jsx";
import SignupPage from "./components/auth/SignupPage.jsx";
import TeamSetupPage from "./components/auth/TeamSetupPage.jsx";
import AppShell from "./components/layout/AppShell.jsx";
import PlanWorkspace from "./components/PlanWorkspace.jsx";
import SaveGameplanModal from "./components/SaveGameplanModal.jsx";
import GameplanNotesModal from "./components/GameplanNotesModal.jsx";
import DiagramBuilderModal from "./components/diagram/DiagramBuilderModal.jsx";
import AttachDiagramModal from "./components/diagram/AttachDiagramModal.jsx";
import InstallSheetModal from "./components/install/InstallSheetModal.jsx";
import OpponentsPage from "./pages/OpponentsPage.jsx";
import DiagramLibraryPage from "./pages/DiagramLibraryPage.jsx";
import MatchupAnalysisPage from "./pages/MatchupAnalysisPage.jsx";
import CoachingAssistantPage from "./pages/CoachingAssistantPage.jsx";
import ScoutingDataPage from "./pages/ScoutingDataPage.jsx";
import OpponentTendenciesPage from "./pages/OpponentTendenciesPage.jsx";
import SelfScoutPage from "./pages/SelfScoutPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import FormationIntelligencePage from "./pages/FormationIntelligencePage.jsx";
import ScriptBuilderPage from "./pages/ScriptBuilderPage.jsx";
import SituationalPlanningPage from "./pages/SituationalPlanningPage.jsx";
import GameDayViewPage from "./pages/GameDayViewPage.jsx";
import { buildMatchupContext } from "./lib/buildMatchupContext.js";
import {
  fetchRecommend,
  generateAISummary,
  runMatchupAnalysis,
  sendCoachingChat,
} from "./lib/firebaseCallables.js";
import { fetchOptions } from "./lib/inputOptions.js";
import {
  createTeam,
  joinTeam,
  listMemberships,
  listTeams,
} from "./lib/firestoreTeams.js";
import {
  createGameplan,
  deleteGameplan,
  listGameplans,
  updateGameplan,
} from "./lib/firestoreGameplans.js";
import {
  createOpponent,
  deleteOpponentById,
  listOpponents,
  updateOpponent,
} from "./lib/firestoreOpponents.js";
import {
  createDiagram,
  deleteDiagramById,
  listDiagrams,
  updateDiagramById,
} from "./lib/firestoreDiagrams.js";
import {
  createScoutingPlay,
  deleteScoutingPlay,
  getScoutingTemplate,
  importScoutingCSV,
  listScoutingPlays,
  updateScoutingPlay,
} from "./lib/firestoreScouting.js";
import {
  createScript,
  createScriptEntry,
  deleteScript,
  deleteScriptEntry,
  listScriptEntries,
  listScripts,
  reorderScriptEntries,
  updateScriptEntry,
} from "./lib/firestoreScripts.js";
import {
  createSituationCall,
  createSituationPlan,
  deleteSituationCall,
  deleteSituationPlan,
  listSituationCalls,
  listSituationPlans,
  updateSituationCall,
} from "./lib/firestoreSituations.js";
import { createReportNote } from "./lib/firestoreReportNotes.js";
import {
  getFormationIntelligence,
  getOpponentAnalytics,
  getOpponentBridgeSummary,
  getSelfScoutAnalytics,
} from "./lib/firestoreAnalytics.js";
import { selectDiagramsForInstall } from "./lib/diagramStorage.js";
import { tendenciesToFormValues } from "./lib/opponentStorage.js";

function buildInitialValues(options) {
  const out = {};
  for (const [key, list] of Object.entries(options || {})) out[key] = list[0] || "";
  return out;
}
const emptyNotes = () => ({ scouting: "", coaching: "", emphasis: "" });
const mapGameplan = (x) => ({
  id: x.id,
  name: x.name,
  visibility: x.visibility,
  teamId: x.team_id,
  createdAt: x.created_at,
  updatedAt: x.updated_at,
  inputs: x.inputs,
  recommendation: x.recommendation,
  notes: x.notes || emptyNotes(),
  aiSummary: x.ai_summary ?? null,
});
const mapOpponent = (x) => ({
  id: x.id,
  opponentName: x.opponent_name,
  teamLevel: x.team_level,
  notes: x.notes || "",
  visibility: x.visibility,
  teamId: x.team_id,
  tendencies: x.tendencies || {},
  analystNotes: x.analyst_notes || {},
  createdAt: x.created_at,
  updatedAt: x.updated_at,
});
const mapDiagram = (d) => ({
  id: d.id,
  name: d.name,
  playName: d.play_name || "",
  linkedConceptName: d.linked_concept_name,
  linkedGameplanId: d.linked_gameplan_id,
  linkedOpponentId: d.linked_opponent_profile_id,
  linkedCallSheetRank: d.linked_call_sheet_rank,
  installNote: d.install_note || "",
  visibility: d.visibility,
  teamId: d.team_id,
  canvas: d.canvas || {},
  createdAt: d.created_at,
  updatedAt: d.updated_at,
});

export default function App() {
  const {
    user,
    loading: authLoading,
    login,
    signup,
    loginWithGoogle,
    logout,
    authError,
    clearAuthError,
  } = useAuth();
  const [authMode, setAuthMode] = useState("login");
  const [tab, setTab] = useState("plan");
  const [options, setOptions] = useState(null);
  const [values, setValues] = useState({});
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [viewMode, setViewMode] = useState("recommendations");
  const [savedGameplans, setSavedGameplans] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [diagrams, setDiagrams] = useState([]);
  const [teams, setTeams] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [allowSolo, setAllowSolo] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveBanner, setSaveBanner] = useState(null);
  const [notesTarget, setNotesTarget] = useState(null);
  const [diagramEditorOpen, setDiagramEditorOpen] = useState(false);
  const [diagramEditorDiagram, setDiagramEditorDiagram] = useState(null);
  const [diagramCreateDefaults, setDiagramCreateDefaults] = useState({});
  const [attachContext, setAttachContext] = useState(null);
  const [installConcept, setInstallConcept] = useState(null);
  const [activeGameplan, setActiveGameplan] = useState(null);
  const [activeOpponent, setActiveOpponent] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState("");
  const [analysisAnswer, setAnalysisAnswer] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [scoutingPlays, setScoutingPlays] = useState([]);
  const [scoutingFilters, setScoutingFilters] = useState({});
  const [scoutingLoading, setScoutingLoading] = useState(false);
  const [scoutingError, setScoutingError] = useState("");
  const [opponentAnalytics, setOpponentAnalytics] = useState(null);
  const [opponentAnalyticsLoading, setOpponentAnalyticsLoading] = useState(false);
  const [opponentAnalyticsError, setOpponentAnalyticsError] = useState("");
  const [opponentAnalyticsFilters, setOpponentAnalyticsFilters] = useState({});
  const [selectedOpponentAnalyticsId, setSelectedOpponentAnalyticsId] = useState("");
  const [selfScoutAnalytics, setSelfScoutAnalytics] = useState(null);
  const [selfScoutLoading, setSelfScoutLoading] = useState(false);
  const [selfScoutError, setSelfScoutError] = useState("");
  const [selfScoutFilters, setSelfScoutFilters] = useState({});
  const [opponentReport, setOpponentReport] = useState(null);
  const [selfScoutReport, setSelfScoutReport] = useState(null);
  const [observedTendencySummary, setObservedTendencySummary] = useState(null);
  const [formationIntel, setFormationIntel] = useState(null);
  const [formationIntelFilters, setFormationIntelFilters] = useState({ scope: "all" });
  const [formationIntelLoading, setFormationIntelLoading] = useState(false);
  const [formationIntelError, setFormationIntelError] = useState("");
  const [scripts, setScripts] = useState([]);
  const [selectedScriptId, setSelectedScriptId] = useState("");
  const [scriptEntries, setScriptEntries] = useState([]);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const [situationPlans, setSituationPlans] = useState([]);
  const [selectedSituationPlanId, setSelectedSituationPlanId] = useState("");
  const [situationCalls, setSituationCalls] = useState([]);
  const [situationLoading, setSituationLoading] = useState(false);
  const [situationError, setSituationError] = useState("");

  const activeMembership = memberships[0] || null;
  const activeTeamId = activeMembership?.team_id ?? null;

  const refreshCoreData = useCallback(async () => {
    const [gps, ops, dgs, ts, ms, scr, sit] = await Promise.all([
      listGameplans(),
      listOpponents(),
      listDiagrams(),
      listTeams(),
      listMemberships(),
      listScripts(),
      listSituationPlans(),
    ]);
    setSavedGameplans(gps.map(mapGameplan));
    setOpponents(ops.map(mapOpponent));
    setDiagrams(dgs.map(mapDiagram));
    setTeams(ts);
    setMemberships(ms);
    setScripts(scr);
    setSituationPlans(sit);
  }, []);

  const refreshScoutingPlays = useCallback(async (filters = scoutingFilters) => {
    setScoutingLoading(true);
    setScoutingError("");
    try {
      const data = await listScoutingPlays(filters);
      setScoutingPlays(data);
    } catch (e) {
      setScoutingError(e?.message || "Could not load scouting plays");
    } finally {
      setScoutingLoading(false);
    }
  }, [scoutingFilters]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOptions();
        if (cancelled) return;
        setOptions(data);
        setValues(buildInitialValues(data));
        await refreshCoreData();
        await refreshScoutingPlays({});
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || "Could not load app data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refreshCoreData, refreshScoutingPlays]);

  const handleChange = useCallback((key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setSubmitError(null);
    setLoading(true);
    try {
      const data = await fetchRecommend({ ...values });
      setResult(data);
      setAiSummary(null);
      try {
        const tendency = await getOpponentBridgeSummary(activeOpponent?.id ?? null);
        setObservedTendencySummary(tendency);
      } catch {
        setObservedTendencySummary(null);
      }
      setViewMode("recommendations");
      setActiveGameplan(null);
    } catch (e) {
      setSubmitError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [values, activeOpponent?.id]);

  const handleConfirmSave = useCallback(
    async ({ name, visibility }) => {
      if (!result) return;
      const created = await createGameplan({
        name,
        visibility,
        team_id: visibility === "team" ? activeTeamId : null,
        inputs: { ...values },
        recommendation: result,
        notes: emptyNotes(),
      });
      await refreshCoreData();
      setActiveGameplan({ id: created.id, name: created.name });
      setSaveModalOpen(false);
      setSaveBanner(`Saved “${name}” to your account.`);
    },
    [result, values, activeTeamId, refreshCoreData],
  );

  const handleLoadGameplan = useCallback((g) => {
    setValues(g.inputs);
    setResult(g.recommendation);
    setViewMode("recommendations");
    setSubmitError(null);
    setSaveBanner(null);
    setAiSummary(null);
    setChatMessages([]);
    setChatSessionId(null);
    setActiveGameplan({ id: g.id, name: g.name });
    setTab("plan");
  }, []);

  const handleDeleteGameplan = useCallback(
    async (id) => {
      await deleteGameplan(id);
      await refreshCoreData();
    },
    [refreshCoreData],
  );

  const handleSaveGameplanNotes = useCallback(
    async (notes) => {
      if (!notesTarget) return;
      await updateGameplan(notesTarget.id, { notes });
      await refreshCoreData();
    },
    [notesTarget, refreshCoreData],
  );

  const applyOpponentToPlanner = useCallback((profile) => {
    const merged = tendenciesToFormValues(profile.tendencies || {});
    setValues((prev) => ({ ...prev, ...merged }));
    setActiveOpponent({ id: profile.id, name: profile.opponentName });
    setTab("plan");
    setSaveBanner("Loaded opponent tendencies into the planner.");
  }, []);

  const handleGenerateAISummary = useCallback(async () => {
    if (!result?.recommendations?.length) return;
    setAiSummaryError("");
    setAiSummaryLoading(true);
    try {
      const matchup_context = buildMatchupContext(
        values,
        result,
        savedGameplans,
        activeGameplan,
        opponents,
        activeOpponent,
      );
      const summary = await generateAISummary({ matchup_context });
      setAiSummary(summary);
      if (activeGameplan?.id && summary?.content) {
        await updateGameplan(activeGameplan.id, {
          ai_summary: {
            content: summary.content,
            model_name: summary.model_name || "",
            created_at: new Date().toISOString(),
          },
        });
        await refreshCoreData();
      }
    } catch (e) {
      setAiSummaryError(e?.message || "Could not generate AI summary");
    } finally {
      setAiSummaryLoading(false);
    }
  }, [
    activeGameplan,
    activeOpponent,
    values,
    result,
    savedGameplans,
    opponents,
    refreshCoreData,
  ]);

  const handleAskMatchupAnalysis = useCallback(
    async (question) => {
      setAnalysisError("");
      setAnalysisLoading(true);
      try {
        const matchup_context = buildMatchupContext(
          values,
          result || {},
          savedGameplans,
          activeGameplan,
          opponents,
          activeOpponent,
        );
        const out = await runMatchupAnalysis({ question, matchup_context });
        setAnalysisAnswer(out.answer || "");
      } catch (e) {
        setAnalysisError(e?.message || "Could not run matchup analysis");
      } finally {
        setAnalysisLoading(false);
      }
    },
    [activeGameplan, activeOpponent, values, result, savedGameplans, opponents],
  );

  const handleSaveAnalysisToNotes = useCallback(async () => {
    if (!activeGameplan?.id || !analysisAnswer) return;
    const g = savedGameplans.find((x) => x.id === activeGameplan.id);
    if (!g) return;
    const coaching = `${g.notes?.coaching || ""}\n\n[AI Matchup Analysis]\n${analysisAnswer}`.trim();
    await updateGameplan(activeGameplan.id, {
      notes: { ...(g.notes || emptyNotes()), coaching },
    });
    await refreshCoreData();
    setSaveBanner("Saved matchup analysis into gameplan coaching notes.");
  }, [activeGameplan?.id, analysisAnswer, savedGameplans, refreshCoreData]);

  const handleSendChat = useCallback(
    async (message) => {
      setChatError("");
      setChatLoading(true);
      const nextHistory = [...chatMessages, { role: "user", content: message }];
      setChatMessages(nextHistory);
      try {
        const matchup_context = buildMatchupContext(
          values,
          result || {},
          savedGameplans,
          activeGameplan,
          opponents,
          activeOpponent,
        );
        const out = await sendCoachingChat({
          session_id: chatSessionId,
          gameplan_id: activeGameplan?.id ?? null,
          opponent_profile_id: activeOpponent?.id ?? null,
          user_message: message,
          history: nextHistory.map((m) => ({ role: m.role, content: m.content })),
          matchup_context,
        });
        setChatSessionId(out.session_id);
        const am = out.assistant_message;
        setChatMessages((prev) => [
          ...prev,
          {
            role: am.role,
            content: am.content,
            model_name: am.model_name,
            id: am.id,
          },
        ]);
      } catch (e) {
        setChatError(e?.message || "Could not send chat message");
      } finally {
        setChatLoading(false);
      }
    },
    [
      activeGameplan,
      activeOpponent,
      values,
      result,
      chatMessages,
      chatSessionId,
      savedGameplans,
      opponents,
    ],
  );

  const loadOpponentAnalytics = useCallback(async () => {
    setOpponentAnalyticsLoading(true);
    setOpponentAnalyticsError("");
    try {
      const data = await getOpponentAnalytics({
        opponent_profile_id: selectedOpponentAnalyticsId || undefined,
        ...opponentAnalyticsFilters,
      });
      setOpponentAnalytics(data);
    } catch (e) {
      setOpponentAnalyticsError(e?.message || "Could not load opponent analytics");
    } finally {
      setOpponentAnalyticsLoading(false);
    }
  }, [selectedOpponentAnalyticsId, opponentAnalyticsFilters]);

  const loadSelfScoutAnalytics = useCallback(async () => {
    setSelfScoutLoading(true);
    setSelfScoutError("");
    try {
      const data = await getSelfScoutAnalytics(selfScoutFilters);
      setSelfScoutAnalytics(data);
    } catch (e) {
      setSelfScoutError(e?.message || "Could not load self-scout analytics");
    } finally {
      setSelfScoutLoading(false);
    }
  }, [selfScoutFilters]);

  const loadFormationIntel = useCallback(async () => {
    setFormationIntelLoading(true);
    setFormationIntelError("");
    try {
      const data = await getFormationIntelligence({
        ...formationIntelFilters,
        opponent_profile_id: formationIntelFilters.opponent_profile_id || undefined,
      });
      setFormationIntel(data);
    } catch (e) {
      setFormationIntelError(e?.message || "Could not load formation intelligence");
    } finally {
      setFormationIntelLoading(false);
    }
  }, [formationIntelFilters]);

  const loadScriptEntries = useCallback(async (scriptId) => {
    if (!scriptId) {
      setScriptEntries([]);
      return;
    }
    setScriptLoading(true);
    setScriptError("");
    try {
      const data = await listScriptEntries(scriptId);
      setScriptEntries(data);
    } catch (e) {
      setScriptError(e?.message || "Could not load script entries");
    } finally {
      setScriptLoading(false);
    }
  }, []);

  const loadSituationCalls = useCallback(async (planId) => {
    if (!planId) {
      setSituationCalls([]);
      return;
    }
    setSituationLoading(true);
    setSituationError("");
    try {
      const data = await listSituationCalls(planId);
      setSituationCalls(data);
    } catch (e) {
      setSituationError(e?.message || "Could not load situation calls");
    } finally {
      setSituationLoading(false);
    }
  }, []);

  const openDiagramCreate = useCallback((defaults = {}) => {
    setDiagramCreateDefaults(defaults);
    setDiagramEditorDiagram(null);
    setDiagramEditorOpen(true);
  }, []);
  const openDiagramEdit = useCallback((d) => {
    setDiagramEditorDiagram(d);
    setDiagramCreateDefaults({});
    setDiagramEditorOpen(true);
  }, []);

  const handleCreateDiagramFromConcept = useCallback(
    (item) =>
      openDiagramCreate({
        defaultLinkedConceptName: item.concept,
        defaultLinkedGameplanId: activeGameplan?.id ?? null,
        defaultLinkedCallSheetRank: item.rank,
      }),
    [activeGameplan?.id, openDiagramCreate],
  );
  const handleAttachDiagramFromConcept = useCallback(
    (item) =>
      setAttachContext({
        linkedConceptName: item.concept,
        linkedGameplanId: activeGameplan?.id ?? null,
        linkedOpponentId: null,
        linkedCallSheetRank: item.rank,
      }),
    [activeGameplan?.id],
  );
  const handleOpenInstallSheet = useCallback((item) => setInstallConcept(item), []);

  const installDiagrams = useMemo(
    () =>
      installConcept
        ? selectDiagramsForInstall(diagrams, {
            conceptName: installConcept.concept,
            gameplanId: activeGameplan?.id ?? null,
          })
        : [],
    [installConcept, diagrams, activeGameplan?.id],
  );
  const installGameplanNotes = useMemo(() => {
    if (!activeGameplan?.id) return null;
    return savedGameplans.find((g) => g.id === activeGameplan.id)?.notes ?? null;
  }, [activeGameplan?.id, savedGameplans]);

  useEffect(() => {
    if (!selectedScriptId) {
      setScriptEntries([]);
      return;
    }
    loadScriptEntries(Number(selectedScriptId));
  }, [selectedScriptId, loadScriptEntries]);

  useEffect(() => {
    if (!selectedSituationPlanId) {
      setSituationCalls([]);
      return;
    }
    loadSituationCalls(Number(selectedSituationPlanId));
  }, [selectedSituationPlanId, loadSituationCalls]);

  if (authLoading) {
    return <div className="p-10 text-center text-zinc-600">Loading PlayIQ...</div>;
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-12">
        {authMode === "login" ? (
          <LoginPage
            onLogin={login}
            onGoogleLogin={loginWithGoogle}
            onShowSignup={() => setAuthMode("signup")}
            sessionAuthError={authError}
            onClearSessionAuthError={clearAuthError}
          />
        ) : (
          <SignupPage onSignup={signup} onShowLogin={() => setAuthMode("login")} />
        )}
      </div>
    );
  }
  if (!allowSolo && memberships.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-12">
        <TeamSetupPage
          teams={teams}
          onCreateTeam={async (payload) => {
            await createTeam(payload);
            await refreshCoreData();
          }}
          onJoinTeam={async (payload) => {
            await joinTeam(payload);
            await refreshCoreData();
          }}
          onContinueSolo={() => setAllowSolo(true)}
        />
      </div>
    );
  }

  return (
    <AppShell activeTab={tab} onTabChange={setTab} user={user} onSignOut={logout}>
      {tab === "plan" ? (
        <PlanWorkspace
          options={options}
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
          submitError={submitError}
          loadError={loadError}
          result={result}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRequestSave={() => setSaveModalOpen(true)}
          saveDisabled={!result?.recommendations?.length}
          savedGameplans={savedGameplans}
          onLoadGameplan={handleLoadGameplan}
          onDeleteGameplan={handleDeleteGameplan}
          onOpenGameplanNotes={(g) => setNotesTarget(g)}
          saveBanner={saveBanner}
          onDismissBanner={() => setSaveBanner(null)}
          onCreateDiagramFromConcept={handleCreateDiagramFromConcept}
          onAttachDiagramFromConcept={handleAttachDiagramFromConcept}
          onOpenInstallSheet={handleOpenInstallSheet}
          observedTendencySummary={observedTendencySummary}
          aiSummary={aiSummary}
          aiSummaryLoading={aiSummaryLoading}
          aiSummaryError={aiSummaryError}
          onGenerateAISummary={handleGenerateAISummary}
        />
      ) : tab === "scouting" ? (
        <ScoutingDataPage
          plays={scoutingPlays}
          opponents={opponents}
          filters={scoutingFilters}
          onFiltersChange={(f) => {
            setScoutingFilters(f);
            refreshScoutingPlays(f);
          }}
          onCreatePlay={async (payload) => {
            await createScoutingPlay({
              ...payload,
              team_id: activeTeamId,
            });
            await refreshScoutingPlays();
          }}
          onDeletePlay={async (id) => {
            await deleteScoutingPlay(id);
            await refreshScoutingPlays();
          }}
          onUpdatePlay={async (id, payload) => {
            await updateScoutingPlay(id, payload);
            await refreshScoutingPlays();
          }}
          onUploadCsv={async ({ file, side }) => {
            const out = await importScoutingCSV({ file, side, teamId: activeTeamId });
            if (out.errors?.length) {
              setScoutingError(out.errors.join("; "));
            } else {
              setScoutingError("");
              setSaveBanner(`Imported ${out.inserted} scouting rows.`);
              await refreshScoutingPlays();
            }
          }}
          onDownloadTemplate={async () => {
            const out = await getScoutingTemplate();
            const blob = new Blob([out.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "playiq_scouting_template.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
          uploadLoading={scoutingLoading}
          loading={scoutingLoading}
          error={scoutingError}
        />
      ) : tab === "opponent-tendencies" ? (
        <OpponentTendenciesPage
          opponents={opponents}
          selectedOpponentId={selectedOpponentAnalyticsId}
          onSelectOpponentId={setSelectedOpponentAnalyticsId}
          analytics={opponentAnalytics}
          loading={opponentAnalyticsLoading}
          error={opponentAnalyticsError}
          filters={opponentAnalyticsFilters}
          onFiltersChange={setOpponentAnalyticsFilters}
          onRefresh={loadOpponentAnalytics}
        />
      ) : tab === "self-scout" ? (
        <SelfScoutPage
          analytics={selfScoutAnalytics}
          loading={selfScoutLoading}
          error={selfScoutError}
          filters={selfScoutFilters}
          onFiltersChange={setSelfScoutFilters}
          onRefresh={loadSelfScoutAnalytics}
        />
      ) : tab === "reports" ? (
        <ReportsPage
          opponentReport={opponentReport}
          selfScoutReport={selfScoutReport}
          opponents={opponents}
          onLoadOpponentReport={async (opponentId) => {
            const data = await getOpponentAnalytics({ opponent_profile_id: opponentId || undefined });
            setOpponentReport(data);
          }}
          onLoadSelfScoutReport={async () => {
            const data = await getSelfScoutAnalytics({});
            setSelfScoutReport(data);
          }}
          onSaveReportNote={async (payload) => {
            await createReportNote(payload);
            setSaveBanner("Saved analytics note.");
          }}
        />
      ) : tab === "formation-intel" ? (
        <FormationIntelligencePage
          opponents={opponents}
          filters={formationIntelFilters}
          onFiltersChange={setFormationIntelFilters}
          data={formationIntel}
          loading={formationIntelLoading}
          error={formationIntelError}
          onRefresh={loadFormationIntel}
        />
      ) : tab === "scripts" ? (
        <ScriptBuilderPage
          scripts={scripts}
          scriptEntries={scriptEntries}
          selectedScriptId={selectedScriptId}
          onSelectScriptId={setSelectedScriptId}
          onSaveScript={async (payload) => {
            const created = await createScript({
              ...payload,
              team_id: activeTeamId,
            });
            await refreshCoreData();
            setSelectedScriptId(String(created.id));
            await loadScriptEntries(created.id);
          }}
          onDeleteScript={async (id) => {
            await deleteScript(id);
            if (Number(selectedScriptId) === id) {
              setSelectedScriptId("");
            }
            await refreshCoreData();
          }}
          onAddEntry={async (scriptId, payload) => {
            await createScriptEntry(scriptId, payload);
            await loadScriptEntries(scriptId);
          }}
          onUpdateEntry={async (entryId, payload) => {
            await updateScriptEntry(entryId, payload);
            if (selectedScriptId) {
              await loadScriptEntries(Number(selectedScriptId));
            }
          }}
          onDeleteEntry={async (entryId) => {
            await deleteScriptEntry(entryId);
            if (selectedScriptId) {
              await loadScriptEntries(Number(selectedScriptId));
            }
          }}
          onReorderEntries={async (scriptId, entryIds) => {
            await reorderScriptEntries(scriptId, entryIds);
            await loadScriptEntries(scriptId);
          }}
          opponents={opponents}
          gameplans={savedGameplans}
          recommendation={result}
          loading={scriptLoading}
          error={scriptError}
        />
      ) : tab === "situations" ? (
        <SituationalPlanningPage
          plans={situationPlans}
          calls={situationCalls}
          selectedPlanId={selectedSituationPlanId}
          onSelectPlanId={setSelectedSituationPlanId}
          onCreatePlan={async (payload) => {
            const created = await createSituationPlan({
              ...payload,
              team_id: activeTeamId,
            });
            await refreshCoreData();
            setSelectedSituationPlanId(String(created.id));
            await loadSituationCalls(created.id);
          }}
          onDeletePlan={async (id) => {
            await deleteSituationPlan(id);
            if (Number(selectedSituationPlanId) === id) {
              setSelectedSituationPlanId("");
            }
            await refreshCoreData();
          }}
          onAddCall={async (planId, payload) => {
            await createSituationCall(planId, payload);
            await loadSituationCalls(planId);
          }}
          onUpdateCall={async (callId, payload) => {
            await updateSituationCall(callId, payload);
            if (selectedSituationPlanId) {
              await loadSituationCalls(Number(selectedSituationPlanId));
            }
          }}
          onDeleteCall={async (callId) => {
            await deleteSituationCall(callId);
            if (selectedSituationPlanId) {
              await loadSituationCalls(Number(selectedSituationPlanId));
            }
          }}
          gameplans={savedGameplans}
          opponents={opponents}
          diagrams={diagrams}
          recommendation={result}
          loading={situationLoading}
          error={situationError}
        />
      ) : tab === "game-day" ? (
        <GameDayViewPage
          activeOpponent={activeOpponent}
          observedTendencySummary={observedTendencySummary}
          result={result}
          selectedScriptEntries={scriptEntries}
          situationPlans={situationPlans}
          diagrams={diagrams}
        />
      ) : tab === "analysis" ? (
        <MatchupAnalysisPage
          onAsk={handleAskMatchupAnalysis}
          loading={analysisLoading}
          answer={analysisAnswer}
          error={analysisError}
          onSaveToNotes={handleSaveAnalysisToNotes}
          activeOpponentName={activeOpponent?.name ?? null}
          activeGameplanName={activeGameplan?.name ?? null}
        />
      ) : tab === "assistant" ? (
        <CoachingAssistantPage
          messages={chatMessages}
          loading={chatLoading}
          onSend={handleSendChat}
          error={chatError}
          activeOpponentName={activeOpponent?.name ?? null}
          activeGameplanName={activeGameplan?.name ?? null}
        />
      ) : tab === "diagrams" ? (
        <DiagramLibraryPage
          diagrams={diagrams}
          onNewDiagram={() => openDiagramCreate({})}
          onEditDiagram={openDiagramEdit}
          onDeleteDiagram={async (id) => {
            await deleteDiagramById(id);
            await refreshCoreData();
          }}
        />
      ) : (
        <OpponentsPage
          options={options}
          opponents={opponents}
          onApplyToPlanner={applyOpponentToPlanner}
          onCreateOpponent={async (draft) => {
            await createOpponent({
              opponent_name: draft.opponentName.trim(),
              team_level: draft.teamLevel || "",
              notes: draft.notes || "",
              visibility: draft.visibility || "private",
              team_id: draft.visibility === "team" ? activeTeamId : null,
              tendencies: draft.tendencies || {},
              analyst_notes: draft.analystNotes || {},
            });
            await refreshCoreData();
          }}
          onUpdateOpponent={async (id, draft) => {
            await updateOpponent(id, {
              opponent_name: draft.opponentName?.trim() ?? draft.opponent_name,
              team_level: draft.teamLevel ?? draft.team_level,
              notes: draft.notes,
              visibility: draft.visibility || "private",
              team_id: draft.visibility === "team" ? activeTeamId : null,
              tendencies: draft.tendencies,
              analyst_notes: draft.analystNotes ?? draft.analyst_notes,
            });
            await refreshCoreData();
          }}
          onDeleteOpponent={async (id) => {
            await deleteOpponentById(id);
            await refreshCoreData();
          }}
        />
      )}

      <SaveGameplanModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onConfirm={handleConfirmSave}
        defaultName=""
      />
      <GameplanNotesModal
        open={Boolean(notesTarget)}
        gameplan={notesTarget}
        onClose={() => setNotesTarget(null)}
        onSave={handleSaveGameplanNotes}
      />
      <DiagramBuilderModal
        open={diagramEditorOpen}
        onClose={() => {
          setDiagramEditorOpen(false);
          setDiagramEditorDiagram(null);
        }}
        diagram={diagramEditorDiagram}
        defaultLinkedConceptName={diagramCreateDefaults.defaultLinkedConceptName ?? null}
        defaultLinkedGameplanId={diagramCreateDefaults.defaultLinkedGameplanId ?? null}
        defaultLinkedOpponentId={diagramCreateDefaults.defaultLinkedOpponentId ?? null}
        defaultLinkedCallSheetRank={diagramCreateDefaults.defaultLinkedCallSheetRank ?? null}
        opponents={opponents}
        activeGameplanLabel={activeGameplan?.name ?? null}
        onSave={async (draft) => {
          const payload = {
            name: draft.name,
            play_name: draft.playName || "",
            linked_concept_name: draft.linkedConceptName,
            linked_gameplan_id: draft.linkedGameplanId || null,
            linked_opponent_profile_id: draft.linkedOpponentId || null,
            linked_call_sheet_rank: draft.linkedCallSheetRank || null,
            install_note: draft.installNote || "",
            visibility: draft.visibility || "private",
            team_id: draft.visibility === "team" ? activeTeamId : null,
            canvas: draft.canvas || {},
          };
          if (draft.id) await updateDiagramById(draft.id, payload);
          else await createDiagram(payload);
          await refreshCoreData();
        }}
      />
      <AttachDiagramModal
        open={Boolean(attachContext)}
        linkContext={attachContext}
        diagrams={diagrams}
        onClose={() => setAttachContext(null)}
        onAttach={async (diagramId, patch) => {
          await updateDiagramById(diagramId, {
            linked_concept_name: patch.linkedConceptName,
            linked_gameplan_id: patch.linkedGameplanId,
            linked_opponent_profile_id: patch.linkedOpponentId,
            linked_call_sheet_rank: patch.linkedCallSheetRank,
          });
          await refreshCoreData();
        }}
      />
      <InstallSheetModal
        open={Boolean(installConcept)}
        onClose={() => setInstallConcept(null)}
        conceptItem={installConcept}
        result={result}
        inputs={values}
        gameplanName={activeGameplan?.name ?? null}
        gameplanNotes={installGameplanNotes}
        diagrams={installDiagrams}
      />
    </AppShell>
  );
}
