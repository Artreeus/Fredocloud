const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { actionItemRouter } = require("./routes/action-item.routes");
const { analyticsRouter } = require("./routes/analytics.routes");
const { announcementRouter } = require("./routes/announcement.routes");
const { authRouter } = require("./routes/auth.routes");
const { goalRouter } = require("./routes/goal.routes");
const { notificationRouter } = require("./routes/notification.routes");
const { uploadRouter } = require("./routes/upload.routes");
const { workspaceRouter } = require("./routes/workspace.routes");
const { env } = require("./config/env");
const { buildOpenApiSpec } = require("./docs/openapi");

const app = express();
const openApiSpec = buildOpenApiSpec();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    service: "FredoCloud API",
    status: "online",
    docs: "/api/docs",
    openApi: "/api/openapi.json",
    health: "/api/health",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fredocloud-api",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/openapi.json", (req, res) => {
  res.status(200).json(openApiSpec);
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    explorer: true,
    customSiteTitle: "FredoCloud API Docs"
  })
);

app.use("/api/action-items", actionItemRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/auth", authRouter);
app.use("/api/goals", goalRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/workspaces", workspaceRouter);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
});

module.exports = { app };
