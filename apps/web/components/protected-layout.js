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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.14),transparent_24%)]" />
        <div className="relative rounded-[2rem] border border-white/60 bg-white/75 px-8 py-6 text-sm text-slate-700 shadow-float backdrop-blur">
          Loading your workspace...
        </div>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        "--workspace-accent": activeWorkspace?.accentColor || "#2745f2"
      }}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(16,33,43,0.08),transparent_62%)]" />
      <TopNav />
      <main className="relative mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
