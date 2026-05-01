"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedLayout({ children }) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      fetchMe().catch(() => {
        router.replace("/login");
      });
    }
  }, [fetchMe, hydrated, router, user]);

  if (!hydrated || loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-600 shadow-soft">
          Loading your workspace...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
