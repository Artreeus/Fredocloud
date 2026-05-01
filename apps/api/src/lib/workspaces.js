const { WorkspaceRole } = require("../../generated/prisma");
const { prisma } = require("./prisma");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getWorkspaceMembershipOrThrow(workspaceId, userId) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    },
    include: {
      workspace: true
    }
  });

  if (!membership) {
    throw createError("Workspace not found", 404);
  }

  return membership;
}

function canManageWorkspace(membership) {
  return [WorkspaceRole.OWNER, WorkspaceRole.ADMIN].includes(membership.role);
}

module.exports = {
  canManageWorkspace,
  createError,
  getWorkspaceMembershipOrThrow
};
