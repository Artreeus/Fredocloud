"use client";

import { apiRequest } from "@/lib/api-client";
import { runOptimisticUpdate } from "@/lib/optimistic-update";
import { useToastStore } from "@/stores/toast-store";
import { create } from "zustand";

function applyReactionSummary(reactionSummary, type) {
  const existing = reactionSummary.find((entry) => entry.type === type);
  const activeReaction = reactionSummary.find((entry) => entry.reacted);
  let nextSummary = reactionSummary.map((entry) => ({ ...entry }));

  if (activeReaction && activeReaction.type !== type) {
    nextSummary = nextSummary
      .map((entry) =>
        entry.type === activeReaction.type
          ? {
              ...entry,
              reacted: false,
              count: Math.max(0, entry.count - 1)
            }
          : entry
      )
      .filter((entry) => entry.count > 0 || entry.reacted);
  }

  if (existing?.reacted) {
    nextSummary = nextSummary
      .map((entry) =>
        entry.type === type
          ? {
              ...entry,
              reacted: false,
              count: Math.max(0, entry.count - 1)
            }
          : entry
      )
      .filter((entry) => entry.count > 0 || entry.reacted);
  } else if (existing) {
    nextSummary = nextSummary.map((entry) =>
      entry.type === type
        ? {
            ...entry,
            reacted: true,
            count: entry.count + 1
          }
        : entry
    );
  } else {
    nextSummary = [
      ...nextSummary,
      {
        type,
        emoji:
          {
            LIKE: "👍",
            CELEBRATE: "🎉",
            SUPPORT: "❤️",
            INSIGHTFUL: "💡"
          }[type] || "👍",
        label: type,
        count: 1,
        reacted: true
      }
    ];
  }

  return nextSummary;
}

function insertComment(comments, nextComment, parentCommentId) {
  if (!parentCommentId) {
    return [...comments, nextComment];
  }

  return comments.map((comment) => {
    if (comment.id === parentCommentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), nextComment]
      };
    }

    if (comment.replies?.length) {
      return {
        ...comment,
        replies: insertComment(comment.replies, nextComment, parentCommentId)
      };
    }

    return comment;
  });
}

export const useAnnouncementStore = create((set, get) => ({
  announcements: [],
  currentAnnouncement: null,
  comments: [],
  pagination: null,
  pendingReactionIds: {},
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  applySocketAnnouncement: (announcement) =>
    set((state) => {
      const exists = state.announcements.some((entry) => entry.id === announcement.id);
      const announcements = exists
        ? state.announcements.map((entry) => (entry.id === announcement.id ? announcement : entry))
        : [announcement, ...state.announcements];

      return {
        announcements: announcements.sort((a, b) => {
          if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
          }

          return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
        }),
        currentAnnouncement:
          state.currentAnnouncement?.id === announcement.id
            ? {
                ...state.currentAnnouncement,
                ...announcement
              }
            : state.currentAnnouncement
      };
    }),
  applySocketComment: ({ announcementId, comment, parentCommentId }) =>
    set((state) => ({
      comments:
        state.currentAnnouncement?.id === announcementId
          ? insertComment(state.comments, comment, parentCommentId)
          : state.comments,
      currentAnnouncement:
        state.currentAnnouncement?.id === announcementId
          ? {
              ...state.currentAnnouncement,
              commentCount: (state.currentAnnouncement.commentCount || 0) + 1
            }
          : state.currentAnnouncement,
      announcements: state.announcements.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              commentCount: (announcement.commentCount || 0) + 1
            }
          : announcement
      )
    })),
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
      const snapshot = {
        announcements: get().announcements,
        currentAnnouncement: get().currentAnnouncement
      };

      return await runOptimisticUpdate({
        snapshot,
        apply: () =>
          set((state) => ({
            pendingReactionIds: {
              ...state.pendingReactionIds,
              [announcementId]: true
            },
            currentAnnouncement:
              state.currentAnnouncement?.id === announcementId
                ? {
                    ...state.currentAnnouncement,
                    reactionSummary: applyReactionSummary(
                      state.currentAnnouncement.reactionSummary || [],
                      type
                    )
                  }
                : state.currentAnnouncement,
            announcements: state.announcements.map((announcement) =>
              announcement.id === announcementId
                ? {
                    ...announcement,
                    reactionSummary: applyReactionSummary(announcement.reactionSummary || [], type)
                  }
                : announcement
            ),
            error: null
          })),
        commit: async () => {
          const payload = await apiRequest(`/api/announcements/${announcementId}/reactions`, {
            method: "POST",
            body: JSON.stringify({ type })
          });

          set((state) => ({
            pendingReactionIds: {
              ...state.pendingReactionIds,
              [announcementId]: false
            },
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
        },
        rollback: (previous) =>
          set((state) => ({
            announcements: previous.announcements,
            currentAnnouncement: previous.currentAnnouncement,
            pendingReactionIds: {
              ...state.pendingReactionIds,
              [announcementId]: false
            },
            error: "Could not update reaction"
          })),
        onError: (error) =>
          useToastStore.getState().pushToast({
            type: "error",
            message: error.message || "Reaction update failed. The optimistic change was rolled back."
          })
      });
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
