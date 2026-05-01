"use client";

import { apiRequest } from "@/lib/api-client";
import { create } from "zustand";

function buildQuery(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, value);
    }
  });

  return params.toString();
}

export const useActionItemStore = create((set, get) => ({
  actionItems: [],
  filters: {
    status: "",
    assigneeId: "",
    priority: "",
    goalId: "",
    search: "",
    overdue: "false",
    sortBy: "dueDate",
    sortOrder: "asc"
  },
  viewMode: "kanban",
  selectedIds: [],
  loading: false,
  error: null,
  setViewMode: (viewMode) => set({ viewMode }),
  setFilters: (nextFilters) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...nextFilters
      }
    })),
  toggleSelection: (actionItemId) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(actionItemId)
        ? state.selectedIds.filter((id) => id !== actionItemId)
        : [...state.selectedIds, actionItemId]
    })),
  clearSelection: () => set({ selectedIds: [] }),
  fetchActionItems: async (workspaceId) => {
    set({ loading: true, error: null });

    try {
      const query = buildQuery({
        workspaceId,
        ...get().filters
      });
      const payload = await apiRequest(`/api/action-items?${query}`);
      set({
        actionItems: payload.actionItems,
        error: null
      });
      return payload.actionItems;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  createActionItem: async (values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/action-items", {
        method: "POST",
        body: JSON.stringify(values)
      });
      set((state) => ({
        actionItems: [...state.actionItems, payload.actionItem],
        error: null
      }));
      return payload.actionItem;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateActionItem: async (actionItemId, values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/action-items/${actionItemId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      });
      set((state) => ({
        actionItems: state.actionItems.map((actionItem) =>
          actionItem.id === actionItemId ? payload.actionItem : actionItem
        ),
        error: null
      }));
      return payload.actionItem;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateActionItemStatus: async (actionItemId, status) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/action-items/${actionItemId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      set((state) => ({
        actionItems: state.actionItems.map((actionItem) =>
          actionItem.id === actionItemId ? payload.actionItem : actionItem
        ),
        error: null
      }));
      return payload.actionItem;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  bulkUpdateStatus: async (workspaceId, status) => {
    const actionItemIds = get().selectedIds;

    if (!actionItemIds.length) {
      return [];
    }

    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/action-items/bulk-status", {
        method: "PATCH",
        body: JSON.stringify({
          workspaceId,
          actionItemIds,
          status
        })
      });
      set((state) => ({
        actionItems: state.actionItems.map((actionItem) => {
          const updated = payload.actionItems.find((item) => item.id === actionItem.id);
          return updated || actionItem;
        }),
        selectedIds: [],
        error: null
      }));
      return payload.actionItems;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteActionItem: async (actionItemId) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/action-items/${actionItemId}`, {
        method: "DELETE"
      });
      set((state) => ({
        actionItems: state.actionItems.filter((actionItem) => actionItem.id !== actionItemId),
        selectedIds: state.selectedIds.filter((id) => id !== actionItemId),
        error: null
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
