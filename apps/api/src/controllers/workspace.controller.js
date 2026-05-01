const crypto = require("crypto");
const { AuditAction, InvitationStatus, NotificationType, WorkspaceRole } = require("../../generated/prisma");
const { slugify } = require("@repo/utils");
const { prisma } = require("../lib/prisma");
const { canManageWorkspace, createError, getWorkspaceMembershipOrThrow } = require("../lib/workspaces");

function validateAccentColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function buildWorkspaceSlug(name) {
  return `${slugify(name) || "workspace"}-${Math.random().toString(36).slice(2, 8)}`;
}

function isOnline(user) {
  return Boolean(
    user.currentRefreshTokenHash &&
      user.refreshTokenExpiresAt &&
      new Date(user.refreshTokenExpiresAt) > new Date()
  );
}

function serializeWorkspaceMember(membership) {
  return {
    id: membership.user.id,
    membershipId: membership.id,
    name: membership.user.name,
    email: membership.user.email,
    avatarUrl: membership.user.avatarUrl,
    role: membership.role,
    joinedAt: membership.joinedAt,
    online: isOnline(membership.user)
  };
}

function serializeWorkspace(workspace, membership) {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description,
    accentColor: workspace.accentColor,
    ownerId: workspace.ownerId,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
    role: membership?.role,
    memberCount: workspace._count?.members ?? workspace.members?.length ?? 0
  };
}

function canManageRoles(membership) {
  return canManageWorkspace(membership);
}

async function listWorkspaces(req, res, next) {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.user.id },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return res.status(200).json({
      workspaces: memberships.map((membership) =>
        serializeWorkspace(membership.workspace, membership)
      )
    });
  } catch (error) {
    return next(error);
  }
}

async function createWorkspace(req, res, next) {
  try {
    const { name, description, accentColor } = req.body;

    if (!name) {
      throw createError("Workspace name is required", 400);
    }

    if (accentColor && !validateAccentColor(accentColor)) {
      throw createError("Accent color must be a valid hex color", 400);
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: {
          name,
          description,
          accentColor: accentColor || "#2745f2",
          slug: buildWorkspaceSlug(name),
          ownerId: req.user.id
        }
      });

      const membership = await tx.workspaceMember.create({
        data: {
          userId: req.user.id,
          workspaceId: createdWorkspace.id,
          role: WorkspaceRole.OWNER
        }
      });

      await tx.auditLog.create({
        data: {
          workspaceId: createdWorkspace.id,
          actorId: req.user.id,
          action: AuditAction.WORKSPACE_CREATED,
          entityType: "Workspace",
          entityId: createdWorkspace.id
        }
      });

      return {
        ...createdWorkspace,
        _count: { members: 1 },
        membership
      };
    });

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace: serializeWorkspace(workspace, workspace.membership)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateWorkspace(req, res, next) {
  try {
    const membership = await getWorkspaceMembershipOrThrow(req.params.id, req.user.id);

    if (!canManageWorkspace(membership)) {
      throw createError("Only workspace admins can update workspace settings", 403);
    }

    const { name, description, accentColor } = req.body;

    if (accentColor && !validateAccentColor(accentColor)) {
      throw createError("Accent color must be a valid hex color", 400);
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(accentColor ? { accentColor } : {})
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    return res.status(200).json({
      message: "Workspace updated successfully",
      workspace: serializeWorkspace(updatedWorkspace, membership)
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteWorkspace(req, res, next) {
  try {
    const membership = await getWorkspaceMembershipOrThrow(req.params.id, req.user.id);

    if (membership.role !== WorkspaceRole.OWNER) {
      throw createError("Only the workspace owner can delete this workspace", 403);
    }

    await prisma.workspace.delete({
      where: { id: req.params.id }
    });

    return res.status(200).json({
      message: "Workspace deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
}

async function inviteWorkspaceMember(req, res, next) {
  try {
    const membership = await getWorkspaceMembershipOrThrow(req.params.id, req.user.id);

    if (!canManageWorkspace(membership)) {
      throw createError("Only workspace admins can invite members", 403);
    }

    const { email, role } = req.body;
    const normalizedEmail = email?.toLowerCase();

    if (!normalizedEmail || !role) {
      throw createError("Email and role are required", 400);
    }

    if (![WorkspaceRole.ADMIN, WorkspaceRole.MEMBER].includes(role)) {
      throw createError("Invite role must be Admin or Member", 400);
    }

    const existingMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: req.params.id,
        user: {
          email: normalizedEmail
        }
      }
    });

    if (existingMember) {
      throw createError("That user is already a member of this workspace", 409);
    }

    const pendingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId: req.params.id,
        email: normalizedEmail,
        status: InvitationStatus.PENDING
      }
    });

    if (pendingInvite) {
      throw createError("A pending invitation already exists for that email", 409);
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: req.params.id,
        invitedById: req.user.id,
        email: normalizedEmail,
        role,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      include: {
        workspace: true
      }
    });

    if (invitedUser) {
      await prisma.notification.create({
        data: {
          userId: invitedUser.id,
          workspaceId: invite.workspaceId,
          type: NotificationType.WORKSPACE_INVITE,
          title: `Invitation to ${invite.workspace.name}`,
          message: `${req.user.name} invited you to join ${invite.workspace.name} as ${role.toLowerCase()}.`,
          entityId: invite.id
        }
      });
    }

    return res.status(201).json({
      message: "Invitation created successfully",
      invitation: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        workspaceId: invite.workspaceId,
        workspaceName: invite.workspace.name,
        token: invite.token
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function listWorkspaceMembers(req, res, next) {
  try {
    await getWorkspaceMembershipOrThrow(req.params.id, req.user.id);

    const [members, invites] = await Promise.all([
      prisma.workspaceMember.findMany({
        where: { workspaceId: req.params.id },
        include: {
          user: true
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }]
      }),
      prisma.workspaceInvite.findMany({
        where: {
          workspaceId: req.params.id,
          status: InvitationStatus.PENDING
        },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return res.status(200).json({
      members: members.map(serializeWorkspaceMember),
      invitations: invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function updateWorkspaceMemberRole(req, res, next) {
  try {
    const membership = await getWorkspaceMembershipOrThrow(req.params.id, req.user.id);

    if (!canManageRoles(membership)) {
      throw createError("Only workspace admins can change roles", 403);
    }

    const { role } = req.body;

    if (![WorkspaceRole.ADMIN, WorkspaceRole.MEMBER].includes(role)) {
      throw createError("Role must be Admin or Member", 400);
    }

    if (req.params.userId === membership.workspace.ownerId) {
      throw createError("The workspace owner role cannot be changed", 400);
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.params.userId,
          workspaceId: req.params.id
        }
      }
    });

    if (!targetMembership) {
      throw createError("Workspace member not found", 404);
    }

    if (membership.role === WorkspaceRole.ADMIN && targetMembership.role === WorkspaceRole.ADMIN) {
      throw createError("Admins cannot change another admin's role", 403);
    }

    const updatedMembership = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId: req.params.userId,
          workspaceId: req.params.id
        }
      },
      data: { role },
      include: { user: true }
    });

    return res.status(200).json({
      message: "Member role updated successfully",
      member: serializeWorkspaceMember(updatedMembership)
    });
  } catch (error) {
    return next(error);
  }
}

async function removeWorkspaceMember(req, res, next) {
  try {
    const membership = await getWorkspaceMembershipOrThrow(req.params.id, req.user.id);

    if (!canManageWorkspace(membership)) {
      throw createError("Only workspace admins can remove members", 403);
    }

    if (req.params.userId === membership.workspace.ownerId) {
      throw createError("The workspace owner cannot be removed", 400);
    }

    const targetMembership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.params.userId,
          workspaceId: req.params.id
        }
      }
    });

    if (!targetMembership) {
      throw createError("Workspace member not found", 404);
    }

    if (membership.role === WorkspaceRole.ADMIN && targetMembership.role === WorkspaceRole.ADMIN) {
      throw createError("Admins cannot remove another admin", 403);
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId: req.params.userId,
          workspaceId: req.params.id
        }
      }
    });

    return res.status(200).json({
      message: "Member removed successfully"
    });
  } catch (error) {
    return next(error);
  }
}

