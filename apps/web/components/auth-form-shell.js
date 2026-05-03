"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";

export function AuthFormShell({ title, subtitle, children, footer, eyebrow = "FredoCloud Team Hub" }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 lg:py-12 bg-canvas dark:bg-slate-950 transition-colors duration-300">
      {/* Original Background Schema */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.14),transparent_26%)] dark:opacity-40 animate-pulse-slow" />
      
      <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-center gap-6 sm:gap-8">
        {/* Top Navigation - Improved but color-consistent */}
        <div className="flex w-full items-center justify-between px-2 sm:px-4">
          <Link 
            href="/" 
            className="group flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 backdrop-blur-md transition hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 dark:bg-brand-500 font-display font-bold text-white shadow-sm">F</span>
              <span className="hidden font-display text-lg font-bold tracking-tight text-slate-950 dark:text-white sm:block">FredoCloud</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid w-full overflow-hidden rounded-[2.5rem] border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 shadow-float backdrop-blur-2xl lg:grid-cols-2"
        >
          {/* Decorative Side (Left) - Using original brand colors */}
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 dark:bg-slate-950/50 p-10 text-white lg:flex border-r border-transparent dark:border-slate-800/50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.2),transparent_40%)]" />
            
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">{eyebrow}</p>
              <h1 className="mt-6 font-display text-4xl leading-[1.1] text-white">
                Teamwork with <br />
                <span className="italic text-brand-400">clarity.</span>
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-300 dark:text-slate-400">
                The collaborative hub where goals, announcements, and execution come together in one fast, optimistic workspace.
              </p>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Live Workspace</p>
                <div className="mt-3 flex gap-6">
                  <div>
                    <p className="text-xl font-bold">100%</p>
                    <p className="text-[9px] uppercase text-slate-400">Optimistic UI</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">Real-time</p>
                    <p className="text-[9px] uppercase text-slate-400">Syncing</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Form Side (Right) */}
          <div className="flex flex-col px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <div className="mx-auto w-full max-w-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-600 dark:text-brand-500 lg:hidden">
                {eyebrow}
              </p>
              <h2 className="mt-2 font-display text-3xl font-medium tracking-tight text-slate-950 dark:text-white lg:mt-0 sm:text-4xl">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{subtitle}</p>
              
              <div className="mt-8">
                {children}
              </div>

              {footer && (
                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Floating Credit */}
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 dark:text-slate-600">
          © 2026 FredoCloud Team Hub
        </p>
      </div>
    </main>
  );
}
