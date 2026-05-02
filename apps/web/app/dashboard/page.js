"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { apiRequest } from "@/lib/api-client";
import { ProtectedLayout } from "@/components/protected-layout";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const accentOptions = ["#2745f2", "#0f766e", "#dc2626", "#7c3aed", "#ea580c"];

export default function DashboardPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const pendingInvitations = useWorkspaceStore((state) => state.pendingInvitations);
  const loading = useWorkspaceStore((state) => state.loading);
  const error = useWorkspaceStore((state) => state.error);
  const clearError = useWorkspaceStore((state) => state.clearError);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const acceptInvitation = useWorkspaceStore((state) => state.acceptInvitation);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const pushToast = useToastStore((state) => state.pushToast);
  const [form, setForm] = useState({
    name: "",
    description: "",
    accentColor: "#2745f2"
  });
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    setAnalyticsLoading(true);
    apiRequest(`/api/analytics/summary?workspaceId=${activeWorkspace.id}`)
      .then((payload) => setAnalytics(payload))
      .catch((analyticsError) => {
        pushToast({ type: "error", message: analyticsError.message });
      })
      .finally(() => setAnalyticsLoading(false));
  }, [activeWorkspace?.id, pushToast]);

  async function handleCreateWorkspace(event) {
    event.preventDefault();

    await createWorkspace(form);
    pushToast({ type: "success", message: "Workspace created and activated." });
    setShowCreateForm(false);
    setForm({
      name: "",
      description: "",
      accentColor: "#2745f2"
    });
  }

  async function handleAcceptInvitation(inviteId) {
    await acceptInvitation(inviteId);
    pushToast({ type: "success", message: "Invitation accepted. Your workspace list has been updated." });
  }

  async function handleExport() {
    if (!activeWorkspace?.id) {
      return;
    }

    const csv = await apiRequest(`/api/analytics/export?workspaceId=${activeWorkspace.id}`);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeWorkspace.name || "workspace").replace(/\s+/g, "-").toLowerCase()}-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast({ type: "success", message: "CSV export downloaded." });
  }

  return (
    <ProtectedLayout>
      <section className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
        <article className="rounded-[2.3rem] border border-white/60 bg-white/76 p-8 shadow-float backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                Active Workspace
              </p>
              <h1 className="mt-4 font-display text-5xl text-slate-950">
                {activeWorkspace?.name || "Workspace dashboard"}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
                Switch workspaces from the navbar, manage members from settings, tune permissions,
                and create new collaboration spaces from here.
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
            <button
              type="button"
              onClick={handleExport}
              className="rounded-full border border-slate-200/80 bg-white/90 px-5 py-3 text-sm font-medium text-slate-700"
            >
              Export CSV
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</p>
              <p className="mt-3 text-sm text-slate-700">
                {activeWorkspace?.description || "No description added yet."}
              </p>
            </div>
            <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Role</p>
              <p className="mt-3 text-sm font-medium text-slate-900">
                {activeWorkspace?.role || "Member"}
              </p>
            </div>
            <div className="rounded-[1.9rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total workspaces</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{workspaces.length}</p>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace pulse</p>
                <p className="mt-2 text-lg font-medium text-white">
                  {pendingInvitations.length
                    ? `${pendingInvitations.length} invite${pendingInvitations.length > 1 ? "s" : ""} waiting on you`
                    : "No pending invites right now"}
                </p>
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                Accent {activeWorkspace?.accentColor || "#2745f2"}
              </div>
            </div>
          </div>

          {showCreateForm ? (
            <form
              className="mt-8 grid gap-4 rounded-[2rem] border border-slate-200/80 bg-white/84 p-6"
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
              <button
                type="submit"
                disabled={loading}
                className="w-fit rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? "Creating..." : "Create workspace"}
              </button>
            </form>
          ) : null}
        </article>

        <article className="rounded-[2.3rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-float">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Inbox</p>
          <h2 className="mt-3 font-display text-3xl text-white">Pending invitations</h2>
          <div className="mt-6 space-y-4">
            {pendingInvitations.length ? (
              pendingInvitations.map((invitation) => (
                <div key={invitation.id} className="rounded-[1.8rem] border border-white/10 bg-white/10 p-5">
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

      <section className="mt-6 grid gap-6">
        <article className="rounded-[2.3rem] border border-white/60 bg-white/76 p-8 shadow-float backdrop-blur-xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                Analytics
              </p>
              <h2 className="mt-3 font-display text-4xl text-slate-950">Workspace performance</h2>
            </div>
            <p className="text-sm text-slate-500">
              {analyticsLoading ? "Refreshing live metrics..." : "Live view of goals, tasks, and activity."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total goals</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {analytics?.stats?.totalGoals ?? "--"}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completed this week</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {analytics?.stats?.completedThisWeek ?? "--"}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overdue tasks</p>
              <p className="mt-3 text-3xl font-semibold text-rose-600">
                {analytics?.stats?.overdueCount ?? "--"}
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active members</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">
                {analytics?.stats?.activeMembers ?? "--"}
                <span className="ml-2 text-sm font-medium text-slate-500">
                  / {analytics?.stats?.totalMembers ?? "--"}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-sm font-semibold text-slate-950">Goal completion trend</p>
              <p className="mt-1 text-sm text-slate-500">Completed vs total goals over recent weekly buckets.</p>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.goalCompletionSeries || []}>
                    <XAxis dataKey="label" stroke="#64748b" />
                    <YAxis allowDecimals={false} stroke="#64748b" />
                    <Tooltip />
                    <Bar dataKey="totalGoals" fill="#cbd5e1" radius={[10, 10, 0, 0]} />
                    <Bar dataKey="completedGoals" fill={activeWorkspace?.accentColor || "#2745f2"} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/84 p-5">
              <p className="text-sm font-semibold text-slate-950">Priority distribution</p>
              <p className="mt-1 text-sm text-slate-500">How current action items are spread across priorities.</p>
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.priorityDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={4}
                    >
                      {(analytics?.priorityDistribution || []).map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={["#2745f2", "#0f766e", "#ea580c", "#dc2626"][index % 4]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </article>
      </section>
    </ProtectedLayout>
  );
}
