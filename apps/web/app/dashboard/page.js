import { ProtectedLayout } from "@/components/protected-layout";

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <section className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
            Protected Workspace
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            This route is protected by Next middleware and hydrated through the auth store.
            Once signed in, your profile and workspace membership are available across the app.
          </p>
        </article>
        <article className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
          <h2 className="text-lg font-semibold">What’s wired already</h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-200">
            <li>JWT cookies power authenticated navigation.</li>
            <li>401 responses trigger a transparent refresh attempt.</li>
            <li>Profile updates sync back into the Zustand auth store.</li>
          </ul>
        </article>
      </section>
    </ProtectedLayout>
  );
}
