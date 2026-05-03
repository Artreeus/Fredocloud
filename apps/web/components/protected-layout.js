"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { TopNav } from "@/components/top-nav";
import { WorkspaceRealtimeBridge } from "@/components/workspace-realtime-bridge";
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
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 bg-canvas dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.14),transparent_24%)] dark:opacity-40" />
        <div className="relative flex flex-col items-center gap-6 rounded-[2.5rem] border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 p-12 shadow-float backdrop-blur-2xl animate-fade-in">
          <Loader size="lg" />
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 animate-pulse">
            Loading your workspace...
          </p>
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
      <WorkspaceRealtimeBridge workspaceId={activeWorkspace?.id} />
      <TopNav />
      <main className="relative mx-auto w-full max-w-[1200px] px-6 py-10">{children}</main>
    </div>
  );
}
