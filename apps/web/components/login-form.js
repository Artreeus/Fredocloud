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
          <Link href="/register" className="font-semibold text-brand-700 transition hover:text-brand-800">
            Create an account
          </Link>
        </>
      }
      eyebrow="Secure Workspace Access"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide text-slate-700" htmlFor="email">
            Workspace Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            placeholder="name@company.com"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold tracking-wide text-slate-700" htmlFor="password">
              Password
            </label>
            <button 
              type="button" 
              onClick={handleLoadDemo}
              className="text-xs font-bold uppercase tracking-wider text-brand-600 transition hover:text-brand-700 hover:underline"
            >
              Load Demo
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 pr-14 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {localError || storeError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-3.5 text-sm text-rose-700 animate-fade-in">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{localError || storeError}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-slate-900 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <span className="relative z-10">{loading ? "Authenticating..." : "Sign in to Workspace"}</span>
        </button>
      </form>
    </AuthFormShell>
  );
}
