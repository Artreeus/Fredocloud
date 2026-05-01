"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { GoalFormModal } from "@/components/goal-form-modal";
import { ProtectedLayout } from "@/components/protected-layout";
import { useGoalStore } from "@/stores/goal-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString();
}

export default function GoalDetailPage({ params }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const members = useWorkspaceStore((state) => state.members);
  const goal = useGoalStore((state) => state.currentGoal);
  const loading = useGoalStore((state) => state.loading);
  const error = useGoalStore((state) => state.error);
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
  const [success, setSuccess] = useState("");
  const canUpdateGoal = hasPermission(activeWorkspace, "UPDATE_GOAL");

  useEffect(() => {
    if (params?.id) {
      fetchGoal(params.id).catch(() => {});
    }
  }, [fetchGoal, params?.id]);

  async function handleEditGoal(values) {
    await updateGoal(goal.id, values);
    setShowEditModal(false);
    setSuccess("Goal updated.");
  }

  async function handleAddMilestone(event) {
    event.preventDefault();
    setSuccess("");
    await addMilestone(goal.id, milestoneForm);
    setMilestoneForm({
      title: "",
      progress: 0
    });
    setSuccess("Milestone added.");
  }

  async function handlePostUpdate(event) {
    event.preventDefault();
    setSuccess("");
    await addUpdate(goal.id, updateText);
    setUpdateText("");
    setSuccess("Progress update posted.");
  }

  async function handleMilestoneProgressChange(milestoneId, progress) {
    setSuccess("");
    await updateMilestone(goal.id, milestoneId, { progress: Number(progress) });
    setSuccess("Milestone progress updated.");
  }

  return (
    <ProtectedLayout>
      {goal ? (
        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="space-y-6">
            <section className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {goal.status.replaceAll("_", " ")}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {goal.priority}
                    </span>
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                    {goal.title}
                  </h1>
                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    {goal.description || "No description provided yet."}
                  </p>
                </div>
                {canUpdateGoal ? (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="rounded-full px-5 py-3 text-sm font-medium text-white"
                    style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
                  >
                    Edit goal
                  </button>
                ) : null}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Owner</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {goal.assignee?.name || "Unassigned"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Due date</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{formatDate(goal.dueDate)}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{goal.progress}%</p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: activeWorkspace?.accentColor || "#2745f2"
                  }}
                />
              </div>
            </section>

            <section className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                    Milestones
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Track progress
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {goal.milestones.map((milestone) => (
                  <div key={milestone.id} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{milestone.title}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          {milestone.owner?.name || "Unassigned"} · Due {formatDate(milestone.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={milestone.progress}
                          disabled={!canUpdateGoal}
                          onChange={(event) =>
                            handleMilestoneProgressChange(milestone.id, event.target.value)
                          }
                        />
                        <span className="text-sm font-medium text-slate-700">{milestone.progress}%</span>
                      </div>
                    </div>
                    <div className="mt-4 h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full"
                        style={{
                          width: `${milestone.progress}%`,
                          backgroundColor: activeWorkspace?.accentColor || "#2745f2"
                        }}
                      />
                    </div>
                  </div>
                ))}

                {!goal.milestones.length ? (
                  <p className="text-sm text-slate-500">No milestones yet for this goal.</p>
                ) : null}
              </div>

              <form className="mt-8 grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5" onSubmit={handleAddMilestone}>
                <div className="grid gap-4 md:grid-cols-[1fr_140px_auto]">
                  <input
                    type="text"
                    value={milestoneForm.title}
                    onChange={(event) =>
                      setMilestoneForm((current) => ({ ...current, title: event.target.value }))
                    }
                    disabled={!canUpdateGoal}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100"
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
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={loading || !canUpdateGoal}
                    className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white disabled:bg-slate-400"
                  >
                    Add milestone
                  </button>
                </div>
              </form>
            </section>
          </article>

          <article className="space-y-6">
            <section className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
                Activity Feed
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                Progress updates
              </h2>

              <form className="mt-6 space-y-4" onSubmit={handlePostUpdate}>
                <textarea
                  value={updateText}
                  onChange={(event) => setUpdateText(event.target.value)}
                  disabled={!canUpdateGoal}
                  className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100"
                  placeholder="Share a progress update with the team..."
                />
                <button
                  type="submit"
                  disabled={loading || !canUpdateGoal}
                  className="rounded-2xl px-5 py-3 text-sm font-medium text-white disabled:bg-slate-400"
                  style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
                >
                  Post update
                </button>
              </form>

              <div className="mt-8 space-y-4">
                {goal.updates.map((update) => (
                  <div key={update.id} className="rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{update.author?.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(update.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{update.body}</p>
                  </div>
                ))}

                {!goal.updates.length ? (
                  <p className="text-sm text-slate-500">No activity updates posted yet.</p>
                ) : null}
              </div>
            </section>

            {success ? (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            ) : null}
          </article>
        </section>
      ) : (
        <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
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
