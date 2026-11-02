import { Router } from "express";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

import {
  getSettingsHandler,
  updateSettingsHandler,
} from "./setting.controller.js";

const router = Router();

router.get("/", getSettingsHandler);

router.patch(
  "/",
  requireAuth,
  requireAdmin,
  updateSettingsHandler
);

export default router;
