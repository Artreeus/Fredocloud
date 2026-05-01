const { AuditAction, GoalStatus, Permission } = require("../../generated/prisma");
const { clampProgress, milestoneStatusFromProgress, syncGoalProgressAndStatus } = require("../lib/goals");
const { assertWorkspacePermission } = require("../lib/permissions");
const { prisma } = require("../lib/prisma");

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
    }
  });

  if (!membership) {
    throw createError("Workspace not found", 404);
  }

  return membership;
}

async function getGoalOrThrow(goalId, userId) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      workspace: true,
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      milestones: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: "asc" }
      },
      updates: {
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!goal) {
    throw createError("Goal not found", 404);
  }

  await getWorkspaceMembershipOrThrow(goal.workspaceId, userId);
  return goal;
}

function serializeGoal(goal) {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    status: goal.status,
    priority: goal.priority,
    progress: goal.progress,
    dueDate: goal.dueDate,
    startDate: goal.startDate,
    completedAt: goal.completedAt,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    workspaceId: goal.workspaceId,
    assignee: goal.assignee
      ? {
          id: goal.assignee.id,
          name: goal.assignee.name,
          email: goal.assignee.email,
          avatarUrl: goal.assignee.avatarUrl
        }
      : null,
    createdBy: goal.createdBy
      ? {
          id: goal.createdBy.id,
          name: goal.createdBy.name,
          email: goal.createdBy.email,
          avatarUrl: goal.createdBy.avatarUrl
        }
      : null,
    milestones:
      goal.milestones?.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        progress: milestone.progress,
        status: milestone.status,
        dueDate: milestone.dueDate,
        createdAt: milestone.createdAt,
        updatedAt: milestone.updatedAt,
        owner: milestone.owner
      })) || [],
    updates:
      goal.updates?.map((update) => ({
        id: update.id,
        body: update.body,
        createdAt: update.createdAt,
        updatedAt: update.updatedAt,
        author: update.author
      })) || []
  };
}

