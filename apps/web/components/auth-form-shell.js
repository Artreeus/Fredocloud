export function AuthFormShell({ title, subtitle, children, footer, eyebrow = "FredoCloud Team Hub" }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.16),transparent_24%)]" />
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[2.4rem] border border-white/60 bg-white/68 shadow-float backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="relative overflow-hidden bg-slate-950 px-8 py-10 text-white sm:px-10 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.18),transparent_26%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">{eyebrow}</p>
            <h1 className="mt-5 max-w-md font-display text-5xl leading-[0.96] text-white">
              Calm structure for fast-moving teams.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Goals, announcements, action items, permissions, and optimistic collaboration
              in one shared workspace.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-[1.7rem] bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">What you get</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
                  <li>Workspace-aware goals and milestone tracking</li>
                  <li>Rich announcements with reactions and comments</li>
                  <li>Kanban task execution with optimistic updates</li>
                </ul>
              </div>
              <div className="rounded-[1.7rem] bg-white/10 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Demo account</p>
                <p className="mt-4 text-sm font-medium text-white">demo@fredocloud.com</p>
                <p className="mt-1 text-sm text-slate-300">Demo@12345</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
