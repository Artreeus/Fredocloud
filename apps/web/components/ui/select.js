"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function CustomSelect({ value, onChange, options, placeholder = "Select...", variant = "default", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const variants = {
    default: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-brand-100 dark:focus:ring-brand-900/20",
    dark: "border-slate-800 bg-slate-900 text-white focus:ring-white/10"
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm text-left outline-none transition focus:border-brand-400 focus:ring-4 ${variants[variant] || variants.default}`}
      >
        <span className="truncate font-medium">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border p-2 shadow-xl animate-in fade-in slide-in-from-top-2 ${variant === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                    value === opt.value
                      ? (variant === 'dark' ? "bg-slate-800 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")
                      : (variant === 'dark' ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200")
                  }`}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
