"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormShell } from "@/components/auth-form-shell";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const storeError = useAuthStore((state) => state.error);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 12) score += 1;

    const finalScore = Math.min(4, Math.max(1, score));

    const strengths = {
      1: { label: "Weak", color: "bg-rose-500", textColor: "text-rose-500", width: "w-1/4" },
      2: { label: "Fair", color: "bg-amber-500", textColor: "text-amber-500", width: "w-2/4" },
      3: { label: "Good", color: "bg-brand-500", textColor: "text-brand-500", width: "w-3/4" },
      4: { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500", width: "w-full" }
    };

    return strengths[finalScore];
  };

  const strength = getPasswordStrength(form.password);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setLocalError("All fields are required.");
      return;
    }

    if (form.password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password
      });
      router.push("/dashboard");
    } catch (error) {
      setLocalError(error.message);
    }
  }

  return (
    <AuthFormShell
      title="Create your workspace"
      subtitle="Join FredoCloud and start collaborating with your team in a more structured flow."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand-700 dark:text-brand-500 transition hover:text-brand-800 dark:hover:text-brand-400">
            Sign in instead
          </Link>
        </>
      }
      eyebrow="New Team Setup"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20"
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300" htmlFor="email">
            Workspace Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20"
            placeholder="jane@fredocloud.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300" htmlFor="password">
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5 pr-12 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
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
          {strength && (
            <div className="pt-1 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} 
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-500">Password strength</span>
                <span className={strength.textColor}>{strength.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(event) =>
                setForm((current) => ({ ...current, confirmPassword: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3.5 pr-12 text-sm text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20"
              placeholder="Repeat password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showConfirmPassword ? (
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
          <span className="relative z-10">{loading ? "Creating account..." : "Create Account"}</span>
        </button>
      </form>
    </AuthFormShell>
  );
}
