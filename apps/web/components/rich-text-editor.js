"use client";

import dynamic from "next/dynamic";

// CKEditor needs to be loaded only on the client
const EditorWrapper = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = await import("@ckeditor/ckeditor5-build-classic");
    
    // Create a functional component that wraps CKEditor
    const WrappedEditor = ({ value, onChange, placeholder }) => (
      <CKEditor
        editor={ClassicEditor.default || ClassicEditor}
        data={value}
        config={{
          placeholder: placeholder,
          licenseKey: 'GPL',
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "blockQuote",
              "undo",
              "redo"
            ]
          }
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    );

    WrappedEditor.displayName = "WrappedEditor";
    return WrappedEditor;
  },
  { 
    ssr: false, 
    loading: () => (
      <div className="min-h-[250px] w-full rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 animate-pulse flex items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading editor...</p>
      </div>
    ) 
  }
);

export function RichTextEditor({ value, onChange, placeholder = "Write something..." }) {
  return (
    <div className="rich-text-wrapper overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 transition-all focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100 dark:focus-within:ring-brand-900/20">
      <EditorWrapper
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .rich-text-wrapper .ck.ck-editor__editable_inline {
          min-height: 200px;
          padding: 0 1.5rem !important;
          border: none !important;
          box-shadow: none !important;
          font-size: 0.875rem !important;
          line-height: 1.75rem !important;
        }
        .rich-text-wrapper .ck.ck-toolbar {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background-color: #f8fafc !important;
          padding: 0.5rem 1rem !important;
        }
        .dark .rich-text-wrapper {
          border-color: #1e293b !important;
        }
        .dark .rich-text-wrapper .ck.ck-toolbar {
          background-color: #0f172a !important;
          border-bottom-color: #1e293b !important;
        }
        .dark .rich-text-wrapper .ck.ck-editor__editable_inline {
          background-color: #020617 !important;
          color: #f8fafc !important;
        }
        .dark .rich-text-wrapper .ck.ck-button {
          color: #94a3b8 !important;
          cursor: pointer !important;
        }
        .dark .rich-text-wrapper .ck.ck-button:hover {
          background-color: #1e293b !important;
          color: #f8fafc !important;
        }
        .dark .rich-text-wrapper .ck.ck-button.ck-on {
          background-color: #1e293b !important;
          color: #38bdf8 !important;
        }
        .dark .rich-text-wrapper .ck.ck-toolbar__separator {
          background-color: #1e293b !important;
        }
        .ck.ck-placeholder::before {
          color: #94a3b8 !important;
        }
        .ck.ck-reset_all * {
            font-family: inherit !important;
        }
      `}</style>
    </div>
  );
}
