/** Workspace areas — one combined menu (optgroups) so navigation is a single control. */
const WORKSPACE_GROUPS = [
  {
    id: "build",
    label: "Data & gameplan",
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
    tabs: [
      { id: "scripts", label: "Script builder" },
      { id: "situations", label: "Situational planning" },
      { id: "game-day", label: "Game day view" },
      { id: "analysis", label: "Matchup analysis (AI)" },
      { id: "assistant", label: "Coaching assistant (AI)" },
    ],
  },
];

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function AppShell({ children, activeTab, onTabChange, user, onSignOut }) {
  const showNav = typeof activeTab === "string" && typeof onTabChange === "function";

  return (
    <div className="relative min-h-screen bg-zinc-50">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden print:hidden"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[520px] w-[70%] rounded-full bg-brand-500/[0.07] blur-3xl" />
        <div className="absolute -right-1/4 top-32 h-[420px] w-[55%] rounded-full bg-indigo-400/[0.06] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-px w-1/3 bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent" />
      </div>

      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-zinc-200/90 bg-white/90 shadow-sm shadow-zinc-950/5 backdrop-blur-xl backdrop-saturate-150 print:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:justify-start">
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
                {user && !showNav ? (
                  <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-zinc-500 lg:hidden">
                    <span className="max-w-[7rem] truncate" title={user.full_name || user.email}>
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

              {showNav ? (
                <div className="min-w-0 w-full lg:w-[min(28rem,calc(100%-18rem))] lg:shrink-0">
                  <label
                    htmlFor="nav-jump"
                    className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-brand-800"
                  >
                    Jump to screen
                  </label>
                  <div className="relative">
                    <select
                      id="nav-jump"
                      value={activeTab}
                      onChange={(e) => onTabChange(e.target.value)}
                      aria-label="Jump to screen"
                      className="w-full cursor-pointer appearance-none rounded-xl border-2 border-brand-400/80 bg-gradient-to-b from-white to-brand-50/50 py-3 pl-4 pr-11 text-sm font-semibold text-zinc-900 shadow-md shadow-brand-900/[0.06] outline-none transition-[box-shadow,border-color] hover:border-brand-500 focus:border-brand-600 focus:ring-4 focus:ring-brand-500/20 sm:text-[15px]"
                    >
                      {WORKSPACE_GROUPS.map((g) => (
                        <optgroup key={g.id} label={g.label}>
                          {g.tabs.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-700" />
                  </div>
                </div>
              ) : null}

              {user ? (
                <div className="hidden shrink-0 items-center gap-2 text-xs font-medium text-zinc-500 lg:flex">
                  <span className="max-w-[12rem] truncate" title={user.full_name || user.email}>
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

              {user && showNav ? (
                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-xs font-medium text-zinc-500 lg:hidden">
                  <span className="max-w-[14rem] truncate" title={user.full_name || user.email}>
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
