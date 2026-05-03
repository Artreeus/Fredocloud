"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CustomSelect } from "@/components/custom-select";
import { Loader2 } from "lucide-react";

const roleOptions = ["ADMIN", "MEMBER"];
const editableRoles = ["ADMIN", "MEMBER"];

const permissionLabels = {
  CREATE_GOAL: "Create goals",
  UPDATE_GOAL: "Update goals",
  POST_ANNOUNCEMENT: "Post announcements",
  PIN_ANNOUNCEMENT: "Pin announcements",
  INVITE_MEMBER: "Invite members",
  MANAGE_MEMBERS: "Manage members",
  CREATE_ACTION_ITEM: "Create action items",
  UPDATE_ACTION_ITEM: "Update action items",
  DELETE_CONTENT: "Delete content",
  MANAGE_WORKSPACE: "Manage workspace"
};

export default function WorkspaceSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const members = useWorkspaceStore((state) => state.members);
  const invitations = useWorkspaceStore((state) => state.invitations);
  const rolePermissions = useWorkspaceStore((state) => state.rolePermissions);
  const loading = useWorkspaceStore((state) => state.loading);
  const error = useWorkspaceStore((state) => state.error);
  const clearError = useWorkspaceStore((state) => state.clearError);
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const inviteMember = useWorkspaceStore((state) => state.inviteMember);
  const updateMemberRole = useWorkspaceStore((state) => state.updateMemberRole);
  const removeMember = useWorkspaceStore((state) => state.removeMember);
  const updateRolePermissions = useWorkspaceStore((state) => state.updateRolePermissions);
  const pushToast = useToastStore((state) => state.pushToast);
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    description: "",
    accentColor: "#2745f2"
  });
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "MEMBER"
  });

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceForm({
        name: activeWorkspace.name || "",
        description: activeWorkspace.description || "",
        accentColor: activeWorkspace.accentColor || "#2745f2"
      });
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  const canManageWorkspace = hasPermission(activeWorkspace, "MANAGE_WORKSPACE");
  const canInviteMembers = hasPermission(activeWorkspace, "INVITE_MEMBER");
  const canManageMembers = hasPermission(activeWorkspace, "MANAGE_MEMBERS");

  async function handleWorkspaceSubmit(event) {
    event.preventDefault();

    await updateWorkspace(activeWorkspace.id, workspaceForm);
    pushToast({ type: "success", message: "Workspace settings updated." });
  }

  async function handleInvite(event) {
    event.preventDefault();
    await inviteMember(activeWorkspace.id, inviteForm);
    setInviteForm({
      email: "",
      role: "MEMBER"
    });
    pushToast({ type: "success", message: "Invitation created." });
  }

  async function handleRoleChange(memberId, role) {
    await updateMemberRole(activeWorkspace.id, memberId, role);
    pushToast({ type: "success", message: "Member role updated." });
  }

  async function handleRemove(memberId) {
    await removeMember(activeWorkspace.id, memberId);
    pushToast({ type: "success", message: "Member removed." });
  }

  async function handlePermissionToggle(role, permission, enabled) {
    const currentRolePermissions =
      rolePermissions.find((entry) => entry.role === role)?.permissions || [];
    const nextPermissions = enabled
      ? currentRolePermissions
          .filter((entry) => entry.enabled)
          .map((entry) => entry.permission)
          .filter((entryPermission) => entryPermission !== permission)
      : [
          ...currentRolePermissions
            .filter((entry) => entry.enabled)
            .map((entry) => entry.permission),
          permission
        ];

    await updateRolePermissions(activeWorkspace.id, role, nextPermissions);
    pushToast({ type: "success", message: `${role} permissions updated.` });
  }

  return (
    <ProtectedLayout>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
            Workspace Settings
          </p>
          <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">
            {activeWorkspace?.name || "Active workspace"}
          </h1>
          <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
            Update workspace details, choose the accent color, manage the people
            collaborating inside this space, and tune role permissions.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleWorkspaceSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Workspace name</span>
              <input
                type="text"
                value={workspaceForm.name}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, name: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</span>
              <textarea
                value={workspaceForm.description}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="min-h-28 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Accent color</span>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={workspaceForm.accentColor}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({ ...current, accentColor: event.target.value }))
                  }
                  disabled={!canManageWorkspace}
                  className="h-14 w-28 cursor-pointer rounded-2xl border-none bg-slate-100 dark:bg-slate-800 p-1 disabled:opacity-50"
                />
                <span className="text-sm font-mono text-slate-500 uppercase">{workspaceForm.accentColor}</span>
              </div>
            </label>
            {!canManageWorkspace ? (
              <p className="rounded-2xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm font-medium text-amber-700 dark:text-amber-400">
                Your current role can view workspace settings, but not edit them.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!canManageWorkspace || loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-brand-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-800 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save workspace"
              )}
            </button>
          </form>
        </article>

        <article className="rounded-[2.3rem] border border-slate-800 bg-slate-950 p-8 text-white shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-white">Members</h2>
              <p className="mt-2 text-sm text-slate-400">
                Online status is inferred from active sessions.
              </p>
            </div>
            <span className="rounded-full bg-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              {members.length} members
            </span>
          </div>

          <form
            className="mt-6 grid gap-4 rounded-[2rem] border border-slate-800 bg-slate-900/40 p-5"
            onSubmit={handleInvite}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_160px_auto]">
              <input
                type="email"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, email: event.target.value }))
                }
                disabled={!canInviteMembers}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500 disabled:opacity-50"
                placeholder="teammate@fredocloud.com"
              />
              <CustomSelect
                value={inviteForm.role}
                onChange={(value) => setInviteForm((current) => ({ ...current, role: value }))}
                options={roleOptions.map(r => ({ label: r, value: r }))}
                disabled={!canInviteMembers}
              />
              <button
                type="submit"
                disabled={!canInviteMembers || loading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-500 disabled:bg-slate-800 active:scale-95"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
              </button>
            </div>
          </form>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/60">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {members.map((member) => {
                    const isOwner = member.role === "OWNER";
                    const canEditMember =
                      canManageMembers &&
                      !isOwner &&
                      !(activeWorkspace?.role === "ADMIN" && member.role === "ADMIN");

                    return (
                      <tr key={member.id} className="transition hover:bg-white/[0.02]">
                        <td className="px-6 py-5">
                          <p className="font-bold text-white">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </td>
                        <td className="px-6 py-5">
                          {isOwner ? (
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400">
                              OWNER
                            </span>
                          ) : (
                            <div className="w-32">
                              <CustomSelect
                                value={member.role}
                                onChange={(value) => handleRoleChange(member.id, value)}
                                options={roleOptions.map(r => ({ label: r, value: r }))}
                                disabled={!canEditMember || loading}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              member.online
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-slate-800 text-slate-500"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${member.online ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
                            {member.online ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button
                            type="button"
                            disabled={!canEditMember || member.id === user?.id || loading}
                            onClick={() => handleRemove(member.id)}
                            className="text-xs font-bold uppercase tracking-wider text-rose-500 transition hover:text-rose-400 disabled:opacity-30"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Pending Invitations
            </h3>
            <div className="mt-4 space-y-3">
              {invitations.length ? (
                invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-4 text-sm"
                  >
                    <div>
                      <p className="font-bold text-white">{invitation.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {invitation.role} invite pending until{" "}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm font-medium text-slate-600 italic">No pending invitations.</p>
              )}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Role Permissions
            </h3>
            <div className="mt-5 space-y-5">
              {rolePermissions.map((roleEntry) => (
                <div key={roleEntry.role} className="rounded-[2.3rem] border border-slate-800 bg-slate-900/30 p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-display text-white">{roleEntry.role}</h4>
                      <p className="mt-1 text-xs text-slate-400">
                        Fine-grained capabilities for this role.
                      </p>
                    </div>
                    {!editableRoles.includes(roleEntry.role) ? (
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Fixed
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {roleEntry.permissions.map((permissionEntry) => (
                      <label
                        key={`${roleEntry.role}-${permissionEntry.permission}`}
                        className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3.5 text-xs transition hover:bg-white/[0.02]"
                      >
                        <span className="font-medium text-slate-300">
                          {permissionLabels[permissionEntry.permission] || permissionEntry.permission}
                        </span>
                        <input
                          type="checkbox"
                          checked={permissionEntry.enabled}
                          disabled={!canManageMembers || !editableRoles.includes(roleEntry.role) || loading}
                          onChange={() =>
                            handlePermissionToggle(
                              roleEntry.role,
                              permissionEntry.permission,
                              permissionEntry.enabled
                            )
                          }
                          className="h-4 w-4 rounded border-slate-800 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-950"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </ProtectedLayout>
  );
}
