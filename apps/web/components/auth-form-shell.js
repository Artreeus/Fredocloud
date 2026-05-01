export function AuthFormShell({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(71,102,255,0.16),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#dbeafe_100%)]" />
      <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
          FredoCloud Team Hub
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-6 text-sm text-slate-600">{footer}</div> : null}
      </section>
    </main>
  );
}
