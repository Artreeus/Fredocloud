"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
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

function buildNotificationHref(notification) {
  switch (notification.type) {
    case "ANNOUNCEMENT_POSTED":
    case "COMMENT_MENTION":
      return notification.entityId ? `/announcements/${notification.entityId}` : "/announcements";
    case "GOAL_ASSIGNED":
      return notification.entityId ? `/goals/${notification.entityId}` : "/goals";
    case "ACTION_ITEM_ASSIGNED":
    case "ACTION_ITEM_DUE":
      return "/action-items";
    case "WORKSPACE_INVITE":
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const notificationOpen = useNotificationStore((state) => state.open);
  const toggleNotifications = useNotificationStore((state) => state.toggleOpen);
  const closeNotifications = useNotificationStore((state) => state.close);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markRead = useNotificationStore((state) => state.markRead);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace);
  const resetWorkspaceStore = useWorkspaceStore((state) => state.reset);

  async function handleLogout() {
    await logout();
    resetWorkspaceStore();
    router.push("/login");
  }

  useEffect(() => {
    if (user) {
      fetchNotifications({ silent: true }).catch(() => {});
    }
  }, [fetchNotifications, user]);

  async function handleNotificationClick(notification) {
    await markRead(notification.id).catch(() => {});
    closeNotifications();
    router.push(buildNotificationHref(notification));
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
          <div className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
              className="relative rounded-full border border-slate-200/80 bg-white/88 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
            >
              Notifications
              {unreadCount ? (
                <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {notificationOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-96 rounded-[1.7rem] border border-white/60 bg-white/92 p-3 shadow-float backdrop-blur-xl">
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-sm font-semibold text-slate-950">Notifications</p>
                  <span className="text-xs text-slate-500">{unreadCount} unread</span>
                </div>
                <div className="mt-2 space-y-2">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full rounded-[1.3rem] border px-4 py-3 text-left transition ${
                          notification.readAt
                            ? "border-slate-200 bg-white text-slate-600"
                            : "border-brand-200 bg-brand-50/70 text-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="mt-1 text-xs leading-5">{notification.message}</p>
                          </div>
                          {!notification.readAt ? (
                            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                          ) : null}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[1.3rem] border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
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