async function listGoals(req, res, next) {
  try {
    const { workspaceId, status, assigneeId, search } = req.query;

    if (!workspaceId) {
      throw createError("workspaceId is required", 400);
    }

    await getWorkspaceMembershipOrThrow(workspaceId, req.user.id);

    const goals = await prisma.goal.findMany({
      where: {
        workspaceId,
        ...(status ? { status } : {}),
        ...(assigneeId ? { assigneeId } : {}),
        ...(search
          ? {
              title: {
                contains: search,
                mode: "insensitive"
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
        milestones: {
          include: {
            owner: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: "asc" }
        },
        updates: {
          include: {
            author: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }]
    });

    return res.status(200).json({
      goals: goals.map(serializeGoal)
    });
  } catch (error) {
    return next(error);
  }
}

async function getGoal(req, res, next) {
  try {
    const goal = await getGoalOrThrow(req.params.id, req.user.id);

    return res.status(200).json({
      goal: serializeGoal(goal)
    });
  } catch (error) {
    return next(error);
  }
}

async function createGoal(req, res, next) {
  try {
    const { workspaceId, title, description, assigneeId, dueDate, status, priority, milestones = [] } =
      req.body;

    if (!workspaceId || !title) {
      throw createError("workspaceId and title are required", 400);
    }

    await assertWorkspacePermission(workspaceId, req.user.id, Permission.CREATE_GOAL);

    const createdGoal = await prisma.$transaction(async (tx) => {
      const goal = await tx.goal.create({
        data: {
          workspaceId,
          title,
          description,
          assigneeId: assigneeId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: status || GoalStatus.NOT_STARTED,
          priority: priority || "MEDIUM",
          createdById: req.user.id
        }
      });

      for (const milestone of milestones) {
        if (!milestone.title) {
          continue;
        }

        const progress = clampProgress(milestone.progress);

        await tx.milestone.create({
          data: {
            goalId: goal.id,
            title: milestone.title,
            description: milestone.description || null,
            progress,
            status: milestoneStatusFromProgress(progress),
            dueDate: milestone.dueDate ? new Date(milestone.dueDate) : null,
            ownerId: milestone.ownerId || assigneeId || null
          }
        });
      }

      await syncGoalProgressAndStatus(tx, goal.id);

      await tx.auditLog.create({
        data: {
          workspaceId,
          actorId: req.user.id,
          action: AuditAction.GOAL_CREATED,
          entityType: "Goal",
          entityId: goal.id
        }
      });

      return goal.id;
    });

    const goal = await getGoalOrThrow(createdGoal, req.user.id);

    return res.status(201).json({
      message: "Goal created successfully",
      goal: serializeGoal(goal)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateGoal(req, res, next) {
  try {
    const existingGoal = await getGoalOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(existingGoal.workspaceId, req.user.id, Permission.UPDATE_GOAL);
    const { title, description, assigneeId, dueDate, status, priority } = req.body;

    await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        ...(title ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(assigneeId !== undefined ? { assigneeId: assigneeId || null } : {}),
        ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {})
      }
    });

    if (existingGoal.milestones.length) {
      await prisma.$transaction(async (tx) => {
        await syncGoalProgressAndStatus(tx, req.params.id);
        return null;
      });
    }

    const goal = await getGoalOrThrow(req.params.id, req.user.id);

    return res.status(200).json({
      message: "Goal updated successfully",
      goal: serializeGoal(goal)
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const goal = await getGoalOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(goal.workspaceId, req.user.id, Permission.DELETE_CONTENT);

    await prisma.goal.delete({
      where: { id: req.params.id }
    });

    return res.status(200).json({
      message: "Goal deleted successfully"
    });
  } catch (error) {
    return next(error);
  }
}

async function createMilestone(req, res, next) {
  try {
    const goal = await getGoalOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(goal.workspaceId, req.user.id, Permission.UPDATE_GOAL);
    const { title, description, progress, dueDate, ownerId } = req.body;

    if (!title) {
      throw createError("Milestone title is required", 400);
    }

    const createdMilestone = await prisma.$transaction(async (tx) => {
      const nextProgress = clampProgress(progress);
      const milestone = await tx.milestone.create({
        data: {
          goalId: goal.id,
          title,
          description,
          progress: nextProgress,
          status: milestoneStatusFromProgress(nextProgress),
          dueDate: dueDate ? new Date(dueDate) : null,
          ownerId: ownerId || goal.assignee?.id || null
        }
      });

      await syncGoalProgressAndStatus(tx, goal.id);
      return milestone;
    });

    return res.status(201).json({
      message: "Milestone created successfully",
      milestone: createdMilestone
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMilestone(req, res, next) {
  try {
    const goal = await getGoalOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(goal.workspaceId, req.user.id, Permission.UPDATE_GOAL);
    const { title, description, progress, dueDate, ownerId } = req.body;

    const updatedMilestone = await prisma.$transaction(async (tx) => {
      const nextProgress =
        progress !== undefined ? clampProgress(progress) : undefined;

      const milestone = await tx.milestone.update({
        where: {
          id: req.params.milestoneId
        },
        data: {
          ...(title ? { title } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(nextProgress !== undefined
            ? {
                progress: nextProgress,
                status: milestoneStatusFromProgress(nextProgress),
                completedAt: nextProgress >= 100 ? new Date() : null
              }
            : {}),
          ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
          ...(ownerId !== undefined ? { ownerId: ownerId || null } : {})
        }
      });

      await syncGoalProgressAndStatus(tx, goal.id);
      return milestone;
    });

    return res.status(200).json({
      message: "Milestone updated successfully",
      milestone: updatedMilestone
    });
  } catch (error) {
    return next(error);
  }
}

async function createGoalUpdate(req, res, next) {
  try {
    const goal = await getGoalOrThrow(req.params.id, req.user.id);
    await assertWorkspacePermission(goal.workspaceId, req.user.id, Permission.UPDATE_GOAL);
    const { body } = req.body;

    if (!body) {
      throw createError("Update body is required", 400);
    }

    const update = await prisma.goalUpdate.create({
      data: {
        goalId: goal.id,
        authorId: req.user.id,
        body
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return res.status(201).json({
      message: "Progress update posted successfully",
      update: {
        id: update.id,
        body: update.body,
        createdAt: update.createdAt,
        updatedAt: update.updatedAt,
        author: update.author
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createGoal,
  createGoalUpdate,
  createMilestone,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal,
  updateMilestone
};
