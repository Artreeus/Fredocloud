"use client";

import { useEffect, useState } from "react";

export function Skeleton({ className = "" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/50 ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[2.3rem] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 p-8 shadow-sm">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="mt-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="mt-10 flex gap-3">
        <Skeleton className="h-10 w-24 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-4 w-[600px] mt-2" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-16 mt-4" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2.3rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-8 h-96">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-full w-full mt-6 rounded-2xl" />
        </div>
        <div className="rounded-[2.3rem] border border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 p-8 h-96">
          <Skeleton className="h-6 w-48" />
          <div className="mt-8 flex justify-center">
            <Skeleton className="h-56 w-56 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
