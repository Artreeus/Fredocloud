"use client";

import { useState } from "react";

function CommentItem({ comment, onReply, loading, depth = 0 }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");

  async function handleReply(event) {
    event.preventDefault();
    await onReply(comment.id, replyBody);
    setReplyBody("");
    setReplyOpen(false);
  }

  return (
    <div className={`${depth ? "ml-6 border-l border-slate-200 pl-4" : ""}`}>
      <div className="rounded-3xl bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">{comment.author?.name}</p>
          <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{comment.body}</p>
        <button
          type="button"
          onClick={() => setReplyOpen((current) => !current)}
          className="mt-3 text-xs font-medium text-slate-600"
        >
          {replyOpen ? "Cancel reply" : "Reply"}
        </button>
        {replyOpen ? (
          <form className="mt-3 space-y-3" onSubmit={handleReply}>
            <textarea
              value={replyBody}
              onChange={(event) => setReplyBody(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              placeholder="Write a reply..."
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:bg-slate-400"
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
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentThread({ comments, onReply, loading }) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} onReply={onReply} loading={loading} />
      ))}
    </div>
  );
}
