"use client";

import { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  const [name, setName] = useState("");
  const pushToast = useToastStore((state) => state.pushToast);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  async function handleProfileSubmit(event) {
    event.preventDefault();

    await updateProfile({ name });
    pushToast({ type: "success", message: "Profile updated." });
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadAvatar(file);
    pushToast({ type: "success", message: "Avatar updated." });
    event.target.value = "";
  }

  return (
    <ProtectedLayout>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2.3rem] border border-white/60 bg-white/76 p-8 shadow-float backdrop-blur-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
            User Profile
          </p>
          <h1 className="mt-4 font-display text-5xl text-slate-950">
            Profile settings
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Update your display name and avatar. Avatar uploads go through the backend
            Cloudinary route and sync back into your account.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleProfileSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">Avatar</span>
              <label className="flex cursor-pointer items-center justify-between rounded-[1.7rem] border border-dashed border-slate-300 bg-white/80 px-4 py-4 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-brand-50">
                <span>Choose a new image</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  Upload
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Saving..." : "Save changes"}
            </button>
          </form>
        </article>

        <article className="rounded-[2.3rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-float">
          <h2 className="font-display text-3xl text-white">Current profile</h2>
          <div className="mt-6 flex items-center gap-4">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/12 text-xl font-semibold text-white">
                {user?.name?.slice(0, 1)?.toUpperCase() || "F"}
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-300">{user?.email}</p>
            </div>
          </div>
        </article>
      </section>
    </ProtectedLayout>
  );
}
