const { Permission, WorkspaceRole } = require("../../generated/prisma");
const { prisma } = require("./prisma");
const { createError, getWorkspaceMembershipOrThrow } = require("./workspaces");

const allPermissions = Object.values(Permission);

const defaultRolePermissions = {
  [WorkspaceRole.OWNER]: allPermissions,
  [WorkspaceRole.ADMIN]: allPermissions,
  [WorkspaceRole.MEMBER]: [
    Permission.CREATE_GOAL,
    Permission.UPDATE_GOAL,
    Permission.CREATE_ACTION_ITEM,
    Permission.UPDATE_ACTION_ITEM
  ]
};

function buildRolePermissionMatrix(rolePermissions) {
  return Object.values(WorkspaceRole).map((role) => ({
    role,
    permissions: allPermissions.map((permission) => ({
      permission,
      enabled: rolePermissions.some(
        (entry) => entry.role === role && entry.permission === permission && entry.enabled
      )
    }))
  }));
}

function getPermissionsForRole(rolePermissions, role) {
  return rolePermissions
    .filter((entry) => entry.role === role && entry.enabled)
    .map((entry) => entry.permission);
}

async function syncWorkspaceRolePermissions(db, workspaceId) {
  const createPayload = [];

  Object.entries(defaultRolePermissions).forEach(([role, permissions]) => {
    permissions.forEach((permission) => {
      createPayload.push({
        workspaceId,
        role,
        permission,
        enabled: true
      });
    });
  });

  if (!createPayload.length) {
    return;
  }

  await db.workspaceRolePermission.createMany({
    data: createPayload,
    skipDuplicates: true
  });
}

async function getWorkspacePermissionsOrThrow(workspaceId, userId) {
  await getWorkspaceMembershipOrThrow(workspaceId, userId);
  const rolePermissions = await prisma.workspaceRolePermission.findMany({
    where: { workspaceId },
    orderBy: [{ role: "asc" }, { permission: "asc" }]
  });

  return buildRolePermissionMatrix(rolePermissions);
}

async function getWorkspaceMembershipWithPermissionsOrThrow(workspaceId, userId) {
  await syncWorkspaceRolePermissions(prisma, workspaceId);

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    },
    include: {
      workspace: {
        include: {
          rolePermissions: true
        }
      }
    }
  });

  if (!membership) {
    throw createError("Workspace not found", 404);
  }

  return membership;
}

function hasWorkspacePermission(membership, permission) {
  const enabledPermissions = getPermissionsForRole(
    membership.workspace?.rolePermissions || [],
    membership.role
  );

  return enabledPermissions.includes(permission);
}

async function assertWorkspacePermission(workspaceId, userId, permission) {
  const membership = await getWorkspaceMembershipWithPermissionsOrThrow(workspaceId, userId);

  if (!hasWorkspacePermission(membership, permission)) {
    throw createError(`You do not have permission to ${permission.toLowerCase().replaceAll("_", " ")}`, 403);
  }

  return membership;
}

module.exports = {
  allPermissions,
  assertWorkspacePermission,
  buildRolePermissionMatrix,
  defaultRolePermissions,
  getPermissionsForRole,
  getWorkspaceMembershipWithPermissionsOrThrow,
  getWorkspacePermissionsOrThrow,
  hasWorkspacePermission,
  syncWorkspaceRolePermissions
};
