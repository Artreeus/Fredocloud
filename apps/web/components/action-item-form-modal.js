"use client";

import { useEffect, useState } from "react";

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const statusOptions = ["OPEN", "IN_PROGRESS", "DONE"];

function emptyValues() {
  return {
    title: "",
    description: "",
    assigneeId: "",
    priority: "MEDIUM",
    dueDate: "",
    goalId: "",
    status: "OPEN"
  };
}

export function ActionItemFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  members,
  goals,
  loading,
  initialValues,
  title
}) {
  const [form, setForm] = useState(emptyValues());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(emptyValues());
      setError("");
      return;
    }

    if (initialValues) {
      setForm({
        title: initialValues.title || "",
        description: initialValues.description || "",
        assigneeId: initialValues.assignee?.id || "",
        priority: initialValues.priority || "MEDIUM",
        dueDate: initialValues.dueDate ? new Date(initialValues.dueDate).toISOString().slice(0, 10) : "",
        goalId: initialValues.goal?.id || "",
        status: initialValues.status || "OPEN"
      });
    } else {
      setForm(emptyValues());
    }

    setError("");
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Action item title is required.");
      return;
    }

    await onSubmit({
      ...form,
      dueDate: form.dueDate || null,
      assigneeId: form.assigneeId || null,
      goalId: form.goalId || null
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-6 py-10">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-8 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Action Items
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
            <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Assignee</span>
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
              <span className="mb-2 block text-sm font-medium text-slate-700">Goal</span>
              <select
                value={form.goalId}
                onChange={(event) => setForm((current) => ({ ...current, goalId: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                <option value="">No linked goal</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
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
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {onDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={loading}
                  className="rounded-2xl bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700 disabled:opacity-50"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:bg-slate-400"
            >
              {loading ? "Saving..." : "Save action item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
