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
          <Link href="/register" className="font-medium text-brand-700">
            Create one here
          </Link>
        </>
      }
      eyebrow="Secure Workspace Access"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-[1.4rem] border border-slate-200/90 bg-white/92 px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            placeholder="demo@fredocloud.com"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            className="w-full rounded-[1.4rem] border border-slate-200/90 bg-white/92 px-4 py-3 text-sm outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            placeholder="Your password"
          />
        </label>
        {localError || storeError ? (
          <p className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {localError || storeError}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[1.4rem] bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthFormShell>
  );
}
