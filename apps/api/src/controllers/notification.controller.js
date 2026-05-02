const { prisma } = require("../lib/prisma");
const { emitWorkspaceEvent } = require("../lib/socket");

async function listNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        readAt: null
      }
    });

    return res.status(200).json({
      notifications,
      unreadCount
    });
  } catch (error) {
    return next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingNotification) {
      const error = new Error("Notification not found");
      error.statusCode = 404;
      throw error;
    }

    const notification = await prisma.notification.update({
      where: {
        id: req.params.id
      },
      data: {
        readAt: new Date()
      }
    });

    return res.status(200).json({
      notification
    });
  } catch (error) {
    return next(error);
  }
}

async function createNotificationAndEmit(data) {
  const notification = await prisma.notification.create({
    data
  });

  if (notification.workspaceId) {
    emitWorkspaceEvent(notification.workspaceId, "notification:new", {
      notification
    });
  }

  return notification;
}

module.exports = {
  createNotificationAndEmit,
  listNotifications,
  markNotificationRead
};
