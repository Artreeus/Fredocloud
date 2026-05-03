"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/rich-text-editor";

export function AnnouncementFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  canDelete = false,
  loading,
  initialValues,
  modalTitle = "Create announcement"
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setAnnouncementTitle("");
      setBody("");
      setError("");
      return;
    }

    setAnnouncementTitle(initialValues?.title || "");
    setBody(initialValues?.body || "");
    setError("");
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!announcementTitle.trim()) {
      setError("Announcement title is required.");
      return;
    }

    if (!body.replace(/<[^>]+>/g, "").trim()) {
      setError("Announcement body is required.");
      return;
    }

    await onSubmit({ title: announcementTitle, body });
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-950/60">
        <div className="w-full max-w-3xl rounded-[2.2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl animate-in zoom-in duration-300 my-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Announcements
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
              {modalTitle}
            </h2>
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
              value={announcementTitle}
              onChange={(event) => setAnnouncementTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
              placeholder="System update, team lunch, etc."
            />
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Body</span>
            <RichTextEditor value={body} onChange={setBody} placeholder="Share an update with the team..." />
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {onDelete && canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={loading}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300 dark:hover:bg-rose-950/30"
              >
                Delete announcement
              </button>
            ) : (
              <span />
            )}
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
              ) : initialValues ? (
                "Save announcement"
              ) : (
                "Publish announcement"
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
