const express = require("express");
const {
  createAnnouncement,
  createComment,
  deleteComment,
  deleteAnnouncement,
  getAnnouncement,
  listAnnouncements,
  listComments,
  pinAnnouncement,
  toggleReaction,
  updateComment,
  updateAnnouncement
} = require("../controllers/announcement.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const announcementRouter = express.Router();

announcementRouter.use(requireAuth);

announcementRouter.get("/", listAnnouncements);
announcementRouter.post("/", createAnnouncement);
announcementRouter.get("/:id", getAnnouncement);
announcementRouter.patch("/:id", updateAnnouncement);
announcementRouter.delete("/:id", deleteAnnouncement);
announcementRouter.patch("/:id/pin", pinAnnouncement);
announcementRouter.post("/:id/reactions", toggleReaction);
announcementRouter.get("/:id/comments", listComments);
announcementRouter.post("/:id/comments", createComment);
announcementRouter.patch("/:id/comments/:commentId", updateComment);
announcementRouter.delete("/:id/comments/:commentId", deleteComment);

module.exports = { announcementRouter };
