const { AuditAction, NotificationType, Permission, ReactionType } = require("../../generated/prisma");
const { assertWorkspacePermission } = require("../lib/permissions");
const { createError, getWorkspaceMembershipOrThrow } = require("../lib/workspaces");
const { prisma } = require("../lib/prisma");
const { emitWorkspaceEvent } = require("../lib/socket");

const reactionLabels = {
  LIKE: { emoji: "👍", label: "Like" },
  CELEBRATE: { emoji: "🎉", label: "Celebrate" },
  SUPPORT: { emoji: "❤️", label: "Support" },
  INSIGHTFUL: { emoji: "💡", label: "Insightful" }
};

function serializeReactionSummary(reactions, currentUserId) {
  const grouped = Object.keys(reactionLabels).map((type) => {
    const typeReactions = reactions.filter((reaction) => reaction.type === type);

    return {
      type,
      emoji: reactionLabels[type].emoji,
      label: reactionLabels[type].label,
      count: typeReactions.length,
      reacted: typeReactions.some((reaction) => reaction.userId === currentUserId)
    };
  });

  return grouped.filter((entry) => entry.count > 0 || entry.reacted);
}

function serializeComment(comment) {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
    replies: (comment.replies || []).map(serializeComment)
  };
}

function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];

  comments.forEach((comment) => {
    map.set(comment.id, {
      ...comment,
      replies: []
    });
  });

  comments.forEach((comment) => {
    const nextComment = map.get(comment.id);

    if (comment.parentCommentId) {
      const parent = map.get(comment.parentCommentId);

      if (parent) {
        parent.replies.push(nextComment);
      }
    } else {
      roots.push(nextComment);
    }
  });

  return roots.map(serializeComment);
}

function serializeAnnouncement(announcement, currentUserId) {
  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    pinned: announcement.pinned,
    publishedAt: announcement.publishedAt,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
    workspaceId: announcement.workspaceId,
    author: announcement.author,
    reactionSummary: serializeReactionSummary(announcement.reactions || [], currentUserId),
    commentCount: announcement._count?.comments ?? announcement.comments?.length ?? 0
  };
}

async function getAnnouncementOrThrow(announcementId, userId) {
  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
    include: {
      workspace: true,
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      reactions: true,
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        }
      }
    }
  });

  if (!announcement) {
    throw createError("Announcement not found", 404);
  }

  const membership = await getWorkspaceMembershipOrThrow(announcement.workspaceId, userId);

  return {
    announcement,
    membership
  };
}

async function createAnnouncement(req, res, next) {
  try {
    const { workspaceId, title, body } = req.body;

    if (!workspaceId || !title || !body) {
      throw createError("workspaceId, title, and body are required", 400);
    }

    await assertWorkspacePermission(workspaceId, req.user.id, Permission.POST_ANNOUNCEMENT);

    const announcement = await prisma.announcement.create({
      data: {
        workspaceId,
        authorId: req.user.id,
        title,
        body,
        publishedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        reactions: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      select: { userId: true }
    });

    await prisma.notification.createMany({
      data: members
        .filter((member) => member.userId !== req.user.id)
        .map((member) => ({
          userId: member.userId,
          workspaceId,
          type: NotificationType.ANNOUNCEMENT_POSTED,
          title,
          message: `${req.user.name} published a new announcement.`,
          entityId: announcement.id
        }))
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: req.user.id,
        action: AuditAction.ANNOUNCEMENT_CREATED,
        entityType: "Announcement",
        entityId: announcement.id
      }
    });

    const serializedAnnouncement = serializeAnnouncement(announcement, req.user.id);

    emitWorkspaceEvent(workspaceId, "announcement:new", {
      announcement: serializedAnnouncement
    });

    return res.status(201).json({
      message: "Announcement created successfully",
      announcement: serializedAnnouncement
    });
  } catch (error) {
    return next(error);
  }
}

