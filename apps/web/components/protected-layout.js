"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";
import { Sidebar } from "@/components/sidebar";
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

  if (!hydrated || loading || !user || !workspaceInitialized) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 bg-canvas dark:bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,111,74,0.1),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(88,113,93,0.1),transparent_30%)]" />
        <div className="relative flex flex-col items-center gap-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 shadow-2xl animate-in fade-in zoom-in duration-500">
          <Loader size="xl" />
          <div className="text-center space-y-2">
            <p className="font-display text-xs font-black uppercase tracking-[0.4em] text-brand-600 dark:text-brand-500">
              FredoCloud Hub
            </p>
            <p className="font-sans text-sm font-bold text-slate-400 dark:text-slate-500">
              Synchronizing workspace...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div
      className="flex min-h-screen bg-canvas dark:bg-slate-950 transition-colors duration-300"
      style={{
        "--workspace-accent": activeWorkspace?.accentColor || "#10212b"
      }}
    >
      <WorkspaceRealtimeBridge workspaceId={activeWorkspace?.id} />
      
      {/* Sidebar fixed to the left */}
      <Sidebar />
      
      {/* Main content area, offset by the sidebar width (72 = 18rem) */}
      <div className="flex flex-1 flex-col pl-72">
        <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(16,33,43,0.08),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_62%)]" />
        <main className="relative mx-auto w-full max-w-[1440px] px-10 py-12">{children}</main>
      </div>
    </div>
  );
}
