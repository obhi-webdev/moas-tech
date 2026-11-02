import { Router } from "express";
import {
  login,
  getCurrentUser,
} from "./auth.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.post("/login", login);

router.get("/me", requireAuth, getCurrentUser);

router.get(
  "/admin-check",
  requireAuth,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
    });
  }
);

export default router;
