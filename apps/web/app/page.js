import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 text-ink">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.22),transparent_32%),radial-gradient(circle_at_top_right,rgba(88,113,93,0.18),transparent_28%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] border border-white/60 bg-white/68 px-5 py-4 shadow-soft backdrop-blur-xl">
          <div>
            <p className="font-display text-2xl text-slate-950">FredoCloud</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
              Collaborative Team Hub
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-200 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Create account
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2.4rem] border border-white/60 bg-white/72 p-8 shadow-float backdrop-blur-xl sm:p-12">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.26em] text-brand-600">
              FredoCloud Intern Assignment
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-[0.95] text-slate-950 sm:text-6xl lg:text-7xl">
              Teamwork with
              <span className="block text-brand-600">clarity, momentum, and taste.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
              A collaborative workspace for goals, announcements, action items, role-aware teamwork,
              and fast optimistic interactions that make the product feel alive.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Launch your workspace
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 bg-white/92 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
              >
                Use demo account
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Goal Tracking</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Milestones, updates, due dates, and progress views built for real teams.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Team Comms</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Rich announcements, threaded comments, reactions, and pinned visibility.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Execution Board</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Kanban, list views, filters, permissions, and optimistic task movement.
                </p>
              </div>
            </div>
          </article>

          <aside className="grid gap-6">
            <section className="rounded-[2.2rem] border border-slate-200/70 bg-slate-950 p-8 text-white shadow-float">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Demo credentials</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-[1.6rem] bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                  <p className="mt-2 text-sm font-medium">demo@fredocloud.com</p>
                </div>
                <div className="rounded-[1.6rem] bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Password</p>
                  <p className="mt-2 text-sm font-medium">Demo@12345</p>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-slate-300">
                Explore workspace management, goals, announcements, Kanban action items, RBAC,
                and optimistic UI with the seeded account.
              </p>
            </section>

            <section className="rounded-[2.2rem] border border-white/60 bg-white/72 p-8 shadow-soft backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Included milestones</p>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-700">
                <li>JWT auth with profile and avatar upload</li>
                <li>Workspaces, team invites, and permission matrix</li>
                <li>Goals with milestones and progress updates</li>
                <li>Announcements with reactions and threaded comments</li>
                <li>Kanban action items with list view and bulk updates</li>
                <li>Optimistic UI with rollback toasts</li>
              </ul>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
