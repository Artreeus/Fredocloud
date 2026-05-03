"use client";

import { useEffect, useState } from "react";
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

function MilestoneSlider({ milestone, canUpdateGoal, activeWorkspace, onChangeEnd }) {
  const [value, setValue] = useState(milestone.progress);

  useEffect(() => {
    setValue(milestone.progress);
  }, [milestone.progress]);

  function handleEnd() {
    if (value !== milestone.progress) {
      onChangeEnd(milestone.id, value);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        disabled={!canUpdateGoal}
        onChange={(event) => setValue(Number(event.target.value))}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 dark:bg-slate-700 accent-[var(--workspace-accent)]"
      />
      <span className="min-w-10 text-right text-sm font-bold text-slate-700 dark:text-slate-300">
        {value}%
      </span>
    </div>
  );
}

export default function GoalDetailPage({ params }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const members = useWorkspaceStore((state) => state.members);
  const goal = useGoalStore((state) => state.currentGoal);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);
  const clearError = useGoalStore((state) => state.clearError);
  const fetchGoal = useGoalStore((state) => state.fetchGoal);
  const updateGoal = useGoalStore((state) => state.updateGoal);
  const addMilestone = useGoalStore((state) => state.addMilestone);
  const updateMilestone = useGoalStore((state) => state.updateMilestone);
  const addUpdate = useGoalStore((state) => state.addUpdate);
  const [showEditModal, setShowEditModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    progress: 0
  });
  const [updateText, setUpdateText] = useState("");
  const canUpdateGoal = hasPermission(activeWorkspace, "UPDATE_GOAL");
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    if (params?.id) {
      fetchGoal(params.id).catch(() => {});
    }
  }, [fetchGoal, params?.id]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  async function handleEditGoal(values) {
    await updateGoal(goal.id, values);
    setShowEditModal(false);
    pushToast({ type: "success", message: "Goal updated." });
  }

  async function handleAddMilestone(event) {
    event.preventDefault();
    await addMilestone(goal.id, milestoneForm);
    setMilestoneForm({
      title: "",
      progress: 0
    });
    pushToast({ type: "success", message: "Milestone added." });
  }

  async function handlePostUpdate(event) {
    event.preventDefault();
    await addUpdate(goal.id, updateText);
    setUpdateText("");
    pushToast({ type: "success", message: "Progress update posted." });
  }

  async function handleMilestoneProgressChange(milestoneId, progress) {
    await updateMilestone(goal.id, milestoneId, { progress: Number(progress) });
    pushToast({ type: "success", message: "Milestone progress updated." });
  }

  return (
    <ProtectedLayout>
      {goal ? (
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="space-y-6">
            <section className="rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {goal.status.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {goal.priority}
                    </span>
                  </div>
                  <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">{goal.title}</h1>
                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {goal.description || "No description provided yet."}
                  </p>
                </div>
                {canUpdateGoal ? (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: activeWorkspace?.accentColor || "#10212b" }}
                  >
                    Edit goal
                  </button>
                ) : null}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.8rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Owner</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-200">
                    {goal.assignee?.name || "Unassigned"}
                  </p>
                </div>
                <div className="rounded-[1.8rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Due date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-200">{formatDate(goal.dueDate)}</p>
                </div>
                <div className="rounded-[1.8rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Progress</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-200">{goal.progress}%</p>
                </div>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: activeWorkspace?.accentColor || "#10212b"
                  }}
                />
              </div>
            </section>

            <section className="rounded-[2.15rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
                    Milestones
                  </p>
                  <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">Track progress</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {goal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="rounded-[1.8rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-slate-950 dark:text-white">{milestone.title}</h3>
                        <p className="mt-2 truncate text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {milestone.owner?.name || "Unassigned"} | Due{" "}
                          {formatDate(milestone.dueDate)}
                        </p>
                      </div>
                      <div className="w-full md:w-64 shrink-0">
                        <MilestoneSlider
                          milestone={milestone}
                          canUpdateGoal={canUpdateGoal}
                          activeWorkspace={activeWorkspace}
                          onChangeEnd={handleMilestoneProgressChange}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {!goal.milestones.length ? (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No milestones yet for this goal.</p>
                ) : null}
              </div>

              <form
                className="mt-8 grid gap-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5"
                onSubmit={handleAddMilestone}
              >
                <div className="grid gap-4 md:grid-cols-[1fr_140px_auto]">
                  <input
                    type="text"
                    value={milestoneForm.title}
                    onChange={(event) =>
                      setMilestoneForm((current) => ({ ...current, title: event.target.value }))
                    }
                    disabled={!canUpdateGoal}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-60"
                    placeholder="New milestone title"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={milestoneForm.progress}
                    onChange={(event) =>
                      setMilestoneForm((current) => ({
                        ...current,
                        progress: Number(event.target.value)
                      }))
                    }
                    disabled={!canUpdateGoal}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-60"
                    placeholder="Progress %"
                  />
                  <button
                    type="submit"
                    disabled={loading || !canUpdateGoal}
                    className="rounded-2xl px-5 py-3 text-sm font-bold text-white transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: activeWorkspace?.accentColor || "#10212b" }}
                  >
                    Add milestone
                  </button>
                </div>
              </form>
            </section>
          </article>

          <article className="space-y-6">
            <section className="rounded-[2.15rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
                Activity Feed
              </p>
              <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">Progress updates</h2>

              <form className="mt-6 space-y-4" onSubmit={handlePostUpdate}>
                <textarea
                  value={updateText}
                  onChange={(event) => setUpdateText(event.target.value)}
                  disabled={!canUpdateGoal}
                  className="min-h-32 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-60"
                  placeholder="Share a progress update with the team..."
                />
                <button
                  type="submit"
                  disabled={loading || !canUpdateGoal}
                  className="rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: activeWorkspace?.accentColor || "#10212b" }}
                >
                  Post update
                </button>
              </form>

              <div className="mt-8 space-y-4">
                {goal.updates.map((update) => (
                  <div
                    key={update.id}
                    className="rounded-[1.8rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{update.author?.name}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {new Date(update.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{update.body}</p>
                  </div>
                ))}

                {!goal.updates.length ? (
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No activity updates posted yet.</p>
                ) : null}
              </div>
            </section>
          </article>
        </section>
      ) : (
        <div className="rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 shadow-sm">
          {loading ? "Loading goal details..." : "Goal not found."}
        </div>
      )}

      <GoalFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditGoal}
        members={members}
        initialValues={goal}
        loading={loading}
        title="Edit goal"
      />
    </ProtectedLayout>
  );
}
