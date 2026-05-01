"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings/profile", label: "Profile" }
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

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const activeWorkspace = user?.memberships?.[0];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-slate-950">
            FredoCloud
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 sm:block">
            Workspace: {activeWorkspace?.workspaceName || "Workspace switcher soon"}
          </div>
          <Link
            href="/settings/profile"
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm"
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
