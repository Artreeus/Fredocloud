"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/goals", label: "Goals" },
  { href: "/action-items", label: "Action Items" },
  { href: "/announcements", label: "Announcements" },
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/workspace", label: "Workspace" }
];

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const resetWorkspaceStore = useWorkspaceStore((state) => state.reset);

  async function handleLogout() {
    await logout();
    resetWorkspaceStore();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-[1.8rem] border border-white/60 bg-white/72 px-5 py-4 shadow-soft backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex flex-col leading-none">
            <span className="font-display text-xl text-slate-950">FredoCloud</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.32em] text-slate-500">
              Team Hub
            </span>
          </Link>
          <nav className="hidden items-center gap-2 xl:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "text-white shadow-sm"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  }`}
                  style={isActive ? { backgroundColor: activeWorkspace?.accentColor || "#2745f2" } : {}}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-white/85 px-3 py-2 text-sm text-slate-600 lg:flex">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
            />
            <select
              value={activeWorkspace?.id || ""}
              onChange={(event) => setActiveWorkspace(event.target.value)}
              className="max-w-44 bg-transparent outline-none"
            >
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/88 px-2 py-2 shadow-sm"
          >
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {user?.name ? initials(user.name) : "FC"}
              </span>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-950">{user?.name || "Loading..."}</p>
              <p className="text-xs text-slate-500">{user?.email || "Signed in"}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
