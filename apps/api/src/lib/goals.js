const { GoalStatus } = require("../../generated/prisma");

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function milestoneStatusFromProgress(progress) {
  if (progress >= 100) {
    return GoalStatus.COMPLETED;
  }

  if (progress > 0) {
    return GoalStatus.IN_PROGRESS;
  }

  return GoalStatus.NOT_STARTED;
}

function calculateGoalProgress(milestones) {
  if (!milestones.length) {
    return 0;
  }

  const totalProgress = milestones.reduce((sum, milestone) => sum + clampProgress(milestone.progress), 0);
  return Math.round(totalProgress / milestones.length);
}

function deriveGoalStatusFromMilestones(milestones, currentStatus) {
  if (!milestones.length) {
    return currentStatus;
  }

  const allComplete = milestones.every((milestone) => clampProgress(milestone.progress) >= 100);

  if (allComplete) {
    return GoalStatus.COMPLETED;
  }

  if ([GoalStatus.ON_HOLD, GoalStatus.ARCHIVED, GoalStatus.DRAFT].includes(currentStatus)) {
    return currentStatus;
  }

  const anyStarted = milestones.some((milestone) => clampProgress(milestone.progress) > 0);

  return anyStarted ? GoalStatus.IN_PROGRESS : GoalStatus.NOT_STARTED;
}

async function syncGoalProgressAndStatus(tx, goalId) {
  const goal = await tx.goal.findUnique({
    where: { id: goalId },
    include: {
      milestones: {
        select: {
          id: true,
          progress: true
        }
      }
    }
  });

  if (!goal) {
    return null;
  }

  const progress = calculateGoalProgress(goal.milestones);
  const status = deriveGoalStatusFromMilestones(goal.milestones, goal.status);

  return tx.goal.update({
    where: { id: goalId },
    data: {
      progress,
      status,
      completedAt: status === GoalStatus.COMPLETED ? new Date() : null
    }
  });
}

module.exports = {
  calculateGoalProgress,
  clampProgress,
  deriveGoalStatusFromMilestones,
  milestoneStatusFromProgress,
  syncGoalProgressAndStatus
};
