"use client";

import { useEffect, useState } from "react";
import { CommentThread } from "@/components/comment-thread";
import { ProtectedLayout } from "@/components/protected-layout";
import { ReactionBar } from "@/components/reaction-bar";
import { useAnnouncementStore } from "@/stores/announcement-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function AnnouncementDetailPage({ params }) {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const announcement = useAnnouncementStore((state) => state.currentAnnouncement);
  const comments = useAnnouncementStore((state) => state.comments);
  const loading = useAnnouncementStore((state) => state.loading);
  const error = useAnnouncementStore((state) => state.error);
  const fetchAnnouncement = useAnnouncementStore((state) => state.fetchAnnouncement);
  const addComment = useAnnouncementStore((state) => state.addComment);
  const toggleReaction = useAnnouncementStore((state) => state.toggleReaction);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    if (params?.id) {
      fetchAnnouncement(params.id).catch(() => {});
    }
  }, [fetchAnnouncement, params?.id]);

  async function handleAddComment(event) {
    event.preventDefault();
    await addComment(params.id, { body: commentBody });
    await fetchAnnouncement(params.id);
    setCommentBody("");
  }

  async function handleReply(parentCommentId, body) {
    await addComment(params.id, { body, parentCommentId });
    await fetchAnnouncement(params.id);
  }

  async function handleToggleReaction(type) {
    await toggleReaction(params.id, type);
    await fetchAnnouncement(params.id);
  }

  return (
    <ProtectedLayout>
      {announcement ? (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              {announcement.pinned ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  Pinned
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              {announcement.title}
            </h1>
            <p className="mt-3 text-sm text-slate-500">By {announcement.author?.name}</p>

            <div
              className="prose prose-slate mt-8 max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: announcement.body }}
            />

            <div className="mt-8">
              <ReactionBar
                reactionSummary={announcement.reactionSummary}
                onToggle={handleToggleReaction}
                loading={loading}
              />
            </div>
          </article>

          <article className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Comments
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Discussion
            </h2>

            <form className="mt-6 space-y-4" onSubmit={handleAddComment}>
              <textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl px-5 py-3 text-sm font-medium text-white disabled:bg-slate-400"
                style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
              >
                Post comment
              </button>
            </form>

            <div className="mt-8">
              <CommentThread comments={comments} onReply={handleReply} loading={loading} />
            </div>

            {!comments.length ? (
              <p className="mt-6 text-sm text-slate-500">No comments yet for this announcement.</p>
            ) : null}
          </article>
        </section>
      ) : (
        <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
          {loading ? "Loading announcement..." : "Announcement not found."}
        </div>
      )}

      {error ? (
        <p className="mt-6 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
    </ProtectedLayout>
  );
}
