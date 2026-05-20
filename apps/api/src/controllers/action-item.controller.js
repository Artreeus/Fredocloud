const { ActionItemStatus, AuditAction, NotificationType, Permission } = require("../../generated/prisma");
const { assertWorkspacePermission } = require("../lib/permissions");
const { prisma } = require("../lib/prisma");
const { triggerWorkspaceEvent } = require("../lib/pusher");
const { createError, getWorkspaceMembershipOrThrow } = require("../lib/workspaces");
const { createNotificationAndEmit } = require("./notification.controller");

function normalizeStatus(status) {
  if (!status) {
    return undefined;
  }

  if (status === "TO_DO") {
    return ActionItemStatus.OPEN;
  }

  return ActionItemStatus[status] ? status : undefined;
}

function serializeActionItem(actionItem) {
  return {
    id: actionItem.id,
    title: actionItem.title,
    description: actionItem.description,
    status: actionItem.status,
    priority: actionItem.priority,
    dueDate: actionItem.dueDate,
    completedAt: actionItem.completedAt,
    createdAt: actionItem.createdAt,
    updatedAt: actionItem.updatedAt,
    workspaceId: actionItem.workspaceId,
    assignee: actionItem.assignee
      ? {
          id: actionItem.assignee.id,
          name: actionItem.assignee.name,
          email: actionItem.assignee.email,
          avatarUrl: actionItem.assignee.avatarUrl
        }
      : null,
    createdBy: actionItem.createdBy
      ? {
          id: actionItem.createdBy.id,
          name: actionItem.createdBy.name,
          email: actionItem.createdBy.email,
          avatarUrl: actionItem.createdBy.avatarUrl
        }
      : null,
    goal: actionItem.goal
      ? {
          id: actionItem.goal.id,
          title: actionItem.goal.title
        }
      : null
  };
}

async function getActionItemOrThrow(actionItemId, userId) {
  const actionItem = await prisma.actionItem.findUnique({
    where: { id: actionItemId },
    include: {
      workspace: true,
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      goal: {
        select: { id: true, title: true }
      }
    }
  });

  if (!actionItem) {
    throw createError("Action item not found", 404);
  }

  await getWorkspaceMembershipOrThrow(actionItem.workspaceId, userId);
  return actionItem;
}

async function validateGoalAccess(workspaceId, goalId, userId) {
  if (!goalId) {
    return null;
  }

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: {
      id: true,
      workspaceId: true,
      title: true
    }
  });

  if (!goal || goal.workspaceId !== workspaceId) {
    throw createError("Goal not found in this workspace", 404);
  }

  await getWorkspaceMembershipOrThrow(workspaceId, userId);
  return goal;
}

function buildOrderBy(sortBy, sortOrder) {
  const direction = sortOrder === "desc" ? "desc" : "asc";

  if (sortBy === "priority") {
    return [{ priority: direction }, { dueDate: "asc" }, { createdAt: "desc" }];
  }

  if (sortBy === "status") {
    return [{ status: direction }, { dueDate: "asc" }, { createdAt: "desc" }];
  }

  if (sortBy === "title") {
    return [{ title: direction }, { dueDate: "asc" }, { createdAt: "desc" }];
  }

  if (sortBy === "createdAt") {
    return [{ createdAt: direction }];
  }

  return [{ dueDate: direction }, { createdAt: "desc" }];
}

async function listActionItems(req, res, next) {
  try {
    const {
      workspaceId,
      assigneeId,
      priority,
      status,
      goalId,
      search,
      overdue,
      sortBy = "dueDate",
      sortOrder = "asc"
    } = req.query;

    if (!workspaceId) {
      throw createError("workspaceId is required", 400);
    }

    await getWorkspaceMembershipOrThrow(workspaceId, req.user.id);

    const normalizedStatus = normalizeStatus(status);

    const actionItems = await prisma.actionItem.findMany({
      where: {
        workspaceId,
        ...(assigneeId ? { assigneeId } : {}),
        ...(priority ? { priority } : {}),
        ...(normalizedStatus ? { status: normalizedStatus } : {}),
        ...(goalId ? { goalId } : {}),
        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive"
              }
            }
          : {}),
        ...(overdue === "true"
          ? {
              dueDate: {
                lt: new Date()
              },
              status: {
                not: ActionItemStatus.DONE
              }
            }
          : {})
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        goal: {
          select: { id: true, title: true }
        }
      },
      orderBy: buildOrderBy(sortBy, sortOrder)
    });

    return res.status(200).json({
      actionItems: actionItems.map(serializeActionItem)
    });
  } catch (error) {
    return next(error);
  }
}

