"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.14),_transparent_35%),linear-gradient(180deg,_#fffdf7_0%,_#f6efe5_100%)] px-4 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-white/60 bg-white/82 p-8 shadow-[0_30px_120px_rgba(15,23,42,0.14)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-600">
          Something went wrong
        </p>
        <h1 className="mt-3 font-serif text-3xl text-slate-900">We hit an unexpected issue.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The page did not finish loading cleanly. You can retry the request or head back to the
          dashboard and continue from there.
        </p>
        {error?.message ? (
          <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
