import Link from "next/link";

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
            Milestone 3 adds a full frontend authentication experience with route
            protection, a Zustand auth store, profile management, and avatar upload wiring.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full bg-brand-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              Create account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
