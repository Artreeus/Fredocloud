const express = require("express");
const { uploadAvatar } = require("../controllers/upload.controller");
const { requireAuth } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");

const uploadRouter = express.Router();

uploadRouter.post("/", requireAuth, upload.single("file"), uploadAvatar);

module.exports = { uploadRouter };
