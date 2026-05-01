"use client";

import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { create } from "zustand";

function syncActiveWorkspace(workspaces, activeWorkspaceId) {
  if (!workspaces.length) {
    return {
      activeWorkspaceId: null,
      activeWorkspace: null
    };
  }

  const nextActiveWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) || workspaces[0];

  return {
    activeWorkspaceId: nextActiveWorkspace.id,
    activeWorkspace: nextActiveWorkspace
  };
}

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  activeWorkspace: null,
  members: [],
  invitations: [],
  pendingInvitations: [],
  loading: false,
  error: null,
  initialized: false,
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      workspaces: [],
      activeWorkspaceId: null,
      activeWorkspace: null,
      members: [],
      invitations: [],
      pendingInvitations: [],
      loading: false,
      error: null,
      initialized: false
    }),
  setActiveWorkspace: async (workspaceId) => {
    const nextActiveWorkspace = get().workspaces.find((workspace) => workspace.id === workspaceId);

    if (!nextActiveWorkspace) {
      return;
    }

    set({
      activeWorkspaceId: nextActiveWorkspace.id,
      activeWorkspace: nextActiveWorkspace
    });

    await get().fetchMembers(nextActiveWorkspace.id, { silent: true });
  },
  fetchWorkspaces: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const payload = await apiRequest("/api/workspaces");
      const nextState = syncActiveWorkspace(payload.workspaces, get().activeWorkspaceId);

      set({
        workspaces: payload.workspaces,
        ...nextState,
        initialized: true,
        error: null
      });

      if (nextState.activeWorkspaceId) {
        await get().fetchMembers(nextState.activeWorkspaceId, { silent: true });
      } else {
        set({ members: [], invitations: [] });
      }

      return payload.workspaces;
    } catch (error) {
      set({
        error: silent ? null : error.message,
        initialized: true
      });
      throw error;
    } finally {
      if (!silent) {
        set({ loading: false });
      }
    }
  },
  fetchMembers: async (workspaceId = get().activeWorkspaceId, { silent = false } = {}) => {
    if (!workspaceId) {
      set({ members: [], invitations: [] });
      return [];
    }

    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const payload = await apiRequest(`/api/workspaces/${workspaceId}/members`);
      set({
        members: payload.members,
        invitations: payload.invitations,
        error: null
      });
      return payload.members;
    } catch (error) {
      set({ error: silent ? null : error.message });
      throw error;
    } finally {
      if (!silent) {
        set({ loading: false });
      }
    }
  },
  fetchPendingInvitations: async ({ silent = false } = {}) => {
    if (!silent) {
      set({ loading: true, error: null });
    }

    try {
      const payload = await apiRequest("/api/workspaces/invitations");
      set({
        pendingInvitations: payload.invitations,
        error: null
      });
      return payload.invitations;
    } catch (error) {
      set({ error: silent ? null : error.message });
      throw error;
    } finally {
      if (!silent) {
        set({ loading: false });
      }
    }
  },
  bootstrap: async () => {
    await Promise.all([
      get().fetchWorkspaces({ silent: true }),
      get().fetchPendingInvitations({ silent: true })
    ]);
  },
  createWorkspace: async (values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest("/api/workspaces", {
        method: "POST",
        body: JSON.stringify(values)
      });

      const nextWorkspaces = [...get().workspaces, payload.workspace];

      set({
        workspaces: nextWorkspaces,
        activeWorkspaceId: payload.workspace.id,
        activeWorkspace: payload.workspace,
        error: null
      });

      await Promise.all([
        get().fetchMembers(payload.workspace.id, { silent: true }),
        useAuthStore.getState().fetchMe({ silent: true }).catch(() => {})
      ]);

      return payload.workspace;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false, initialized: true });
    }
  },
  updateWorkspace: async (workspaceId, values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        body: JSON.stringify(values)
      });

      const nextWorkspaces = get().workspaces.map((workspace) =>
        workspace.id === workspaceId ? payload.workspace : workspace
      );
      const nextState = syncActiveWorkspace(nextWorkspaces, workspaceId);

      set({
        workspaces: nextWorkspaces,
        ...nextState,
        error: null
      });

      await useAuthStore.getState().fetchMe({ silent: true }).catch(() => {});

      return payload.workspace;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  inviteMember: async (workspaceId, values) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        body: JSON.stringify(values)
      });
      await get().fetchMembers(workspaceId, { silent: true });
      return payload.invitation;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  updateMemberRole: async (workspaceId, userId, role) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/workspaces/${workspaceId}/members/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      });
      await get().fetchMembers(workspaceId, { silent: true });
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  removeMember: async (workspaceId, userId) => {
    set({ loading: true, error: null });

    try {
      await apiRequest(`/api/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE"
      });
      await Promise.all([
        get().fetchMembers(workspaceId, { silent: true }),
        useAuthStore.getState().fetchMe({ silent: true }).catch(() => {})
      ]);
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  acceptInvitation: async (inviteId) => {
    set({ loading: true, error: null });

    try {
      const payload = await apiRequest(`/api/workspaces/invitations/${inviteId}/accept`, {
        method: "POST"
      });
      await Promise.all([
        get().fetchWorkspaces({ silent: true }),
        get().fetchPendingInvitations({ silent: true }),
        useAuthStore.getState().fetchMe({ silent: true }).catch(() => {})
      ]);
      return payload.workspace;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