async function createActionItem(req, res, next) {
  try {
    const { workspaceId, title, description, assigneeId, priority, dueDate, goalId, status } =
      req.body;

    if (!workspaceId || !title) {
      throw createError("workspaceId and title are required", 400);
    }

    await assertWorkspacePermission(workspaceId, req.user.id, Permission.CREATE_ACTION_ITEM);
    const goal = await validateGoalAccess(workspaceId, goalId, req.user.id);
    const normalizedStatus = normalizeStatus(status) || ActionItemStatus.OPEN;

    const actionItem = await prisma.actionItem.create({
      data: {
        workspaceId,
        createdById: req.user.id,
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        goalId: goal?.id || null,
        status: normalizedStatus,
        completedAt: normalizedStatus === ActionItemStatus.DONE ? new Date() : null
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        goal: {
          select: { id: true, title: true }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: req.user.id,
        action: AuditAction.ACTION_ITEM_CREATED,
        entityType: "ActionItem",
        entityId: actionItem.id
      }
    });

    if (assigneeId && assigneeId !== req.user.id) {
      await createNotificationAndEmit({
        userId: assigneeId,
        workspaceId,
        type: NotificationType.ACTION_ITEM_ASSIGNED,
        title: actionItem.title,
        message: `${req.user.name} assigned you an action item.`,
        entityId: actionItem.id
      });
    }

    const serializedActionItem = serializeActionItem(actionItem);

    triggerWorkspaceEvent(workspaceId, "action-item:update", {
      actionItem: serializedActionItem
    });

    return res.status(201).json({
      message: "Action item created successfully",
      actionItem: serializedActionItem
    });
  } catch (error) {
    return next(error);
  }
}

async function updateActionItem(req, res, next) {
  try {
    const existingActionItem = await getActionItemOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(
      existingActionItem.workspaceId,
      req.user.id,
      Permission.UPDATE_ACTION_ITEM
    );
    const { title, description, assigneeId, priority, dueDate, goalId, status } = req.body;
    const normalizedStatus = status !== undefined ? normalizeStatus(status) : undefined;

    if (status !== undefined && !normalizedStatus) {
      throw createError("A valid action item status is required", 400);
    }

    await validateGoalAccess(existingActionItem.workspaceId, goalId, req.user.id);

    const actionItem = await prisma.actionItem.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId || null } : {}),
        ...(priority ? { priority } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(goalId !== undefined ? { goalId: goalId || null } : {}),
        ...(normalizedStatus
          ? {
              status: normalizedStatus,
              completedAt: normalizedStatus === ActionItemStatus.DONE ? new Date() : null
            }
          : {})
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        goal: {
          select: { id: true, title: true }
        }
      }
    });

    const serializedActionItem = serializeActionItem(actionItem);

    triggerWorkspaceEvent(existingActionItem.workspaceId, "action-item:update", {
      actionItem: serializedActionItem
    });

    return res.status(200).json({
      message: "Action item updated successfully",
      actionItem: serializedActionItem
    });
  } catch (error) {
    return next(error);
  }
}

async function updateActionItemStatus(req, res, next) {
  try {
    const existingActionItem = await getActionItemOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(
      existingActionItem.workspaceId,
      req.user.id,
      Permission.UPDATE_ACTION_ITEM
    );
    const normalizedStatus = normalizeStatus(req.body.status);

    if (!normalizedStatus) {
      throw createError("A valid action item status is required", 400);
    }

    const actionItem = await prisma.actionItem.update({
      where: { id: existingActionItem.id },
      data: {
        status: normalizedStatus,
        completedAt: normalizedStatus === ActionItemStatus.DONE ? new Date() : null
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        goal: {
          select: { id: true, title: true }
        }
      }
    });

    const serializedActionItem = serializeActionItem(actionItem);

    triggerWorkspaceEvent(existingActionItem.workspaceId, "action-item:update", {
      actionItem: serializedActionItem
    });

    return res.status(200).json({
      message: "Action item status updated successfully",
      actionItem: serializedActionItem
    });
  } catch (error) {
    return next(error);
  }
}

async function bulkUpdateActionItemStatus(req, res, next) {
  try {
    const { workspaceId, actionItemIds = [], status } = req.body;

    if (!workspaceId || !actionItemIds.length) {
      throw createError("workspaceId and actionItemIds are required", 400);
    }

    await assertWorkspacePermission(workspaceId, req.user.id, Permission.UPDATE_ACTION_ITEM);

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      throw createError("A valid action item status is required", 400);
    }

    await prisma.actionItem.updateMany({
      where: {
        id: {
          in: actionItemIds
        },
        workspaceId
      },
      data: {
        status: normalizedStatus,
        completedAt: normalizedStatus === ActionItemStatus.DONE ? new Date() : null
      }
    });

    const actionItems = await prisma.actionItem.findMany({
      where: {
        workspaceId,
        id: {
          in: actionItemIds
        }
      },
      include: {
        assignee: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        goal: {
          select: { id: true, title: true }
        }
      }
    });

    return res.status(200).json({
      message: "Action item statuses updated successfully",
      actionItems: actionItems.map(serializeActionItem)
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteActionItem(req, res, next) {
  try {
    const actionItem = await getActionItemOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(actionItem.workspaceId, req.user.id, Permission.DELETE_CONTENT);

    await prisma.actionItem.delete({
      where: { id: req.params.id }
    });

    return res.status(200).json({
      message: "Action item deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  bulkUpdateActionItemStatus,
  createActionItem,
  deleteActionItem,
  listActionItems,
  updateActionItem,
  updateActionItemStatus
};
