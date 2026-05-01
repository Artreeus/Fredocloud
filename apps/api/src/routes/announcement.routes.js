const express = require("express");
const {
  createAnnouncement,
  createComment,
  getAnnouncement,
  listAnnouncements,
  listComments,
  pinAnnouncement,
  toggleReaction
} = require("../controllers/announcement.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const announcementRouter = express.Router();

announcementRouter.use(requireAuth);

announcementRouter.get("/", listAnnouncements);
announcementRouter.post("/", createAnnouncement);
announcementRouter.get("/:id", getAnnouncement);
announcementRouter.patch("/:id/pin", pinAnnouncement);
announcementRouter.post("/:id/reactions", toggleReaction);
announcementRouter.get("/:id/comments", listComments);
announcementRouter.post("/:id/comments", createComment);

module.exports = { announcementRouter };
