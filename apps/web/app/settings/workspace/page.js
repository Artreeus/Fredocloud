"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { CustomSelect } from "@/components/ui/select";
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
      {loading && members.length === 0 && (
        <Loader modal size="xl" />
      )}
      <section className="grid gap-8 lg:grid-cols-[1fr_480px] items-start">
        {/* Left Column: Core Settings */}
        <article className="rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
            Workspace Settings
          </p>
          <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">
            {activeWorkspace?.name || "Active workspace"}
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-400">
            Update your workspace identity. This will reflect across all team communications and dashboard views.
          </p>

          <form className="mt-10 space-y-8" onSubmit={handleWorkspaceSubmit}>
            <label className="block">
              <span className="mb-2.5 block text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace name</span>
              <input
                type="text"
                value={workspaceForm.name}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, name: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-5 py-4 text-sm font-medium dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="mb-2.5 block text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Description</span>
              <textarea
                value={workspaceForm.description}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="min-h-32 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-5 py-4 text-sm font-medium dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20 disabled:opacity-50"
              />
            </label>
            <label className="block">
              <span className="mb-2.5 block text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Accent color</span>
              <div className="flex items-center gap-6">
                <input
                  type="color"
                  value={workspaceForm.accentColor}
                  onChange={(event) =>
                    setWorkspaceForm((current) => ({ ...current, accentColor: event.target.value }))
                  }
                  disabled={!canManageWorkspace}
                  className="h-16 w-32 cursor-pointer rounded-2xl border-none bg-slate-100 dark:bg-slate-800 p-1.5 disabled:opacity-50"
                />
                <div className="space-y-1">
                  <span className="block text-sm font-mono font-bold text-slate-900 dark:text-white uppercase tracking-widest">{workspaceForm.accentColor}</span>
                  <span className="text-xs text-slate-500">Primary brand color</span>
                </div>
              </div>
            </label>
            {!canManageWorkspace ? (
              <p className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 px-5 py-4 text-sm font-semibold text-amber-700 dark:text-amber-400">
                You have read-only access to these settings.
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!canManageWorkspace || loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 dark:bg-brand-600 px-10 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:opacity-90 disabled:bg-slate-400 dark:disabled:bg-slate-800 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>
        </article>

        {/* Right Column: People & Access Management */}
        <div className="space-y-6">
          {/* Members Section */}
          <article className="rounded-[2.3rem] border border-slate-800 bg-slate-950 p-8 text-white shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-white">Members</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Manage team access and roles.
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {members.length} Active
              </span>
            </div>

            <form
              className="mt-6 flex flex-col gap-3 rounded-[1.8rem] border border-slate-800 bg-slate-900/40 p-4"
              onSubmit={handleInvite}
            >
              <input
                type="email"
                value={inviteForm.email}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, email: event.target.value }))
                }
                disabled={!canInviteMembers}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-brand-500 disabled:opacity-50"
                placeholder="teammate@fredocloud.com"
              />
              <div className="flex gap-3">
                <CustomSelect
                  value={inviteForm.role}
                  onChange={(value) => setInviteForm((current) => ({ ...current, role: value }))}
                  options={roleOptions.map(r => ({ label: r, value: r }))}
                  disabled={!canInviteMembers}
                  variant="dark"
                  className="flex-1"
                />
                <button
                  type="submit"
                  disabled={!canInviteMembers || loading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-500 disabled:bg-slate-800 active:scale-95"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                </button>
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {members.map((member) => {
                const isOwner = member.role === "OWNER";
                const canEditMember =
                  canManageMembers &&
                  !isOwner &&
                  !(activeWorkspace?.role === "ADMIN" && member.role === "ADMIN");

                return (
                  <div key={member.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/50 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-bold mt-0.5">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isOwner ? (
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-[9px] font-black tracking-widest text-slate-500 uppercase">
                          OWNER
                        </span>
                      ) : (
                        <div className="w-28">
                          <CustomSelect
                            value={member.role}
                            onChange={(value) => handleRoleChange(member.id, value)}
                            options={roleOptions.map(r => ({ label: r, value: r }))}
                            disabled={!canEditMember || loading}
                            variant="dark"
                            className="scale-90 origin-right"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={!canEditMember || member.id === user?.id || loading}
                        onClick={() => handleRemove(member.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-500/80 transition hover:text-rose-400 disabled:opacity-0 p-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Pending Section */}
          {invitations.length > 0 && (
            <article className="rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-lg">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Pending Invitations
              </h3>
              <div className="mt-4 space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 px-4 py-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-white">{invitation.email}</p>
                      <p className="mt-1 text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-500">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </article>
          )}

          {/* Permissions Section */}
          <article className="rounded-[2.3rem] border border-slate-800 bg-slate-950 p-8 text-white shadow-xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              Role Permissions
            </h3>
            <div className="mt-6 space-y-6">
              {rolePermissions.map((roleEntry) => (
                <div key={roleEntry.role} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">{roleEntry.role}</h4>
                    {!editableRoles.includes(roleEntry.role) && (
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-600">
                        Read Only
                      </span>
                    )}
                  </div>
                  <div className="grid gap-2">
                    {roleEntry.permissions.map((permissionEntry) => (
                      <label
                        key={`${roleEntry.role}-${permissionEntry.permission}`}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-3 text-[11px] transition hover:bg-white/[0.02]"
                      >
                        <span className="font-bold text-slate-400">
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
          </article>
        </div>
      </section>
    </ProtectedLayout>
  );
}
