"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    handleScroll(); // Set initial state
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-canvas text-ink">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 h-screen w-full overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40rem] w-[40rem] rounded-full bg-terracotta/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute top-[20%] -right-[10%] h-[30rem] w-[30rem] rounded-full bg-moss/10 blur-[80px]" />
      </div>

      {/* Sticky Navbar Wrapper */}
      <div className={`fixed left-0 right-0 top-0 z-50 flex justify-center transition-all duration-500 ${scrolled ? "pt-4 px-4 sm:px-6" : "pt-0"}`}>
        <nav className={`w-full transition-all duration-500 ${scrolled ? "max-w-[1200px] rounded-[2rem] border border-white/60 bg-white/75 shadow-float backdrop-blur-xl" : "border-b border-white/20 bg-canvas/80 backdrop-blur-xl"}`}>
          <div className={`mx-auto flex w-full max-w-7xl items-center justify-between transition-all duration-500 ${scrolled ? "px-5 py-3 sm:px-6" : "px-6 py-4"}`}>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 font-display font-bold text-white">F</span>
              <span className="font-display text-xl font-bold tracking-tight text-slate-950">FredoCloud</span>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
              <a href="#workflow" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">How it works</a>
              <a href="#security" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Security</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200/50"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-24 sm:pt-32 lg:pt-40">
        {/* Hero Section */}
        <section className="mx-auto max-w-4xl text-center animate-fade-in">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/50 px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
            Welcome to the new standard for teamwork
          </div>
          <h1 className="font-display text-5xl font-medium leading-[1.1] text-slate-950 sm:text-6xl lg:text-7xl">
            Unify your team's work,
            <span className="block text-brand-600 italic">without the chaos.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            FredoCloud is a collaborative hub that brings your goals, announcements, and task execution into one fast, optimistic workspace. Stop context switching and start executing.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-brand-600 px-8 text-base font-medium text-white shadow-soft transition-all hover:-translate-y-1 hover:bg-brand-700 hover:shadow-glow"
            >
              <span className="relative z-10">Create your workspace</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-200 bg-white/50 px-8 text-base font-medium text-slate-700 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-200 hover:bg-white"
            >
              Try the Demo Account
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="mt-32 scroll-mt-24">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl text-slate-950">Everything you need to ship faster</h2>
            <p className="mt-4 text-lg text-slate-600">Built for modern teams who value momentum and clarity.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Optimistic UI",
                desc: "Actions happen instantly on your screen. No waiting for spinners. We sync with the server in the background.",
                icon: "⚡"
              },
              {
                title: "Live Kanban Boards",
                desc: "Drag and drop tasks through workflows. Real-time WebSockets ensure everyone sees changes immediately.",
                icon: "📋"
              },
              {
                title: "Goal Tracking",
                desc: "Tie everyday action items to high-level company goals. Keep the whole team aligned on the bigger picture.",
                icon: "🎯"
              },
              {
                title: "Role-Based Access",
                desc: "Granular permissions allow you to safely invite contractors or stakeholders without exposing critical settings.",
                icon: "🔐"
              },
              {
                title: "Rich Announcements",
                desc: "Broadcast important updates with rich formatting, and let the team respond with threaded comments and reactions.",
                icon: "📢"
              },
              {
                title: "Deep Analytics",
                desc: "Gain insights into your team's velocity, overdue tasks, and milestone completion rates with beautiful charts.",
                icon: "📊"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group rounded-3xl border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-float">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:bg-brand-50">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Demo / Workflow Section */}
        <section id="workflow" className="mt-32 scroll-mt-24 animate-slide-up">
          <div className="overflow-hidden rounded-[3rem] border border-white/80 bg-slate-950 p-10 shadow-float lg:p-16">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-terracotta">Demo Account Included</p>
                <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl">Experience the speed firsthand.</h2>
                <p className="mt-6 text-lg leading-relaxed text-slate-300">
                  We've seeded a fully-functional workspace so you don't have to start from scratch. Log in with the demo credentials to explore Kanban boards, create goals, and see how permissions work instantly.
                </p>
                <div className="mt-8 space-y-4 rounded-2xl bg-white/10 p-6 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-sm text-slate-400">Email</span>
                    <span className="font-mono text-sm text-white">demo@fredocloud.com</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-slate-400">Password</span>
                    <span className="font-mono text-sm text-white">Demo@12345</span>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-slate-950 transition-all hover:bg-slate-200"
                  >
                    Login to Demo
                  </Link>
                </div>
              </div>
              <div className="relative hidden aspect-square rounded-2xl bg-gradient-to-tr from-brand-900 to-midnight p-1 lg:block">
                <div className="h-full w-full rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                  {/* Decorative mockup UI */}
                  <div className="flex h-12 items-center gap-2 border-b border-white/10 px-4">
                    <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-8 w-1/3 rounded-lg bg-white/10"></div>
                    <div className="flex gap-4 pt-4">
                      <div className="h-40 flex-1 rounded-xl bg-white/5"></div>
                      <div className="h-40 flex-1 rounded-xl bg-white/5"></div>
                      <div className="h-40 flex-1 rounded-xl bg-white/5"></div>
                    </div>
                    <div className="h-24 w-full rounded-xl bg-white/5 mt-4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/30 px-6 py-12 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-slate-950">FredoCloud</span>
            <span className="text-sm text-slate-500">© 2026 Intern Assignment</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-slate-500 hover:text-slate-950">Privacy</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-950">Terms</a>
            <a href="#" className="text-sm text-slate-500 hover:text-slate-950">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
