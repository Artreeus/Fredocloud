"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { CommentThread } from "@/components/comment-thread";
import { MentionTextarea } from "@/components/mention-textarea";
import { ProtectedLayout } from "@/components/protected-layout";
import { ReactionBar } from "@/components/reaction-bar";
import { useAnnouncementStore } from "@/stores/announcement-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function AnnouncementDetailPage({ params }) {
  const members = useWorkspaceStore((state) => state.members);
  const announcement = useAnnouncementStore((state) => state.currentAnnouncement);
  const comments = useAnnouncementStore((state) => state.comments);
  const loading = useAnnouncementStore((state) => state.loading);
  const error = useAnnouncementStore((state) => state.error);
  const clearError = useAnnouncementStore((state) => state.clearError);
  const fetchAnnouncement = useAnnouncementStore((state) => state.fetchAnnouncement);
  const addComment = useAnnouncementStore((state) => state.addComment);
  const toggleReaction = useAnnouncementStore((state) => state.toggleReaction);
  const [commentBody, setCommentBody] = useState("");
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    if (params?.id) {
      fetchAnnouncement(params.id).catch(() => {});
    }
  }, [fetchAnnouncement, params?.id]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  async function handleAddComment(event) {
    event.preventDefault();
    await addComment(params.id, { body: commentBody });
    await fetchAnnouncement(params.id);
    setCommentBody("");
    pushToast({ type: "success", message: "Comment posted." });
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
          <article className="rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {announcement.pinned ? (
                <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Pinned
                </span>
              ) : null}
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}
              </span>
            </div>
            <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">
              {announcement.title}
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">By {announcement.author?.name}</p>

            <div
              className="prose prose-slate dark:prose-invert mt-8 max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: announcement.body }}
            />

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <ReactionBar
                reactionSummary={announcement.reactionSummary}
                onToggle={handleToggleReaction}
                loading={loading}
              />
            </div>
          </article>

          <article className="rounded-[2.15rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Comments
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white">
              Discussion
            </h2>

            <form className="mt-6 space-y-4" onSubmit={handleAddComment}>
              <MentionTextarea
                value={commentBody}
                onChange={setCommentBody}
                members={members}
                className="min-h-28 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-800 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post comment"
                )}
              </button>
            </form>

            <div className="mt-8">
              <CommentThread comments={comments} onReply={handleReply} loading={loading} members={members} />
            </div>

            {!comments.length ? (
              <p className="mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">No comments yet for this announcement.</p>
            ) : null}
          </article>
        </section>
      ) : (
        <div className="flex h-[400px] items-center justify-center rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {loading ? <Loader size="lg" /> : <p className="text-sm font-medium text-slate-500">Announcement not found.</p>}
        </div>
      )}

    </ProtectedLayout>
  );
}
