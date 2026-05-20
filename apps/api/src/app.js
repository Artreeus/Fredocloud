const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
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
const { pusher } = require("./lib/pusher");
const { requireAuth } = require("./middleware/auth.middleware");
const { prisma } = require("./lib/prisma");

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
app.use(express.urlencoded({ extended: false }));

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

app.get("/api/docs", (req, res) => {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <title>FredoCloud API Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: "/api/openapi.json",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
          tryItOutEnabled: true
        });
      };
    </script>
  </body>
</html>`;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.use("/api/action-items", actionItemRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/auth", authRouter);
app.use("/api/goals", goalRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/workspaces", workspaceRouter);

app.post("/api/pusher/auth", requireAuth, async (req, res, next) => {
  try {
    const { socket_id, channel_name } = req.body;
    const workspaceId = channel_name.replace(/^(private|presence)-workspace-/, "");

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const authData = channel_name.startsWith("presence-")
      ? pusher.authorizeChannel(socket_id, channel_name, {
          user_id: req.user.id,
          user_info: { name: req.user.name, avatarUrl: req.user.avatarUrl }
        })
      : pusher.authorizeChannel(socket_id, channel_name);

    return res.json(authData);
  } catch (error) {
    return next(error);
  }
});

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
