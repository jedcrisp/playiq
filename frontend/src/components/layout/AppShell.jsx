/** Workspace areas: each group shows a small set of related screens (no mega single strip). */
const WORKSPACE_GROUPS = [
  {
    id: "build",
    label: "Build",
    hint: "Planner, film, opponents, diagrams",
    tabs: [
      { id: "plan", label: "Plan workspace" },
      { id: "scouting", label: "Scouting data" },
      { id: "opponents", label: "Opponents" },
      { id: "diagrams", label: "Diagrams" },
    ],
  },
  {
    id: "analyze",
    label: "Analyze",
    hint: "Tendencies, scouting analytics, reports",
    tabs: [
      { id: "opponent-tendencies", label: "Opponent tendencies" },
      { id: "self-scout", label: "Self-scout" },
      { id: "reports", label: "Reports" },
      { id: "formation-intel", label: "Formation intelligence" },
    ],
  },
  {
    id: "prepare",
    label: "Prepare",
    hint: "Scripts, situations, gameday, matchup, assistant",
    tabs: [
      { id: "scripts", label: "Script builder" },
      { id: "situations", label: "Situational planning" },
      { id: "game-day", label: "Game day view" },
      { id: "analysis", label: "Matchup analysis" },
      { id: "assistant", label: "Coaching assistant" },
    ],
  },
];

function groupForActiveTab(activeTab) {
  return (
    WORKSPACE_GROUPS.find((g) => g.tabs.some((t) => t.id === activeTab)) ?? WORKSPACE_GROUPS[0]
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
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Workspace
                </p>

                {/* Level 1: area (Build / Analyze / Prepare) */}
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
                        className={`rounded-xl border px-3 py-2 text-left transition-colors sm:min-w-[7.5rem] ${
                          isActiveGroup
                            ? "border-brand-300 bg-brand-50 text-brand-950 ring-1 ring-brand-200/80"
                            : "border-zinc-200/90 bg-zinc-50/80 text-zinc-600 hover:border-zinc-300 hover:bg-white"
                        }`}
                      >
                        <span className="block text-xs font-bold tracking-tight">{g.label}</span>
                        <span className="mt-0.5 block text-[10px] font-medium leading-snug text-zinc-500">
                          {g.tabs.length} screens
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Level 2: screens inside the selected area */}
                <div className="mt-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                    {currentGroup.label} — pick a screen
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
          <div className="mx-auto max-w-7xl px-4 py-8 text-center text-xs font-medium text-zinc-400 sm:px-6 lg:px-8">
            PlayIQ — planning data stays in your browser until you connect a backend.
          </div>
        </footer>
      </div>
    </div>
  );
}
