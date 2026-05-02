"use client";

import { useEffect, useRef, useState } from "react";
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

function formatRelativeTime(value) {
  if (!value) {
    return "";
  }

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

export function TopNav() {
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
    <header className="sticky top-0 z-20 px-4 pt-4">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/60 bg-white/78 px-4 py-4 shadow-soft backdrop-blur-xl sm:px-5">
        <div className="flex min-w-0 items-center gap-4 lg:gap-6">
          <Link href="/dashboard" className="flex flex-col leading-none">
            <span className="font-display text-xl text-slate-950">FredoCloud</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.32em] text-slate-500">
              Team Hub
            </span>
          </Link>
          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-2 text-sm transition ${
                    isActive
                      ? "text-white shadow-sm"
                      : "text-slate-600 hover:bg-white/90 hover:text-slate-950"
                  }`}
                  style={isActive ? { backgroundColor: activeWorkspace?.accentColor || "#2745f2" } : {}}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                toggleNotifications();
                setWorkspaceOpen(false);
                setProfileOpen(false);
              }}
              className={`relative rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition ${
                notificationOpen
                  ? "border-slate-300 bg-white text-slate-950"
                  : "border-slate-200/80 bg-white/88 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              Notifications
              {unreadCount ? (
                <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            {notificationOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-[min(25rem,calc(100vw-2rem))] rounded-[1.7rem] border border-white/60 bg-white/92 p-3 shadow-float backdrop-blur-xl">
                <div className="flex items-center justify-between px-2 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Notifications</p>
                    <p className="text-xs text-slate-500">Recent mentions, updates, and invites</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    {unreadCount} unread
                  </span>
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
                            : "border-brand-200 bg-brand-50/70 text-slate-800 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="mt-1 text-xs leading-5">{notification.message}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                              {formatRelativeTime(notification.createdAt)}
                            </p>
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
          <div ref={workspaceRef} className="relative hidden lg:block">
            <button
              type="button"
              onClick={() => {
                setWorkspaceOpen((current) => !current);
                closeNotifications();
                setProfileOpen(false);
              }}
              className={`flex items-center gap-3 rounded-full border px-3 py-2 text-left shadow-sm transition ${
                workspaceOpen
                  ? "border-slate-300 bg-white text-slate-950"
                  : "border-slate-200/80 bg-white/88 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full shadow-[0_0_0_4px_rgba(255,255,255,0.85)]"
                style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
              />
              <div className="max-w-44">
                <p className="truncate text-sm font-medium">{activeWorkspace?.name || "Workspace"}</p>
                <p className="text-xs text-slate-500">Switch active space</p>
              </div>
              <span
                className={`text-xs text-slate-400 transition ${workspaceOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {workspaceOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-80 rounded-[1.7rem] border border-white/60 bg-white/94 p-3 shadow-float backdrop-blur-xl">
                <div className="px-2 pb-3 pt-1">
                  <p className="text-sm font-semibold text-slate-950">Workspaces</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose the team space you want to work in right now.
                  </p>
                </div>
                <div className="space-y-2">
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
                        className={`flex w-full items-center gap-3 rounded-[1.25rem] border px-3.5 py-3 text-left transition ${
                          isActive
                            ? "border-slate-200 bg-slate-950 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`h-3 w-3 rounded-full ${isActive ? "shadow-[0_0_0_4px_rgba(255,255,255,0.14)]" : ""}`}
                          style={{ backgroundColor: workspace.accentColor || "#2745f2" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{workspace.name}</p>
                          <p
                            className={`truncate text-xs ${isActive ? "text-white/65" : "text-slate-500"}`}
                          >
                            {workspace.description || "Collaborative workspace"}
                          </p>
                        </div>
                        {isActive ? (
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
                            Active
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((current) => !current);
                closeNotifications();
                setWorkspaceOpen(false);
              }}
              className={`flex items-center gap-3 rounded-full border px-2 py-2 shadow-sm transition ${
                profileOpen
                  ? "border-slate-300 bg-white text-slate-950"
                  : "border-slate-200/80 bg-white/88 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
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
              <span
                className={`hidden text-xs text-slate-400 transition sm:block ${profileOpen ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-full z-30 mt-3 w-64 rounded-[1.7rem] border border-white/60 bg-white/94 p-3 shadow-float backdrop-blur-xl">
                <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-950">{user?.name || "Demo User"}</p>
                  <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="mt-3 space-y-2">
                  <Link
                    href="/settings/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-[1.15rem] border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Profile settings
                  </Link>
                  <Link
                    href="/settings/workspace"
                    onClick={() => setProfileOpen(false)}
                    className="block rounded-[1.15rem] border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Workspace settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full rounded-[1.15rem] bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {loading ? "Signing out..." : "Logout"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