async function listAnnouncements(req, res, next) {
  try {
    const { workspaceId, page = 1, pageSize = 10 } = req.query;

    if (!workspaceId) {
      throw createError("workspaceId is required", 400);
    }

    await getWorkspaceMembershipOrThrow(workspaceId, req.user.id);

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(20, Math.max(1, Number(pageSize) || 10));

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where: { workspaceId },
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          },
          reactions: true,
          _count: {
            select: { comments: true }
          }
        },
        orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (safePage - 1) * safePageSize,
        take: safePageSize
      }),
      prisma.announcement.count({
        where: { workspaceId }
      })
    ]);

    return res.status(200).json({
      announcements: announcements.map((announcement) =>
        serializeAnnouncement(announcement, req.user.id)
      ),
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        total,
        totalPages: Math.ceil(total / safePageSize)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getAnnouncement(req, res, next) {
  try {
    const { announcement } = await getAnnouncementOrThrow(req.params.id, req.user.id);

    return res.status(200).json({
      announcement: {
        ...serializeAnnouncement(announcement, req.user.id),
        comments: buildCommentTree(announcement.comments || [])
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function pinAnnouncement(req, res, next) {
  try {
    const { announcement } = await getAnnouncementOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(announcement.workspaceId, req.user.id, Permission.PIN_ANNOUNCEMENT);

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcement.id },
      data: {
        pinned: req.body.pinned !== undefined ? Boolean(req.body.pinned) : !announcement.pinned
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        reactions: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    return res.status(200).json({
      message: "Announcement updated successfully",
      announcement: serializeAnnouncement(updatedAnnouncement, req.user.id)
    });
  } catch (error) {
    return next(error);
  }
}

async function toggleReaction(req, res, next) {
  try {
    const { announcement } = await getAnnouncementOrThrow(req.params.id, req.user.id);
    const { type } = req.body;

    if (!type || !ReactionType[type]) {
      throw createError("A valid reaction type is required", 400);
    }

    const existingReaction = await prisma.reaction.findFirst({
      where: {
        announcementId: announcement.id,
        userId: req.user.id
      }
    });

    if (existingReaction && existingReaction.type === type) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      });
    } else if (existingReaction) {
      await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type }
      });
    } else {
      await prisma.reaction.create({
        data: {
          workspaceId: announcement.workspaceId,
          userId: req.user.id,
          announcementId: announcement.id,
          type
        }
      });
    }

    const refreshed = await prisma.announcement.findUnique({
      where: { id: announcement.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        reactions: true,
        _count: {
          select: { comments: true }
        }
      }
    });

    const serializedAnnouncement = serializeAnnouncement(refreshed, req.user.id);

    emitWorkspaceEvent(announcement.workspaceId, "reaction:update", {
      announcement: serializedAnnouncement
    });

    return res.status(200).json({
      message: "Reaction updated successfully",
      announcement: serializedAnnouncement
    });
  } catch (error) {
    return next(error);
  }
}

async function createComment(req, res, next) {
  try {
    const { announcement } = await getAnnouncementOrThrow(req.params.id, req.user.id);
    const { body, parentCommentId } = req.body;

    if (!body) {
      throw createError("Comment body is required", 400);
    }

    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId }
      });

      if (!parentComment || parentComment.announcementId !== announcement.id) {
        throw createError("Parent comment not found for this announcement", 404);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        workspaceId: announcement.workspaceId,
        authorId: req.user.id,
        announcementId: announcement.id,
        parentCommentId: parentCommentId || null,
        body
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    const serializedComment = {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author,
      replies: []
    };

    emitWorkspaceEvent(announcement.workspaceId, "comment:new", {
      announcementId: announcement.id,
      comment: serializedComment,
      parentCommentId: parentCommentId || null
    });

    return res.status(201).json({
      message: "Comment posted successfully",
      comment: serializedComment
    });
  } catch (error) {
    return next(error);
  }
}

async function listComments(req, res, next) {
  try {
    const { announcement } = await getAnnouncementOrThrow(req.params.id, req.user.id);

    const comments = await prisma.comment.findMany({
      where: {
        announcementId: announcement.id
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return res.status(200).json({
      comments: buildCommentTree(comments)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAnnouncement,
  createComment,
  getAnnouncement,
  listAnnouncements,
  listComments,
  pinAnnouncement,
  toggleReaction
};
