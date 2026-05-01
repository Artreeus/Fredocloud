"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { useWorkspaceStore } from "@/stores/workspace-store";

const accentOptions = ["#2745f2", "#0f766e", "#dc2626", "#7c3aed", "#ea580c"];

export default function DashboardPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const pendingInvitations = useWorkspaceStore((state) => state.pendingInvitations);
  const loading = useWorkspaceStore((state) => state.loading);
  const error = useWorkspaceStore((state) => state.error);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const acceptInvitation = useWorkspaceStore((state) => state.acceptInvitation);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    accentColor: "#2745f2"
  });

  async function handleCreateWorkspace(event) {
    event.preventDefault();
    setSuccess("");

    await createWorkspace(form);
    setSuccess("Workspace created and activated.");
    setShowCreateForm(false);
    setForm({
      name: "",
      description: "",
      accentColor: "#2745f2"
    });
  }

  async function handleAcceptInvitation(inviteId) {
    setSuccess("");
    await acceptInvitation(inviteId);
    setSuccess("Invitation accepted. Your workspace list has been updated.");
  }

  return (
    <ProtectedLayout>
      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <article className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                Active Workspace
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                {activeWorkspace?.name || "Workspace dashboard"}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Switch workspaces from the navbar, manage members from settings, and
                create new collaboration spaces from here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm((current) => !current)}
              className="rounded-full px-5 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
            >
              {showCreateForm ? "Close form" : "Create workspace"}
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</p>
              <p className="mt-3 text-sm text-slate-700">
                {activeWorkspace?.description || "No description added yet."}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
              <p className="mt-3 text-sm font-medium text-slate-900">
                {activeWorkspace?.role || "Member"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total workspaces</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{workspaces.length}</p>
            </div>
          </div>

          {showCreateForm ? (
            <form
              className="mt-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6"
              onSubmit={handleCreateWorkspace}
            >
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Workspace name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  placeholder="Design Ops"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  placeholder="What is this workspace for?"
                />
              </label>
              <div>
                <span className="mb-3 block text-sm font-medium text-slate-700">Accent color</span>
                <div className="flex flex-wrap gap-3">
                  {accentOptions.map((accent) => (
                    <button
                      key={accent}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, accentColor: accent }))}
                      className={`h-10 w-10 rounded-full border-4 ${
                        form.accentColor === accent ? "border-slate-900" : "border-white"
                      } shadow-sm`}
                      style={{ backgroundColor: accent }}
                    />
                  ))}
                </div>
              </div>
              {error ? (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="w-fit rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Creating..." : "Create workspace"}
              </button>
            </form>
          ) : null}

          {success ? (
            <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          ) : null}
        </article>

        <article className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft">
          <h2 className="text-lg font-semibold">Pending invitations</h2>
          <div className="mt-6 space-y-4">
            {pendingInvitations.length ? (
              pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="rounded-3xl bg-white/10 p-4">
                  <p className="text-sm font-medium">{invitation.workspaceName}</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Join as {invitation.role.toLowerCase()}.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
                  >
                    Accept invite
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">No pending workspace invitations right now.</p>
            )}
          </div>
        </article>
      </section>
    </ProtectedLayout>
  );
}
