"use client";

import { apiRequest } from "@/lib/api-client";
import { create } from "zustand";

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  currentAnnouncement: null,
  comments: [],
  pagination: null,
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  fetchAnnouncements: async ({ workspaceId, page = 1, pageSize = 10 }) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(
        `/api/announcements?workspaceId=${workspaceId}&page=${page}&pageSize=${pageSize}`
      );
      set({
        announcements: payload.announcements,
        pagination: payload.pagination,
        error: null
      });
      return payload.announcements;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchAnnouncement: async (announcementId) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/announcements/${announcementId}`);
      set({
        currentAnnouncement: payload.announcement,
        comments: payload.announcement.comments || [],
        error: null
      });
      return payload.announcement;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  createAnnouncement: async (values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/announcements", {
        method: "POST",
        body: JSON.stringify(values)
      });
      set((state) => ({
        announcements: [payload.announcement, ...state.announcements],
        error: null
      }));
      return payload.announcement;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  togglePin: async (announcementId, pinned) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/announcements/${announcementId}/pin`, {
        method: "PATCH",
        body: JSON.stringify({ pinned })
      });

      set((state) => ({
        currentAnnouncement:
          state.currentAnnouncement?.id === announcementId
            ? { ...state.currentAnnouncement, pinned: payload.announcement.pinned }
            : state.currentAnnouncement,
        announcements: state.announcements
          .map((announcement) =>
            announcement.id === announcementId ? payload.announcement : announcement
          )
          .sort((a, b) => {
            if (a.pinned !== b.pinned) {
              return a.pinned ? -1 : 1;
            }
            return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
          }),
        error: null
      }));
      return payload.announcement;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  toggleReaction: async (announcementId, type) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/announcements/${announcementId}/reactions`, {
        method: "POST",
        body: JSON.stringify({ type })
      });

      set((state) => ({
        currentAnnouncement:
          state.currentAnnouncement?.id === announcementId
            ? { ...state.currentAnnouncement, reactionSummary: payload.announcement.reactionSummary }
            : state.currentAnnouncement,
        announcements: state.announcements.map((announcement) =>
          announcement.id === announcementId ? payload.announcement : announcement
        ),
        error: null
      }));
      return payload.announcement;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchComments: async (announcementId) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/announcements/${announcementId}/comments`);
      set({ comments: payload.comments, error: null });
      return payload.comments;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addComment: async (announcementId, values) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/announcements/${announcementId}/comments`, {
        method: "POST",
        body: JSON.stringify(values)
      });
      return get().fetchComments(announcementId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
