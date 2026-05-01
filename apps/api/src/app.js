const cors = require("cors");
const express = require("express");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fredocloud-api",
    timestamp: new Date().toISOString()
  });
});

module.exports = { app };
