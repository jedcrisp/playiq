const TABS = [
  { id: "plan", label: "Plan workspace" },
  { id: "scouting", label: "Scouting data" },
  { id: "opponent-tendencies", label: "Opponent tendencies" },
  { id: "self-scout", label: "Self-scout" },
  { id: "reports", label: "Reports" },
  { id: "formation-intel", label: "Formation intelligence" },
  { id: "scripts", label: "Script builder" },
  { id: "situations", label: "Situational planning" },
  { id: "game-day", label: "Game day view" },
  { id: "analysis", label: "Matchup analysis" },
  { id: "assistant", label: "Coaching assistant" },
  { id: "diagrams", label: "Diagrams" },
  { id: "opponents", label: "Opponents" },
];

export default function AppShell({ children, activeTab, onTabChange, user, onSignOut }) {
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
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3.5">
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
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {typeof activeTab === "string" && onTabChange ? (
                <nav
                  className="flex w-full rounded-full border border-zinc-200/90 bg-zinc-100/90 p-1 shadow-inner sm:w-auto"
                  aria-label="Primary"
                >
                  {TABS.map((t) => {
                    const on = activeTab === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onTabChange(t.id)}
                        className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-all duration-200 sm:flex-none sm:min-w-[10rem] ${
                          on
                            ? "bg-white text-zinc-900 shadow-card-sm ring-1 ring-zinc-200/90"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </nav>
              ) : null}
              {user ? (
                <div className="flex items-center justify-end gap-2 text-xs font-medium text-zinc-500">
                  <span className="truncate">{user.full_name || user.email}</span>
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
