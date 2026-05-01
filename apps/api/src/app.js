const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { authRouter } = require("./routes/auth.routes");
const { uploadRouter } = require("./routes/upload.routes");
const { workspaceRouter } = require("./routes/workspace.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fredocloud-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRouter);
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
