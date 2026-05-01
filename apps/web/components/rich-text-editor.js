"use client";

import { useEffect, useRef } from "react";

const actions = [
  { command: "bold", label: "Bold" },
  { command: "italic", label: "Italic" },
  { command: "insertUnorderedList", label: "Bullets" },
  { command: "insertOrderedList", label: "Numbers" }
];

export function RichTextEditor({ value, onChange, placeholder = "Write something..." }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  function applyCommand(command) {
    document.execCommand(command, false);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-3">
        {actions.map((action) => (
          <button
            key={action.command}
            type="button"
            onClick={() => applyCommand(action.command)}
            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700"
          >
            {action.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-40 px-4 py-4 text-sm leading-7 text-slate-700 outline-none"
        data-placeholder={placeholder}
      />
    </div>
  );
}
