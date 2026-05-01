const express = require("express");
const {
  login,
  logout,
  me,
  refresh,
  register,
  updateMe
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/me", requireAuth, updateMe);

module.exports = { authRouter };
