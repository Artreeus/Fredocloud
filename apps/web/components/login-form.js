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

  const handleLoadDemo = () => {
    setForm({
      email: "demo@fredocloud.com",
      password: "Demo@12345"
    });
  };

  return (
    <AuthFormShell
      title="Welcome back"
      subtitle="Sign in to your team's workspace to continue where you left off."
      footer={
        <>
          New to FredoCloud?{" "}
          <Link href="/register" className="font-semibold text-brand-700 dark:text-brand-500 transition hover:text-brand-800 dark:hover:text-brand-400">
            Create an account
          </Link>
        </>
      }
      eyebrow="Secure Workspace Access"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300" htmlFor="email">
            Workspace Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20"
            placeholder="name@company.com"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <button 
              type="button" 
              onClick={handleLoadDemo}
              className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-500 transition hover:text-brand-700 dark:hover:text-brand-400 hover:underline"
            >
              Load Demo
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 pr-12 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {localError || storeError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-5 py-3.5 text-sm text-rose-700 dark:text-rose-400 animate-fade-in">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{localError || storeError}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 dark:bg-brand-600 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-slate-900 dark:hover:bg-brand-500 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800"
        >
          <span className="relative z-10">{loading ? "Authenticating..." : "Sign in to Workspace"}</span>
        </button>
      </form>
    </AuthFormShell>
  );
}
