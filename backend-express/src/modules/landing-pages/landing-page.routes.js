import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";
import {
  listPublishedPages,
  getPublishedPage,
  listAdminPages,
  getAdminPage,
  createPage,
  updatePage,
  deletePage,
} from "./landing-page.controller.js";

const router = Router();

router.get("/", listPublishedPages);

router.get("/admin/all", requireAuth, requireAdmin, listAdminPages);
router.get("/admin/:id", requireAuth, requireAdmin, getAdminPage);
router.post("/admin", requireAuth, requireAdmin, createPage);
router.patch("/admin/:id", requireAuth, requireAdmin, updatePage);
router.delete("/admin/:id", requireAuth, requireAdmin, deletePage);

router.get("/:slug", getPublishedPage);

export default router;
