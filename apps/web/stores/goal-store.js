"use client";

import { apiRequest } from "@/lib/api-client";
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
      const payload = await apiRequest("/api/goals", {
        method: "POST",
        body: JSON.stringify(values)
      });
      set((state) => ({
        goals: [payload.goal, ...state.goals],
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
