"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/select";

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
  canDelete = true,
  members,
  goals,
  loading,
  initialValues,
  title
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-950/60">
        <div className="w-full max-w-2xl rounded-[2.2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in zoom-in duration-300 my-auto">
          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Action Items
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
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Title</span>
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
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Assignee</span>
              <CustomSelect
                value={form.assigneeId}
                onChange={(value) => setForm((current) => ({ ...current, assigneeId: value }))}
                options={[
                  { value: "", label: "Unassigned" },
                  ...members.map((member) => ({ value: member.id, label: member.name }))
                ]}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Goal</span>
              <CustomSelect
                value={form.goalId}
                onChange={(value) => setForm((current) => ({ ...current, goalId: value }))}
                options={[
                  { value: "", label: "No linked goal" },
                  ...goals.map((goal) => ({ value: goal.id, label: goal.title }))
                ]}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</span>
              <CustomSelect
                value={form.priority}
                onChange={(value) => setForm((current) => ({ ...current, priority: value }))}
                options={priorityOptions.map((priority) => ({ value: priority, label: priority }))}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
              <CustomSelect
                value={form.status}
                onChange={(value) => setForm((current) => ({ ...current, status: value }))}
                options={statusOptions.map((status) => ({ value: status, label: status.replaceAll("_", " ") }))}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
              />
            </label>
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {onDelete && canDelete ? (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={loading}
                  className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 px-6 py-3.5 text-sm font-bold text-rose-700 dark:text-rose-400 transition hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 active:scale-95"
                >
                  Delete
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-800 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save action item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>,
    document.body
  );
}
