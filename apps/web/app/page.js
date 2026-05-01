export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface px-6 py-16 text-ink">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <section className="rounded-[2rem] bg-white p-10 shadow-soft ring-1 ring-slate-200">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
            FredoCloud Intern Assignment
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Collaborative Team Hub
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Milestone 1 is in place with a Next.js frontend, Express API, shared packages,
            Prisma schema skeleton, Tailwind theme tokens, and Turborepo orchestration.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full bg-brand-50 px-4 py-2 text-brand-700">Next.js 14</span>
            <span className="rounded-full bg-slate-100 px-4 py-2">Express API</span>
            <span className="rounded-full bg-slate-100 px-4 py-2">Prisma ORM</span>
            <span className="rounded-full bg-slate-100 px-4 py-2">Tailwind CSS</span>
            <span className="rounded-full bg-slate-100 px-4 py-2">Turbo + pnpm</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Apps</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Separate `web` and `api` applications with independent scripts and build outputs.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Shared Config</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Reusable ESLint and Prettier configuration packaged for the entire monorepo.
            </p>
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Ready For Next Steps</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The structure is prepared for auth, collaboration, realtime, and file workflows.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
