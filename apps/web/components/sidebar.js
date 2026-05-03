"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/goals", label: "Goals", icon: "🎯" },
  { href: "/action-items", label: "Action Items", icon: "✅" },
  { href: "/announcements", label: "Announcements", icon: "📢" },
  { href: "/settings/profile", label: "Profile", icon: "👤" },
  { href: "/settings/workspace", label: "Workspace", icon: "⚙️" }
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

function formatRelativeTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const deltaInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const ranges = [
    { unit: "day", seconds: 60 * 60 * 24 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 }
  ];
  for (const range of ranges) {
    if (Math.abs(deltaInSeconds) >= range.seconds || range.unit === "second") {
      return formatter.format(Math.round(deltaInSeconds / range.seconds), range.unit);
    }
  }
  return "";
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationRef = useRef(null);
  const workspaceRef = useRef(null);
  const profileRef = useRef(null);
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

  useEffect(() => {
    function handlePointerDown(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        closeNotifications();
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setWorkspaceOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeNotifications();
        setWorkspaceOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeNotifications]);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200/50 bg-white/75 dark:border-slate-800/50 dark:bg-slate-900/75 backdrop-blur-2xl transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex h-20 shrink-0 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 dark:bg-brand-500 font-display font-bold text-white shadow-sm">F</span>
          <div className="flex flex-col leading-none">
            <span className="font-display text-[1.1rem] font-bold tracking-tight text-slate-950 dark:text-white">FredoCloud</span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.3em] text-slate-500">Team Hub</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-[1.15rem] px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-950 text-white shadow-md dark:bg-brand-600"
                  : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white hover:shadow-sm"
              }`}
              style={isActive ? { backgroundColor: activeWorkspace?.accentColor || "#10212b" } : {}}
            >
              <span className={`text-lg transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: Workspaces & Profile */}
      <div className="mt-auto shrink-0 border-t border-slate-200/50 p-4 dark:border-slate-800/50">
        
        {/* Notifications Button */}
        <div ref={notificationRef} className="relative mb-3">
          <button
            type="button"
            onClick={() => {
              toggleNotifications();
              setWorkspaceOpen(false);
              setProfileOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-[1.15rem] border px-4 py-2.5 text-sm font-medium transition ${
              notificationOpen
                ? "border-slate-300 bg-white text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                : "border-slate-200/50 bg-white/50 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🔔</span> Notifications
            </div>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-rose-500 px-2 text-[10px] font-bold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
          
          {notificationOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-3 shadow-float backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
              <div className="flex items-center justify-between px-2 py-1">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">Notifications</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {unreadCount} unread
                </span>
              </div>
              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full rounded-2xl border px-3 py-2.5 text-left transition ${
                        notification.readAt
                          ? "border-slate-100 bg-transparent text-slate-600 dark:border-slate-800 dark:text-slate-400"
                          : "border-brand-200 bg-brand-50/50 text-slate-900 shadow-sm dark:border-brand-900 dark:bg-brand-900/20 dark:text-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold">{notification.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{notification.message}</p>
                          <p className="mt-1.5 text-[9px] uppercase tracking-wider text-slate-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.readAt && (
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500 shadow-sm" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-4 text-center text-xs text-slate-500">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        <div ref={workspaceRef} className="relative mb-3">
          <button
            type="button"
            onClick={() => {
              setWorkspaceOpen((current) => !current);
              closeNotifications();
              setProfileOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-[1.15rem] border px-3 py-2.5 transition ${
              workspaceOpen
                ? "border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800"
                : "border-slate-200/50 bg-white/50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span
                className="h-3 w-3 shrink-0 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.5)] dark:shadow-[0_0_0_2px_rgba(0,0,0,0.5)]"
                style={{ backgroundColor: activeWorkspace?.accentColor || "#10212b" }}
              />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {activeWorkspace?.name || "Workspace"}
                </p>
                <p className="truncate text-[10px] text-slate-500">Switch active space</p>
              </div>
            </div>
            <span className={`text-[10px] text-slate-400 transition-transform ${workspaceOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          {workspaceOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-2 shadow-float backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
              <div className="px-3 pb-2 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Workspaces</p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {workspaces.map((workspace) => {
                  const isActive = workspace.id === activeWorkspace?.id;
                  return (
                    <button
                      key={workspace.id}
                      type="button"
                      onClick={() => {
                        setWorkspaceOpen(false);
                        setActiveWorkspace(workspace.id);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: workspace.accentColor || "#10212b" }}
                      />
                      <span className={`truncate text-sm ${isActive ? "font-semibold text-slate-900 dark:text-white" : "font-medium text-slate-600 dark:text-slate-300"}`}>
                        {workspace.name}
                      </span>
                      {isActive && (
                        <span className="ml-auto text-xs text-slate-400">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Logout */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((current) => !current);
              closeNotifications();
              setWorkspaceOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-[1.15rem] border px-2 py-2 transition ${
              profileOpen
                ? "border-slate-300 bg-white shadow-sm dark:border-slate-600 dark:bg-slate-800"
                : "border-slate-200/50 bg-white/50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {user?.name ? initials(user.name) : "FC"}
                </span>
              )}
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Loading..."}</p>
                <p className="truncate text-[10px] text-slate-500">{user?.email || "Signed in"}</p>
              </div>
            </div>
          </button>
          {profileOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-2 shadow-float backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95">
              <Link
                href="/settings/profile"
                onClick={() => setProfileOpen(false)}
                className="block w-full rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Profile settings
              </Link>
              <div className="my-1 border-t border-slate-200/50 dark:border-slate-700/50" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 disabled:opacity-50"
              >
                {loading ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}
