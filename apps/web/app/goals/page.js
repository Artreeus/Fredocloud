"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { GoalFormModal } from "@/components/goal-form-modal";
import { ProtectedLayout } from "@/components/protected-layout";
import { useGoalStore } from "@/stores/goal-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString();
}

export default function GoalsPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const members = useWorkspaceStore((state) => state.members);
  const goals = useGoalStore((state) => state.goals);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);
  const clearError = useGoalStore((state) => state.clearError);
  const fetchGoals = useGoalStore((state) => state.fetchGoals);
  const createGoal = useGoalStore((state) => state.createGoal);
  const pushToast = useToastStore((state) => state.pushToast);
  const [filters, setFilters] = useState({
    status: "",
    assigneeId: "",
    search: ""
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const canCreateGoal = hasPermission(activeWorkspace, "CREATE_GOAL");

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    fetchGoals({
      workspaceId: activeWorkspace.id,
      status: filters.status,
      assigneeId: filters.assigneeId,
      search: filters.search
    }).catch(() => {});
  }, [activeWorkspace?.id, fetchGoals, filters.assigneeId, filters.search, filters.status]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  const now = useMemo(() => new Date(), []);

  async function handleCreateGoal(values) {
    setShowCreateModal(false);

    await createGoal({
      ...values,
      workspaceId: activeWorkspace.id,
      dueDate: values.dueDate || null
    });
    pushToast({ type: "success", message: "Goal created." });
  }

  return (
    <ProtectedLayout>
      <section className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Goals
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Team goals
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Create goals, track milestone progress, and spot overdue work across the active workspace.
            </p>
          </div>
          {canCreateGoal ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-full px-5 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
            >
              Create goal
            </button>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              Goal creation is restricted in this workspace
            </span>
          )}
        </div>

        <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="">All statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Owner</span>
            <select
              value={filters.assigneeId}
              onChange={(event) =>
                setFilters((current) => ({ ...current, assigneeId: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="">All owners</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Search</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              placeholder="Search by goal title"
            />
          </label>
        </section>

        <section className="grid gap-5">
          {goals.map((goal) => {
            const overdue =
              goal.dueDate &&
              goal.status !== "COMPLETED" &&
              new Date(goal.dueDate).getTime() < now.getTime();

            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className={`rounded-[2rem] bg-white p-6 shadow-soft ring-1 transition ${
                  overdue ? "ring-rose-300" : "ring-slate-200 hover:ring-slate-300"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {goal.status.replaceAll("_", " ")}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {goal.priority}
                      </span>
                      {overdue ? (
                        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                          Overdue
                        </span>
                      ) : null}
                      {goal.isOptimistic ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          Syncing
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                      {goal.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                      {goal.description || "No description provided yet."}
                    </p>
                  </div>
                  <div className="min-w-[180px] rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Due date</p>
                    <p className={`mt-2 text-sm font-medium ${overdue ? "text-rose-700" : "text-slate-900"}`}>
                      {formatDate(goal.dueDate)}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Owner</p>
                    <p className="mt-2 text-sm text-slate-700">{goal.assignee?.name || "Unassigned"}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Overall progress</span>
                    <span className="text-slate-500">{goal.progress}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor: activeWorkspace?.accentColor || "#2745f2"
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {!loading && !goals.length ? (
            <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
              No goals match these filters yet.
            </div>
          ) : null}
        </section>
      </section>

      <GoalFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGoal}
        members={members}
        loading={loading}
        title="Create goal"
      />
    </ProtectedLayout>
  );
}
