"use client";

const reactionOptions = [
  { type: "LIKE", emoji: "👍" },
  { type: "CELEBRATE", emoji: "🎉" },
  { type: "SUPPORT", emoji: "❤️" },
  { type: "INSIGHTFUL", emoji: "💡" }
];

export function ReactionBar({ reactionSummary = [], onToggle, loading }) {
  return (
    <div className="flex flex-wrap gap-2">
      {reactionOptions.map((option) => {
        const summary = reactionSummary.find((entry) => entry.type === option.type);
        const count = summary?.count || 0;
        const reacted = Boolean(summary?.reacted);

        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onToggle(option.type)}
            disabled={loading}
            className={`rounded-full px-3 py-2 text-sm transition ${
              reacted ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            {option.emoji} {count}
          </button>
        );
      })}
    </div>
  );
}
