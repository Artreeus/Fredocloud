"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Loader({ fullPage = false, modal = false, size = "md" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeClasses[size] || sizeClasses.md}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand-500 border-r-brand-400" />
        
        {/* Inner floating dot/logo element */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-1/3 w-1/3 animate-pulse rounded-full bg-slate-900 dark:bg-white shadow-glow" />
        </div>
      </div>
      {(fullPage || modal) && (
        <p className="animate-pulse font-display text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
          Synchronizing...
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-canvas/80 dark:bg-slate-950/80 backdrop-blur-xl">
        {loaderContent}
      </div>,
      document.body
    );
  }

  if (modal) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm px-6">
        <div className="relative flex flex-col items-center gap-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 shadow-2xl animate-in fade-in zoom-in duration-300">
          {loaderContent}
        </div>
      </div>,
      document.body
    );
  }

  return loaderContent;
}
