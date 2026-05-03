"use client";

import { useState } from "react";
import { MentionTextarea, renderMentionText } from "@/components/mention-textarea";

function CommentItem({ comment, onReply, loading, members, depth = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  async function handleReply(event) {
    event.preventDefault();
    await onReply(comment.id, replyBody);
    setReplyBody("");
    setReplyOpen(false);
  }

  return (
    <div className={`${depth ? "ml-6 border-l border-slate-200 dark:border-slate-800 pl-4" : ""}`}>
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 transition hover:border-slate-200 dark:hover:border-slate-700">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{comment.author?.name}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{renderMentionText(comment.body)}</p>
        <button
          type="button"
          onClick={() => setReplyOpen((current) => !current)}
          className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400 transition hover:text-brand-600"
        >
          {replyOpen ? "Cancel reply" : "Reply"}
        </button>
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
              loading={loading}
              members={members}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({ comments, onReply, loading, members }) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          loading={loading}
          members={members}
        />
      ))}
    </div>
  );
}
