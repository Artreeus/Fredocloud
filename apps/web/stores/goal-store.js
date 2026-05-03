"use client";

import { apiRequest } from "@/lib/api-client";
import { runOptimisticUpdate } from "@/lib/optimistic-update";
import { useToastStore } from "@/stores/toast-store";
import { create } from "zustand";

function buildGoalQuery(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

export const useGoalStore = create((set, get) => ({
  goals: [],
  currentGoal: null,
  loading: false,
  error: null,
  clearError: () => set({ error: null }),
  fetchGoals: async (filters) => {
    set({ loading: true, error: null });

    try {
      const query = buildGoalQuery(filters);
      const payload = await apiRequest(`/api/goals${query ? `?${query}` : ""}`);
      set({ goals: payload.goals, error: null });
      return payload.goals;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  fetchGoal: async (goalId) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/goals/${goalId}`);
      set({ currentGoal: payload.goal, error: null });
      return payload.goal;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  createGoal: async (values) => {
    set({ loading: true, error: null });

    try {
      const snapshot = get().goals;
      const tempId = `temp-goal-${Date.now()}`;
      const progress = values.milestones?.length
        ? Math.round(
            values.milestones.reduce((total, milestone) => total + Number(milestone.progress || 0), 0) /
              values.milestones.length
          )
        : 0;

      return await runOptimisticUpdate({
        snapshot,
        apply: () =>
          set((state) => ({
            goals: [
              {
                id: tempId,
                title: values.title,
                description: values.description || null,
                status: values.status || "NOT_STARTED",
                priority: values.priority || "MEDIUM",
                progress,
                dueDate: values.dueDate || null,
                startDate: null,
                completedAt: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workspaceId: values.workspaceId,
                assignee: null,
                createdBy: null,
                milestones: values.milestones || [],
                updates: [],
                isOptimistic: true
              },
              ...state.goals
            ],
            error: null
          })),
        commit: async () => {
          const payload = await apiRequest("/api/goals", {
            method: "POST",
            body: JSON.stringify(values)
          });

          set((state) => ({
            goals: state.goals.map((goal) => (goal.id === tempId ? payload.goal : goal)),
            error: null
          }));

          return payload.goal;
        },
        rollback: (previousGoals) =>
          set({
            goals: previousGoals,
            error: "Could not create goal"
          }),
        onError: (error) =>
          useToastStore.getState().pushToast({
            type: "error",
            message: error.message || "Could not create goal. The optimistic change was rolled back."
          })
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateGoal: async (goalId, values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      });
      set((state) => ({
        currentGoal: payload.goal,
        goals: state.goals.map((goal) => (goal.id === goalId ? payload.goal : goal)),
        error: null
      }));
      return payload.goal;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  deleteGoal: async (goalId) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/goals/${goalId}`, {
        method: "DELETE"
      });

      set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== goalId),
        currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
        error: null
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addMilestone: async (goalId, values) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/goals/${goalId}/milestones`, {
        method: "POST",
        body: JSON.stringify(values)
      });
      return get().fetchGoal(goalId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateMilestone: async (goalId, milestoneId, values) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      });
      return get().fetchGoal(goalId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  addUpdate: async (goalId, body) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/goals/${goalId}/updates`, {
        method: "POST",
        body: JSON.stringify({ body })
      });
      return get().fetchGoal(goalId);
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
