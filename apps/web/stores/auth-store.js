"use client";

import { create } from "zustand";
import { apiRequest } from "@/lib/api-client";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  hydrated: false,
  error: null,
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }

    try {
      await get().fetchMe({ silent: true });
    } catch {
      set({ user: null });
    } finally {
      set({ hydrated: true });
    }
  },
  fetchMe: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const payload = await apiRequest("/api/auth/me");
      set({ user: payload.user, error: null });
      return payload.user;
    } catch (error) {
      set({ user: null, error: silent ? null : error.message });
      throw error;
    } finally {
      if (!silent) {
        set({ loading: false });
      }
    }
  },
  login: async (values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values)
      });
      set({ user: payload.user, error: null });
      return payload.user;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false, hydrated: true });
    }
  },
  register: async (values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(values)
      });
      set({ user: payload.user, error: null });
      return payload.user;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false, hydrated: true });
    }
  },
  logout: async () => {
    set({ loading: true, error: null });

    try {
      await apiRequest("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      set({ user: null, loading: false, error: null, hydrated: true });
    }
  },
  refresh: async () => {
    await apiRequest("/api/auth/refresh", {
      method: "POST"
    });
    return get().fetchMe({ silent: true });
  },
  updateProfile: async (values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify(values)
      });
      set({ user: payload.user, error: null });
      return payload.user;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  uploadAvatar: async (file) => {
    set({ loading: true, error: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadPayload = await apiRequest("/api/upload", {
        method: "POST",
        body: formData
      });

      const profilePayload = await apiRequest("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          avatarUrl: uploadPayload.url
        })
      });

      set({ user: profilePayload.user, error: null });
      return profilePayload.user;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
