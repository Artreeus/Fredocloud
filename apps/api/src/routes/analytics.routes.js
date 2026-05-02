const express = require("express");
const {
  exportAnalyticsCsv,
  getAnalyticsSummary
} = require("../controllers/analytics.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const analyticsRouter = express.Router();

analyticsRouter.use(requireAuth);

analyticsRouter.get("/summary", getAnalyticsSummary);
analyticsRouter.get("/export", exportAnalyticsCsv);

module.exports = { analyticsRouter };
