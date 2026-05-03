"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormShell } from "@/components/auth-form-shell";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm({ redirectTo }) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const storeError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!form.email || !form.password) {
      setLocalError("Email and password are required.");
      return;
    }

    try {
      await login(form);
      router.push(redirectTo || "/dashboard");
    } catch (error) {
      setLocalError(error.message);
    }
  }

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle="Sign in to pick up goals, announcements, and action items right where your team left them."
      footer={
        <>
          Need an account?{" "}
          <Link href="/register" className="font-medium text-brand-700 transition hover:text-brand-800">
            Create one here
          </Link>
        </>
      }
      eyebrow="Secure Workspace Access"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-[1.4rem] border border-slate-200/90 bg-white/92 px-4 py-3.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100/50"
            placeholder="demo@fredocloud.com"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="w-full rounded-[1.4rem] border border-slate-200/90 bg-white/92 px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100/50"
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {localError || storeError ? (
          <div className="animate-fade-in rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
            {localError || storeError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-[1.4rem] bg-slate-950 px-4 py-4 text-sm font-medium text-white transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span className="relative z-10">{loading ? "Signing in..." : "Sign in to Workspace"}</span>
          <div className="absolute inset-0 z-0 scale-0 rounded-full bg-white opacity-5 transition-transform duration-500 group-hover:scale-150" />
        </button>
      </form>
    </AuthFormShell>
  );
}
