const express = require("express");
const {
  acceptInvitation,
  createWorkspace,
  deleteWorkspace,
  inviteWorkspaceMember,
  listMyInvitations,
  listWorkspaceMembers,
  listWorkspaces,
  removeWorkspaceMember,
  updateWorkspace,
  updateWorkspaceMemberRole
} = require("../controllers/workspace.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const workspaceRouter = express.Router();

workspaceRouter.use(requireAuth);

workspaceRouter.get("/", listWorkspaces);
workspaceRouter.post("/", createWorkspace);
workspaceRouter.get("/invitations", listMyInvitations);
workspaceRouter.post("/invitations/:inviteId/accept", acceptInvitation);
workspaceRouter.patch("/:id", updateWorkspace);
workspaceRouter.delete("/:id", deleteWorkspace);
workspaceRouter.post("/:id/invite", inviteWorkspaceMember);
workspaceRouter.get("/:id/members", listWorkspaceMembers);
workspaceRouter.patch("/:id/members/:userId/role", updateWorkspaceMemberRole);
workspaceRouter.delete("/:id/members/:userId", removeWorkspaceMember);

module.exports = { workspaceRouter };
