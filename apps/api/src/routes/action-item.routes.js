const express = require("express");
const {
  bulkUpdateActionItemStatus,
  createActionItem,
  deleteActionItem,
  listActionItems,
  updateActionItem,
  updateActionItemStatus
} = require("../controllers/action-item.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const actionItemRouter = express.Router();

actionItemRouter.use(requireAuth);

actionItemRouter.get("/", listActionItems);
actionItemRouter.post("/", createActionItem);
actionItemRouter.patch("/bulk-status", bulkUpdateActionItemStatus);
actionItemRouter.patch("/:id/status", updateActionItemStatus);
actionItemRouter.patch("/:id", updateActionItem);
actionItemRouter.delete("/:id", deleteActionItem);

module.exports = { actionItemRouter };
