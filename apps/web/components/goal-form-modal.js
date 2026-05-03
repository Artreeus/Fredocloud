"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/select";

const emptyMilestone = {
  title: "",
  progress: 0
};

export function GoalFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  canDelete = false,
  members,
  initialValues,
  loading,
  title
}) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    dueDate: "",
    status: "NOT_STARTED",
    priority: "MEDIUM",
    milestones: [{ ...emptyMilestone }]
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        description: initialValues.description || "",
        assigneeId: initialValues.assignee?.id || "",
        dueDate: initialValues.dueDate ? initialValues.dueDate.slice(0, 10) : "",
        status: initialValues.status || "NOT_STARTED",
        priority: initialValues.priority || "MEDIUM",
        milestones:
          initialValues.milestones?.length
            ? initialValues.milestones.map((milestone) => ({
                title: milestone.title,
                progress: milestone.progress
              }))
            : [{ ...emptyMilestone }]
      });
      return;
    }

    setForm({
      title: "",
      description: "",
      assigneeId: "",
      dueDate: "",
      status: "NOT_STARTED",
      priority: "MEDIUM",
      milestones: [{ ...emptyMilestone }]
    });
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Goal title is required.");
      return;
    }

    await onSubmit({
      ...form,
      milestones: form.milestones.filter((milestone) => milestone.title.trim())
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-6 py-10 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2.2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Goals
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Goal title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-28 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Owner</span>
              <CustomSelect
                value={form.assigneeId}
                onChange={(value) => setForm((current) => ({ ...current, assigneeId: value }))}
                options={[
                  { value: "", label: "Unassigned" },
                  ...members.map((m) => ({ value: m.id, label: m.name }))
                ]}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
              <CustomSelect
                value={form.status}
                onChange={(value) => setForm((current) => ({ ...current, status: value }))}
                options={[
                  { value: "NOT_STARTED", label: "Not Started" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "ON_HOLD", label: "On Hold" }
                ]}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</span>
              <CustomSelect
                value={form.priority}
                onChange={(value) => setForm((current) => ({ ...current, priority: value }))}
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "URGENT", label: "Urgent" }
                ]}
              />
            </label>
          </div>
          {!initialValues ? (
            <div className="rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Milestones
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      milestones: [...current.milestones, { ...emptyMilestone }]
                    }))
                  }
                  className="rounded-full bg-white dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Add milestone
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {form.milestones.map((milestone, index) => (
                  <div key={`${index}-${milestone.title}`} className="grid gap-3 md:grid-cols-[1fr_120px]">
                    <input
                      type="text"
                      value={milestone.title}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          milestones: current.milestones.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, title: event.target.value } : item
                          )
                        }))
                      }
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
                      placeholder="Milestone title"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={milestone.progress}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          milestones: current.milestones.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, progress: Number(event.target.value) }
                              : item
                          )
                        }))
                      }
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
                      placeholder="0-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {error ? (
            <p className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">{error}</p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {onDelete && canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/30"
              >
                Delete goal
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-brand-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-slate-800 dark:hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-800 sm:w-auto sm:min-w-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save goal"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
