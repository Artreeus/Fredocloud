"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Megaphone, 
  UserCircle, 
  Settings,
  Bell,
  ChevronDown,
  LogOut,
  Sparkles
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/action-items", label: "Action Items", icon: CheckSquare },
  { href: "/announcements", label: "Announcements", icon: Megaphone },
  { href: "/settings/profile", label: "Profile", icon: UserCircle },
  { href: "/settings/workspace", label: "Workspace", icon: Settings }
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950 transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex h-24 shrink-0 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 dark:bg-brand-600 font-display font-black text-white shadow-lg ring-1 ring-white/20">F</span>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-950" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-black tracking-tight text-slate-950 dark:text-white">FredoCloud</span>
            <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Team Hub</span>
          </div>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-8">
        <p className="mb-6 px-4 text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-slate-950 text-white shadow-xl dark:bg-slate-100 dark:text-slate-950"
                  : "text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              {item.label}
              {isActive && (
                <div className="absolute right-4 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-brand-500 shadow-[0_0_8px_rgba(188,95,63,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: Workspaces & Profile */}
      <div className="mt-auto shrink-0 space-y-4 border-t border-slate-200/60 p-5 dark:border-slate-800/50">
        
        {/* Notifications Button */}
        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => {
              toggleNotifications();
              setWorkspaceOpen(false);
              setProfileOpen(false);
            }}
            className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition-all duration-300 ${
              notificationOpen
                ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                : "border-slate-200/80 bg-white/50 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className={`h-5 w-5 transition-transform ${notificationOpen ? "rotate-12" : "group-hover:rotate-12"}`} />
              Notifications
            </div>
            {unreadCount > 0 && (
              <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black shadow-sm ${notificationOpen ? "bg-white text-slate-950 dark:bg-slate-950 dark:text-white" : "bg-brand-500 text-white"}`}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {notificationOpen && (
            <div className="absolute bottom-full left-0 z-50 mb-3 w-80 rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between px-1 pb-4">
                <h4 className="text-sm font-black tracking-tight text-slate-950 dark:text-white">Recent Updates</h4>
                <Sparkles className="h-4 w-4 text-brand-500" />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {notifications.length ? (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full rounded-2xl border p-3.5 text-left transition-all ${
                        notification.readAt
                          ? "border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-transparent"
                          : "border-brand-100 bg-brand-50/40 shadow-sm dark:border-brand-900/50 dark:bg-brand-900/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-bold ${notification.readAt ? "text-slate-600 dark:text-slate-300" : "text-slate-950 dark:text-white"}`}>{notification.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{notification.message}</p>
                          <p className="mt-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {formatRelativeTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.readAt && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500 shadow-glow" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-xs font-bold text-slate-400">All caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workspace & Profile Combined or Refined */}
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <div ref={workspaceRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setWorkspaceOpen((current) => !current);
                closeNotifications();
                setProfileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 transition-all duration-300 ${
                workspaceOpen
                  ? "border-slate-300 bg-white shadow-md dark:border-slate-600 dark:bg-slate-800"
                  : "border-slate-200/80 bg-white/50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[10px] text-slate-500" style={{ backgroundColor: `${activeWorkspace?.accentColor}15` || "#f1f5f9" }}>
                <span style={{ color: activeWorkspace?.accentColor || "#94a3b8" }}>
                  {activeWorkspace?.name ? activeWorkspace.name[0].toUpperCase() : "W"}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[13px] font-black text-slate-900 dark:text-white">
                  {activeWorkspace?.name || "Workspace"}
                </p>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${workspaceOpen ? "rotate-180" : ""}`} />
              </div>
            </button>
            {workspaceOpen && (
              <div className="absolute bottom-full left-0 z-50 mb-3 w-72 rounded-[2rem] border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="px-4 pb-3 pt-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Switch Workspace</p>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1.5 px-1 custom-scrollbar">
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
                        className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full shadow-sm" style={{ backgroundColor: workspace.accentColor || "#10212b" }} />
                        <span className={`truncate text-sm font-bold ${isActive ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                          {workspace.name}
                        </span>
                        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((current) => !current);
                closeNotifications();
                setWorkspaceOpen(false);
              }}
              className={`flex h-[50px] w-[50px] items-center justify-center rounded-2xl border transition-all duration-300 ${
                profileOpen
                  ? "border-slate-950 bg-slate-950 dark:border-white dark:bg-white shadow-lg"
                  : "border-slate-200/80 bg-white/50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-xl object-cover" />
              ) : (
                <UserCircle className={`h-6 w-6 ${profileOpen ? "text-white dark:text-slate-950" : "text-slate-500"}`} />
              )}
            </button>
            {profileOpen && (
              <div className="absolute bottom-full right-0 z-50 mb-3 w-64 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-col items-center p-4 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-lg font-black text-slate-950 dark:text-white">
                    {user?.name ? initials(user.name) : "FC"}
                  </div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">{user?.name || "Demo User"}</p>
                  <p className="mt-1 truncate text-[11px] font-bold text-slate-400 uppercase tracking-tight">{user?.email}</p>
                </div>
                <div className="space-y-1.5 px-1 pb-1">
                  <Link
                    href="/settings/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20 disabled:opacity-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {loading ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
