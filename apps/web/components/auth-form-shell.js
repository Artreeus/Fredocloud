import Link from "next/link";

export function AuthFormShell({ title, subtitle, children, footer, eyebrow = "FredoCloud Team Hub" }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.16),transparent_24%)] animate-pulse-slow" />
      
      <section className="relative grid w-full max-w-6xl overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/68 shadow-float backdrop-blur-xl transition-all duration-500 hover:shadow-glow lg:grid-cols-[0.95fr_1.05fr]">
        {/* Back to home button */}
        <div className="absolute left-6 top-6 z-20 hidden lg:block">
          <Link 
            href="/" 
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
          >
            ← Back to Home
          </Link>
        </div>

        <aside className="relative overflow-hidden bg-slate-950 px-8 py-12 text-white sm:px-10 lg:px-12 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.18),transparent_26%)]" />
          
          {/* Mobile Back button */}
          <div className="relative z-10 mb-8 lg:hidden">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur-md"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.34em] text-slate-400 sm:text-xs">{eyebrow}</p>
            <h1 className="mt-5 max-w-md font-display text-4xl leading-[0.96] text-white sm:text-5xl">
              Calm structure for fast-moving teams.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Goals, announcements, action items, permissions, and optimistic collaboration
              in one shared workspace.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-[1.7rem] bg-white/10 p-5 transition hover:bg-white/15">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">What you get</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Workspace-aware goals and milestone tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Rich announcements with reactions and comments
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    Kanban task execution with optimistic updates
                  </li>
                </ul>
              </div>
              <div className="rounded-[1.7rem] bg-white/10 p-5 transition hover:bg-white/15">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Demo account</p>
                <div className="mt-4 space-y-1">
                  <p className="text-sm font-medium text-white">demo@fredocloud.com</p>
                  <p className="text-sm text-slate-300">Demo@12345</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-600 sm:text-xs">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-display text-3xl text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-center text-sm text-slate-600 sm:text-left">{footer}</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
