"use client";

import { useState } from "react";
import { MentionTextarea, renderMentionText } from "@/components/mention-textarea";

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  loading,
  members,
  currentUserId,
  canModerate,
  depth = 0
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const canManage = canModerate || comment.author?.id === currentUserId;

  async function handleReply(event) {
    event.preventDefault();
    await onReply(comment.id, replyBody);
    setReplyBody("");
    setReplyOpen(false);
  }

  async function handleEdit(event) {
    event.preventDefault();
    await onEdit(comment.id, editBody);
    setEditing(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this comment? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    await onDelete(comment.id);
  }

  return (
    <div className={`${depth ? "ml-6 border-l border-slate-200 dark:border-slate-800 pl-4" : ""}`}>
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition hover:border-slate-200 dark:hover:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{comment.author?.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        {editing ? (
          <form className="mt-3 space-y-3" onSubmit={handleEdit}>
            <MentionTextarea
              value={editBody}
              onChange={setEditBody}
              members={members}
              className="min-h-24 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400"
              placeholder="Edit comment..."
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-slate-950 dark:bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-800 active:scale-95"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditBody(comment.body);
                }}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {renderMentionText(comment.body)}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setReplyOpen((current) => !current)}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 transition hover:text-brand-600"
          >
            {replyOpen ? "Cancel reply" : "Reply"}
          </button>
          {canManage ? (
            <>
              <button
                type="button"
                onClick={() => setEditing((current) => !current)}
                className="text-xs font-bold text-slate-500 dark:text-slate-400 transition hover:text-brand-600"
              >
                {editing ? "Cancel edit" : "Edit"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs font-bold text-rose-500 transition hover:text-rose-600"
              >
                Delete
              </button>
            </>
          ) : null}
        </div>
        {replyOpen ? (
          <form className="mt-3 space-y-3" onSubmit={handleReply}>
            <MentionTextarea
              value={replyBody}
              onChange={setReplyBody}
              members={members}
              className="min-h-24 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400"
              placeholder="Write a reply..."
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-950 dark:bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-800 active:scale-95"
            >
              Post reply
            </button>
          </form>
        ) : null}
      </div>

      {comment.replies?.length ? (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              loading={loading}
              members={members}
              currentUserId={currentUserId}
              canModerate={canModerate}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({
  comments,
  onReply,
  onEdit,
  onDelete,
  loading,
  members,
  currentUserId,
  canModerate
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          loading={loading}
          members={members}
          currentUserId={currentUserId}
          canModerate={canModerate}
        />
      ))}
    </div>
  );
}
