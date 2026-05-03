"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { GoalFormModal } from "@/components/goal-form-modal";
import { ProtectedLayout } from "@/components/protected-layout";
import { useGoalStore } from "@/stores/goal-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

import { DashboardSkeleton } from "@/components/ui/skeleton";
import { CustomSelect } from "@/components/ui/select";

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
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Goals
            </p>
            <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">
              Team goals
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Create goals, track milestone progress, and spot overdue work across the active workspace.
            </p>
          </div>
          {canCreateGoal ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
              style={{ backgroundColor: activeWorkspace?.accentColor || "#10212b" }}
            >
              Create goal
            </button>
          ) : (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Goal creation is restricted
            </span>
          )}
        </div>

        <section className="grid gap-4 rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
            <CustomSelect
              value={filters.status}
              onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
              options={[
                { value: "", label: "All statuses" },
                { value: "NOT_STARTED", label: "Not Started" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "ON_HOLD", label: "On Hold" }
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner</span>
            <CustomSelect
              value={filters.assigneeId}
              onChange={(value) => setFilters((current) => ({ ...current, assigneeId: value }))}
              options={[
                { value: "", label: "All owners" },
                ...members.map((m) => ({ value: m.id, label: m.name }))
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Search</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
              placeholder="Search by goal title"
            />
          </label>
        </section>

        {loading ? (
          <DashboardSkeleton />
        ) : (
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
                  className={`rounded-[2.1rem] border bg-white dark:bg-slate-900/60 p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                    overdue ? "border-rose-200 dark:border-rose-900/50 ring-1 ring-rose-200/70 dark:ring-rose-900/30" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          {goal.status.replaceAll("_", " ")}
                        </span>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          {goal.priority}
                        </span>
                        {overdue ? (
                          <span className="rounded-full bg-rose-50 dark:bg-rose-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                            Overdue
                          </span>
                        ) : null}
                        {goal.isOptimistic ? (
                          <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Syncing
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-4 font-display text-3xl text-slate-950 dark:text-white">
                        {goal.title}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                        {goal.description || "No description provided yet."}
                      </p>
                    </div>
                    <div className="min-w-[200px] rounded-[1.75rem] border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Due date</p>
                      <p className={`mt-2 text-sm font-bold ${overdue ? "text-rose-600" : "text-slate-900 dark:text-slate-200"}`}>
                        {formatDate(goal.dueDate)}
                      </p>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner</p>
                      <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{goal.assignee?.name || "Unassigned"}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                      <span className="text-slate-500 dark:text-slate-400">Overall progress</span>
                      <span className="text-slate-900 dark:text-white">{goal.progress}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${goal.progress}%`,
                          backgroundColor: activeWorkspace?.accentColor || "#10212b"
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}

            {!goals.length ? (
              <div className="rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 shadow-sm">
                No goals match these filters yet.
              </div>
            ) : null}
          </section>
        )}
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
