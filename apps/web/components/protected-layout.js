"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function ProtectedLayout({ children }) {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const workspaceInitialized = useWorkspaceStore((state) => state.initialized);
  const workspaceLoading = useWorkspaceStore((state) => state.loading);
  const bootstrap = useWorkspaceStore((state) => state.bootstrap);
  const resetWorkspaceStore = useWorkspaceStore((state) => state.reset);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      resetWorkspaceStore();
      fetchMe().catch(() => {
        router.replace("/login");
      });
    }
  }, [fetchMe, hydrated, resetWorkspaceStore, router, user]);

  useEffect(() => {
    if (user) {
      bootstrap().catch(() => {});
    }
  }, [bootstrap, user]);

  if (!hydrated || loading || !user || !workspaceInitialized || workspaceLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-600 shadow-soft">
          Loading your workspace...
        </div>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100"
      style={{
        "--workspace-accent": activeWorkspace?.accentColor || "#2745f2"
      }}
    >
      <TopNav />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
