const express = require("express");
const {
  listNotifications,
  markNotificationRead
} = require("../controllers/notification.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const notificationRouter = express.Router();

notificationRouter.use(requireAuth);

notificationRouter.get("/", listNotifications);
notificationRouter.patch("/:id/read", markNotificationRead);

module.exports = { notificationRouter };
