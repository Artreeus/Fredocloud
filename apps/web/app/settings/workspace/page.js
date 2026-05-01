"use client";

import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { ProtectedLayout } from "@/components/protected-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

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
  const updateWorkspace = useWorkspaceStore((state) => state.updateWorkspace);
  const inviteMember = useWorkspaceStore((state) => state.inviteMember);
  const updateMemberRole = useWorkspaceStore((state) => state.updateMemberRole);
  const removeMember = useWorkspaceStore((state) => state.removeMember);
  const updateRolePermissions = useWorkspaceStore((state) => state.updateRolePermissions);
  const [success, setSuccess] = useState("");
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

  const canManageWorkspace = hasPermission(activeWorkspace, "MANAGE_WORKSPACE");
  const canInviteMembers = hasPermission(activeWorkspace, "INVITE_MEMBER");
  const canManageMembers = hasPermission(activeWorkspace, "MANAGE_MEMBERS");

  async function handleWorkspaceSubmit(event) {
    event.preventDefault();
    setSuccess("");

    await updateWorkspace(activeWorkspace.id, workspaceForm);
    setSuccess("Workspace settings updated.");
  }

  async function handleInvite(event) {
    event.preventDefault();
    setSuccess("");

    await inviteMember(activeWorkspace.id, inviteForm);
    setInviteForm({
      email: "",
      role: "MEMBER"
    });
    setSuccess("Invitation created.");
  }

  async function handleRoleChange(memberId, role) {
    setSuccess("");
    await updateMemberRole(activeWorkspace.id, memberId, role);
    setSuccess("Member role updated.");
  }

  async function handleRemove(memberId) {
    setSuccess("");
    await removeMember(activeWorkspace.id, memberId);
    setSuccess("Member removed.");
  }

  async function handlePermissionToggle(role, permission, enabled) {
    setSuccess("");
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
    setSuccess(`${role} permissions updated.`);
  }

  return (
    <ProtectedLayout>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
            Workspace Settings
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {activeWorkspace?.name || "Active workspace"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Update workspace details, choose the accent color, manage the people
            collaborating inside this space, and tune role permissions.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleWorkspaceSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Workspace name</span>
              <input
                type="text"
                value={workspaceForm.name}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, name: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
              <textarea
                value={workspaceForm.description}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Accent color</span>
              <input
                type="color"
                value={workspaceForm.accentColor}
                onChange={(event) =>
                  setWorkspaceForm((current) => ({ ...current, accentColor: event.target.value }))
                }
                disabled={!canManageWorkspace}
                className="h-12 w-28 rounded-xl border border-slate-200 bg-white p-2 disabled:bg-slate-100"
              />
            </label>
            {!canManageWorkspace ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Your current role can view workspace settings, but not edit them.
              </p>
            ) : null}
            {error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
            ) : null}
            {success ? (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!canManageWorkspace || loading}
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Saving..." : "Save workspace"}
            </button>
          </form>
        </article>

        <article className="rounded-[2rem] bg-white p-8 shadow-soft ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Members</h2>
              <p className="mt-2 text-sm text-slate-500">
                Online status is inferred from active authenticated sessions.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              {members.length} members
            </span>
          </div>

          <form
            className="mt-6 grid gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-5"
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
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100"
                placeholder="teammate@fredocloud.com"
              />
              <select
                value={inviteForm.role}
                onChange={(event) =>
                  setInviteForm((current) => ({ ...current, role: event.target.value }))
                }
                disabled={!canInviteMembers}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none disabled:bg-slate-100"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!canInviteMembers || loading}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
              >
                Invite
              </button>
            </div>
          </form>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {members.map((member) => {
                  const isOwner = member.role === "OWNER";
                  const canEditMember =
                    canManageMembers &&
                    !isOwner &&
                    !(activeWorkspace?.role === "ADMIN" && member.role === "ADMIN");

                  return (
                    <tr key={member.id}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-slate-500">{member.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        {isOwner ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            OWNER
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            disabled={!canEditMember || loading}
                            onChange={(event) => handleRoleChange(member.id, event.target.value)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                          >
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            member.online
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {member.online ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          disabled={!canEditMember || member.id === user?.id || loading}
                          onClick={() => handleRemove(member.id)}
                          className="rounded-full bg-rose-50 px-4 py-2 text-xs font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Pending Invitations
            </h3>
            <div className="mt-4 space-y-3">
              {invitations.length ? (
                invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{invitation.email}</p>
                      <p className="text-slate-500">
                        {invitation.role} invite pending until{" "}
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      Pending
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No pending invitations.</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Role Permissions
            </h3>
            <div className="mt-4 space-y-4">
              {rolePermissions.map((roleEntry) => (
                <div key={roleEntry.role} className="rounded-[2rem] border border-slate-200 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-950">{roleEntry.role}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Fine-grained workspace capabilities for this role.
                      </p>
                    </div>
                    {!editableRoles.includes(roleEntry.role) ? (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        Fixed
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {roleEntry.permissions.map((permissionEntry) => (
                      <label
                        key={`${roleEntry.role}-${permissionEntry.permission}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                      >
                        <span className="text-slate-700">
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
