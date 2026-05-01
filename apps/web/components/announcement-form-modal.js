"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";

export function AnnouncementFormModal({ open, onClose, onSubmit, loading }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setBody("");
      setError("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Announcement title is required.");
      return;
    }

    if (!body.replace(/<[^>]+>/g, "").trim()) {
      setError("Announcement body is required.");
      return;
    }

    await onSubmit({ title, body });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-6 py-10">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white p-8 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Announcements
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Create announcement
            </h2>
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
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </label>
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Body</span>
            <RichTextEditor value={body} onChange={setBody} placeholder="Share an update with the team..." />
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white disabled:bg-slate-400"
          >
            {loading ? "Publishing..." : "Publish announcement"}
          </button>
        </form>
      </div>
    </div>
  );
}