async function listMyInvitations(req, res, next) {
  try {
    const invitations = await prisma.workspaceInvite.findMany({
      where: {
        email: req.user.email.toLowerCase(),
        status: InvitationStatus.PENDING
      },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json({
      invitations: invitations.map((invite) => ({
        id: invite.id,
        workspaceId: invite.workspaceId,
        workspaceName: invite.workspace.name,
        workspaceAccentColor: invite.workspace.accentColor,
        workspaceDescription: invite.workspace.description,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        invitedBy: invite.invitedBy
      }))
    });
  } catch (error) {
    return next(error);
  }
}

async function acceptInvitation(req, res, next) {
  try {
    const invite = await prisma.workspaceInvite.findUnique({
      where: { id: req.params.inviteId },
      include: { workspace: true }
    });

    if (!invite || invite.status !== InvitationStatus.PENDING) {
      throw createError("Invitation not found", 404);
    }

    if (invite.email !== req.user.email.toLowerCase()) {
      throw createError("This invitation does not belong to the current user", 403);
    }

    if (invite.expiresAt < new Date()) {
      await prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { status: InvitationStatus.EXPIRED }
      });
      throw createError("Invitation has expired", 400);
    }

    const membership = await prisma.$transaction(async (tx) => {
      const existingMembership = await tx.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.id,
            workspaceId: invite.workspaceId
          }
        }
      });

      if (existingMembership) {
        await tx.workspaceInvite.update({
          where: { id: invite.id },
          data: {
            status: InvitationStatus.ACCEPTED,
            acceptedAt: new Date()
          }
        });

        return existingMembership;
      }

      const createdMembership = await tx.workspaceMember.create({
        data: {
          userId: req.user.id,
          workspaceId: invite.workspaceId,
          role: invite.role
        }
      });

      await tx.workspaceInvite.update({
        where: { id: invite.id },
        data: {
          status: InvitationStatus.ACCEPTED,
          acceptedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          workspaceId: invite.workspaceId,
          actorId: req.user.id,
          action: AuditAction.MEMBER_ADDED,
          entityType: "WorkspaceMember",
          entityId: createdMembership.id,
          metadata: {
            source: "invitation_acceptance"
          }
        }
      });

      return createdMembership;
    });

    return res.status(200).json({
      message: "Invitation accepted successfully",
      workspace: serializeWorkspace(invite.workspace, membership)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
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
};
