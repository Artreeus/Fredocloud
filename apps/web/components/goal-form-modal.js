"use client";

import { useEffect, useState } from "react";

const emptyMilestone = {
  title: "",
  progress: 0
};

export function GoalFormModal({ open, onClose, onSubmit, members, initialValues, loading, title }) {
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-6 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-8 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Goals
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600"
          >
            Close
          </button>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Goal title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
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
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Owner</span>
              <select
                value={form.assigneeId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, assigneeId: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Priority</span>
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({ ...current, priority: event.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </label>
          </div>
          {!initialValues ? (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
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
                  className="rounded-full bg-white px-4 py-2 text-sm text-slate-700"
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
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
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
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                      placeholder="0-100"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:bg-slate-400"
          >
            {loading ? "Saving..." : "Save goal"}
          </button>
        </form>
      </div>
    </div>
  );
}
