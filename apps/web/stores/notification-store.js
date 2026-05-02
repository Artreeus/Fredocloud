"use client";

import { apiRequest } from "@/lib/api-client";
import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  open: false,
  loading: false,
  error: null,
  toggleOpen: () => set((state) => ({ open: !state.open })),
  close: () => set({ open: false }),
  fetchNotifications: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const payload = await apiRequest("/api/notifications");
      set({
        notifications: payload.notifications,
        unreadCount: payload.unreadCount,
        error: null
      });
      return payload.notifications;
    } catch (error) {
      set({ error: silent ? null : error.message });
      throw error;
    } finally {
      if (!silent) {
        set({ loading: false });
      }
    }
  },
  markRead: async (notificationId) => {
    const alreadyRead = get().notifications.find((notification) => notification.id === notificationId)?.readAt;

    if (alreadyRead) {
      return;
    }

    const payload = await apiRequest(`/api/notifications/${notificationId}/read`, {
      method: "PATCH"
    });

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? payload.notification : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },
  pushSocketNotification: (notification, currentUserId) =>
    set((state) => {
      if (!notification || notification.userId !== currentUserId) {
        return state;
      }

      const exists = state.notifications.some((entry) => entry.id === notification.id);

      return {
        notifications: exists ? state.notifications : [notification, ...state.notifications].slice(0, 20),
        unreadCount: state.unreadCount + (exists || notification.readAt ? 0 : 1)
      };
    })
}));
