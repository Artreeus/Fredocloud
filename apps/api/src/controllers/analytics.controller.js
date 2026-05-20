const { ActionItemStatus, GoalStatus, Priority } = require("../../generated/prisma");
const { getWorkspaceMembershipOrThrow } = require("../lib/workspaces");
const { prisma } = require("../lib/prisma");

function startOfWeek(date) {
  const nextDate = new Date(date);
  const day = nextDate.getDay();
  const diff = nextDate.getDate() - day + (day === 0 ? -6 : 1);
  nextDate.setDate(diff);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function formatBucketLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

async function getAnalyticsSummary(req, res, next) {
  try {
    const workspaceId = req.query.workspaceId;

    if (!workspaceId) {
      throw new Error("workspaceId is required");
    }

    await getWorkspaceMembershipOrThrow(workspaceId, req.user.id);

    const [goals, actionItems, memberCount] = await Promise.all([
      prisma.goal.findMany({
        where: { workspaceId },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.actionItem.findMany({
        where: { workspaceId },
        select: {
          id: true,
          title: true,
          priority: true,
          status: true,
          dueDate: true,
          completedAt: true,
          createdAt: true
        }
      }),
      prisma.workspaceMember.count({
        where: { workspaceId }
      })
    ]);

    const currentWeekStart = startOfWeek(new Date());
    const completedThisWeek = actionItems.filter(
      (item) => item.completedAt && new Date(item.completedAt) >= currentWeekStart
    ).length;
    const overdueCount = actionItems.filter(
      (item) => item.dueDate && item.status !== ActionItemStatus.DONE && new Date(item.dueDate) < new Date()
    ).length;
    const activeMembers = 0;

    const goalCompletionSeries = Array.from({ length: 6 }, (_, index) => {
      const bucketDate = startOfWeek(new Date());
      bucketDate.setDate(bucketDate.getDate() - (5 - index) * 7);
      const nextBucketDate = new Date(bucketDate);
      nextBucketDate.setDate(nextBucketDate.getDate() + 7);

      return {
        label: formatBucketLabel(bucketDate),
        totalGoals: goals.filter(
          (goal) => new Date(goal.createdAt) >= bucketDate && new Date(goal.createdAt) < nextBucketDate
        ).length,
        completedGoals: goals.filter((goal) => {
          if (!goal.completedAt && goal.status !== GoalStatus.COMPLETED) {
            return false;
          }

          const completedAt = goal.completedAt ? new Date(goal.completedAt) : new Date(goal.updatedAt || goal.createdAt);
          return completedAt >= bucketDate && completedAt < nextBucketDate;
        }).length
      };
    });

    const priorityDistribution = Object.values(Priority).map((priority) => ({
      name: priority,
      value: actionItems.filter((item) => item.priority === priority && item.status !== ActionItemStatus.DONE).length
    }));

    return res.status(200).json({
      stats: {
        totalGoals: goals.length,
        completedThisWeek,
        overdueCount,
        activeMembers,
        totalMembers: memberCount
      },
      goalCompletionSeries,
      priorityDistribution
    });
  } catch (error) {
    if (!error.statusCode && error.message === "workspaceId is required") {
      error.statusCode = 400;
    }

    return next(error);
  }
}

async function exportAnalyticsCsv(req, res, next) {
  try {
    const workspaceId = req.query.workspaceId;

    if (!workspaceId) {
      const error = new Error("workspaceId is required");
      error.statusCode = 400;
      throw error;
    }

    await getWorkspaceMembershipOrThrow(workspaceId, req.user.id);

    const [workspace, goals, actionItems, announcements] = await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true }
      }),
      prisma.goal.findMany({
        where: { workspaceId },
        include: {
          assignee: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.actionItem.findMany({
        where: { workspaceId },
        include: {
          assignee: {
            select: { name: true }
          },
          goal: {
            select: { title: true }
          }
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.announcement.findMany({
        where: { workspaceId },
        include: {
          author: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "asc" }
      })
    ]);

    const rows = [
      ["Workspace", workspace?.name || workspaceId],
      [],
      ["Goals"],
      ["Title", "Status", "Priority", "Assignee", "Due Date"],
      ...goals.map((goal) => [
        goal.title,
        goal.status,
        goal.priority,
        goal.assignee?.name || "",
        goal.dueDate ? new Date(goal.dueDate).toISOString() : ""
      ]),
      [],
      ["Action Items"],
      ["Title", "Status", "Priority", "Assignee", "Goal", "Due Date"],
      ...actionItems.map((item) => [
        item.title,
        item.status,
        item.priority,
        item.assignee?.name || "",
        item.goal?.title || "",
        item.dueDate ? new Date(item.dueDate).toISOString() : ""
      ]),
      [],
      ["Announcements"],
      ["Title", "Author", "Pinned", "Published At"],
      ...announcements.map((announcement) => [
        announcement.title,
        announcement.author?.name || "",
        announcement.pinned ? "Yes" : "No",
        announcement.publishedAt ? new Date(announcement.publishedAt).toISOString() : ""
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${(workspace?.name || "workspace").replace(/\s+/g, "-").toLowerCase()}-export.csv"`
    );

    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  exportAnalyticsCsv,
  getAnalyticsSummary
};
