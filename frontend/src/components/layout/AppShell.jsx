/**
 * Suggested path for a typical week — not the only way to use the app, but it
 * answers “what order do I do things in?” at a glance.
 */
const SUGGESTED_FLOW = [
  { tab: "opponents", step: "1", label: "Opponent", hint: "Who you’re prepping for" },
  { tab: "scouting", step: "2", label: "Scouting", hint: "Film & tendencies data" },
  { tab: "plan", step: "3", label: "Gameplan", hint: "Inputs → concepts → save" },
  { tab: "game-day", step: "4", label: "Gameday", hint: "Scripts, situations, calls" },
];

/** Workspace areas: ordered to match how most coaches work the problem. */
const WORKSPACE_GROUPS = [
  {
    id: "build",
    label: "Data & gameplan",
    hint: "Opponent → scouting rows → planner → diagrams",
    tabs: [
      { id: "opponents", label: "Opponents" },
      { id: "scouting", label: "Scouting data" },
      { id: "plan", label: "Plan workspace" },
      { id: "diagrams", label: "Diagrams" },
    ],
  },
  {
    id: "analyze",
    label: "Insights",
    hint: "Tendencies, self-scout, formations, written reports",
    tabs: [
      { id: "opponent-tendencies", label: "Opponent tendencies" },
      { id: "self-scout", label: "Self-scout" },
      { id: "formation-intel", label: "Formation intelligence" },
      { id: "reports", label: "Reports" },
    ],
  },
  {
    id: "prepare",
    label: "Game week",
    hint: "Scripts, situations, then AI helpers if you want them",
    tabs: [
      { id: "scripts", label: "Script builder" },
      { id: "situations", label: "Situational planning" },
      { id: "game-day", label: "Game day view" },
      { id: "analysis", label: "Matchup analysis (AI)" },
      { id: "assistant", label: "Coaching assistant (AI)" },
    ],
  },
];

function groupForActiveTab(activeTab) {
  return (
    WORKSPACE_GROUPS.find((g) => g.tabs.some((t) => t.id === activeTab)) ?? WORKSPACE_GROUPS[0]
  );
}

function WorkflowStrip({ activeTab, onTabChange }) {
  return (
    <div className="mb-4 rounded-2xl border border-brand-200/60 bg-gradient-to-r from-brand-50/90 to-white px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-800">Suggested order</p>
          <p className="mt-0.5 text-xs text-zinc-600">
            Most coaches: set the opponent, log scouting, build the plan, then open gameday tools. Other
            screens stay available below.
          </p>
        </div>
        <nav
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-0.5 sm:justify-end"
          aria-label="Suggested workflow"
        >
          {SUGGESTED_FLOW.map((s, i) => {
            const on = activeTab === s.tab;
            return (
              <div key={s.tab} className="flex shrink-0 items-center">
                {i > 0 ? (
                  <span className="mx-0.5 text-zinc-300 select-none" aria-hidden>
                    →
                  </span>
                ) : null}
                <button
                  type="button"
                  title={s.hint}
                  onClick={() => onTabChange(s.tab)}
                  className={`rounded-xl border px-2.5 py-2 text-left transition-colors sm:px-3 ${
                    on
                      ? "border-brand-500 bg-white text-brand-950 shadow-sm ring-1 ring-brand-200"
                      : "border-transparent bg-white/60 text-zinc-700 hover:border-zinc-200 hover:bg-white"
                  }`}
                >
                  <span className="block text-[10px] font-bold text-brand-700">Step {s.step}</span>
                  <span className="block text-xs font-semibold text-zinc-900">{s.label}</span>
                </button>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function AppShell({ children, activeTab, onTabChange, user, onSignOut }) {
  const currentGroup = typeof activeTab === "string" ? groupForActiveTab(activeTab) : WORKSPACE_GROUPS[0];

  return (
    <div className="relative min-h-screen bg-zinc-50">
      {/* Ambient gradient — subtle, professional */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden print:hidden"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[520px] w-[70%] rounded-full bg-brand-500/[0.07] blur-3xl" />
        <div className="absolute -right-1/4 top-32 h-[420px] w-[55%] rounded-full bg-indigo-400/[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-px w-1/3 bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent" />
      </div>

      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/75 shadow-sm shadow-zinc-950/5 backdrop-blur-xl backdrop-saturate-150 print:hidden">
          <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-sm font-bold tracking-tight text-white shadow-lg shadow-brand-600/30 ring-1 ring-white/20"
                  aria-hidden
                >
                  PS
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold tracking-tight text-zinc-900">
                    PlayIQ
                  </p>
                  <p className="truncate text-xs font-medium text-zinc-500">
                    Opponent planning & gameplan system
                  </p>
                </div>
              </div>
              {user ? (
                <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-zinc-500">
                  <span className="max-w-[7rem] truncate sm:max-w-[12rem]" title={user.full_name || user.email}>
                    {user.full_name || user.email}
                  </span>
                  {onSignOut ? (
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      Sign out
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {typeof activeTab === "string" && onTabChange ? (
              <nav
                className="-mx-4 mt-3 border-t border-zinc-200/80 px-4 pb-3 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                aria-label="Workspace"
              >
                <WorkflowStrip activeTab={activeTab} onTabChange={onTabChange} />

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  All tools
                </p>

                {/* Level 1: area */}
                <div className="flex flex-wrap gap-2">
                  {WORKSPACE_GROUPS.map((g) => {
                    const isActiveGroup = g.id === currentGroup.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          if (g.tabs.some((t) => t.id === activeTab)) return;
                          onTabChange(g.tabs[0].id);
                        }}
                        title={g.hint}
                        className={`rounded-xl border px-3 py-2 text-left transition-colors sm:min-w-[8.5rem] ${
                          isActiveGroup
                            ? "border-brand-300 bg-brand-50 text-brand-950 ring-1 ring-brand-200/80"
                            : "border-zinc-200/90 bg-zinc-50/80 text-zinc-600 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <span className="block text-xs font-bold tracking-tight">{g.label}</span>
                        <span className="mt-0.5 block text-[10px] font-medium leading-snug text-zinc-500">
                          {g.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Level 2: screens inside the selected area */}
                <div className="mt-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    In “{currentGroup.label}” — pick a screen
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentGroup.tabs.map((t) => {
                      const on = activeTab === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onTabChange(t.id)}
                          className={`rounded-full px-3 py-2 text-left text-xs font-semibold transition-all duration-200 sm:text-sm ${
                            on
                              ? "bg-white text-zinc-900 shadow-card-sm ring-1 ring-zinc-200/90"
                              : "bg-zinc-100/80 text-zinc-600 ring-1 ring-transparent hover:bg-white hover:text-zinc-900"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </nav>
            ) : null}
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12 print:max-w-none print:px-0 print:py-0">
          {children}
        </div>

        <footer className="border-t border-zinc-200/90 bg-white/60 print:hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs font-medium text-zinc-400 sm:px-6 lg:px-8">
            PlayIQ — signed-in data is stored in your Firebase project (Firestore), not only in this
            browser.
          </div>
        </footer>
      </div>
    </div>
  );
}
