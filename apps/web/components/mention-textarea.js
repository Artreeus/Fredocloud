"use client";

import { useMemo, useState } from "react";

function extractMentionQuery(value, selectionStart) {
  const beforeCursor = value.slice(0, selectionStart);
  const mentionIndex = beforeCursor.lastIndexOf("@");

  if (mentionIndex === -1) {
    return null;
  }

  const query = beforeCursor.slice(mentionIndex + 1);

  if (query.includes(" ") || query.includes("\n")) {
    return null;
  }

  return {
    mentionIndex,
    query: query.toLowerCase()
  };
}

export function renderMentionText(value) {
  return value.replace(/@\[(.*?)\]\(([^)]+)\)/g, "@$1");
}

export function MentionTextarea({
  value,
  onChange,
  members = [],
  placeholder,
  className,
  minRows = 4
}) {
  const [selectionStart, setSelectionStart] = useState(0);
  const mentionState = extractMentionQuery(value, selectionStart);

  const suggestions = useMemo(() => {
    if (!mentionState) {
      return [];
    }

    return members
      .filter((member) => member.name.toLowerCase().includes(mentionState.query))
      .slice(0, 5);
  }, [members, mentionState]);

  function handleSelect(member) {
    if (!mentionState) {
      return;
    }

    const before = value.slice(0, mentionState.mentionIndex);
    const after = value.slice(selectionStart);
    const nextValue = `${before}@[${member.name}](${member.id}) ${after}`;
    onChange(nextValue);
  }

  return (
    <div className="relative">
      <textarea
        value={value}
        rows={minRows}
        onChange={(event) => {
          onChange(event.target.value);
          setSelectionStart(event.target.selectionStart);
        }}
        onClick={(event) => setSelectionStart(event.currentTarget.selectionStart)}
        onKeyUp={(event) => setSelectionStart(event.currentTarget.selectionStart)}
        className={className}
        placeholder={placeholder}
      />
      {suggestions.length ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-[1.4rem] border border-slate-200 bg-white p-2 shadow-float">
          {suggestions.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleSelect(member)}
              className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <span>{member.name}</span>
              <span className="text-xs text-slate-400">@mention</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
