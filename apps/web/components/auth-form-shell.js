import Link from "next/link";

export function AuthFormShell({ title, subtitle, children, footer, eyebrow = "FredoCloud Team Hub" }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 sm:px-6">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[50rem] w-[50rem] rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[40rem] w-[40rem] rounded-full bg-terracotta/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-[1100px] flex-col items-center gap-8">
        {/* Top Navigation */}
        <div className="flex w-full items-center justify-between px-2 sm:px-6">
          <Link 
            href="/" 
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/15 hover:border-white/20"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-display font-bold text-slate-950">F</span>
            <span className="hidden font-display text-lg font-bold tracking-tight text-white sm:block">FredoCloud</span>
          </div>
        </div>

        {/* Main Card */}
        <section className="grid w-full overflow-hidden rounded-[3rem] border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
          {/* Decorative Side (Left) */}
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 p-12 text-white lg:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.15),transparent_40%)]" />
            
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-400">{eyebrow}</p>
              <h1 className="mt-6 font-display text-5xl leading-[1.1] text-white">
                Teamwork with <br />
                <span className="italic text-brand-300">momentum.</span>
              </h1>
              <p className="mt-6 max-w-sm text-lg leading-relaxed text-slate-400">
                The hub for high-performance teams to ship faster, stay aligned, and collaborate without the noise.
              </p>
            </div>

            <div className="relative z-10 grid gap-4">
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Workspace Statistics</p>
                <div className="mt-4 flex gap-8">
                  <div>
                    <p className="text-2xl font-bold">12.4k</p>
                    <p className="text-[10px] uppercase text-slate-500">Tasks Shipped</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-[10px] uppercase text-slate-500">Uptime</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Form Side (Right) */}
          <div className="flex flex-col bg-white px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div className="mx-auto w-full max-w-md">
              <h2 className="font-display text-4xl font-medium tracking-tight text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{subtitle}</p>
              
              <div className="mt-10">
                {children}
              </div>

              {footer && (
                <div className="mt-8 border-t border-slate-100 pt-8 text-center text-sm text-slate-500">
                  {footer}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Floating Credit */}
        <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
          © 2026 FredoCloud Collaborative Hub
        </p>
      </div>
    </main>
  );
}
