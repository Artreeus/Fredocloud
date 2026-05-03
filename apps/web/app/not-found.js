import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas dark:bg-slate-950 px-6 py-24 transition-colors duration-300">
      {/* Background gradients aligned with the brand schema */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(201,111,74,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(88,113,93,0.12),transparent_35%)] dark:opacity-40 animate-pulse-slow" />
      
      <div className="relative z-10 flex w-full max-w-xl flex-col items-center text-center">
        {/* Large stylized 404 text */}
        <div className="relative mb-8">
          <h1 className="font-display text-[12rem] font-black leading-none tracking-tighter text-slate-900/5 dark:text-white/5 sm:text-[16rem]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-6xl">
              Lost in space.
            </span>
          </div>
        </div>

        <p className="mt-4 max-w-md text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          The page you&apos;re looking for has moved to a different orbit or simply doesn&apos;t exist in this workspace.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-slate-950 dark:bg-brand-600 px-10 text-base font-bold text-white shadow-soft transition-all hover:-translate-y-1 hover:bg-slate-900 dark:hover:bg-brand-500 hover:shadow-lg active:scale-95"
          >
            <span className="relative z-10">Return to Mission Control</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-10 text-base font-medium text-slate-700 dark:text-slate-300 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>

        {/* Decorative element */}
        <div className="mt-20 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 dark:bg-brand-500 font-display font-bold text-white shadow-sm">F</span>
          <span className="font-display text-xl font-bold tracking-tight text-slate-950 dark:text-white">FredoCloud Hub</span>
        </div>
      </div>

      {/* Floating particles (CSS-only decoration) */}
      <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-brand-400 opacity-20 animate-float" />
      <div className="absolute bottom-1/3 right-1/4 h-3 w-3 rounded-full bg-terracotta opacity-20 animate-float [animation-delay:1s]" />
      <div className="absolute top-1/2 right-1/3 h-1.5 w-1.5 rounded-full bg-moss opacity-20 animate-float [animation-delay:2s]" />
    </main>
  );
}
