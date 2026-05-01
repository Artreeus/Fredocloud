const express = require("express");
const {
  createGoal,
  createGoalUpdate,
  createMilestone,
  deleteGoal,
  getGoal,
  listGoals,
  updateGoal,
  updateMilestone
} = require("../controllers/goal.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const goalRouter = express.Router();

goalRouter.use(requireAuth);

goalRouter.get("/", listGoals);
goalRouter.post("/", createGoal);
goalRouter.get("/:id", getGoal);
goalRouter.patch("/:id", updateGoal);
goalRouter.delete("/:id", deleteGoal);
goalRouter.post("/:id/milestones", createMilestone);
goalRouter.patch("/:id/milestones/:milestoneId", updateMilestone);
goalRouter.post("/:id/updates", createGoalUpdate);

module.exports = { goalRouter };
