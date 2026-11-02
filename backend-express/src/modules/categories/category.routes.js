import {
  updateCategoryHandler,
  deleteCategoryHandler,
} from "./category.crud.controller.js";
import { createCategoryHandler } from "./category.crud.controller.js";
import { Router } from "express";

import {
  listCategories,
  listAdminCategories,
  getAdminCategory,
  listMainCategories,
  listSubcategories,
  getCategory,
} from "./category.controller.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.get("/", listCategories);

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  listAdminCategories
);

router.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  getAdminCategory
);

router.get("/main", listMainCategories);

router.get("/:parentId/subcategories", listSubcategories);

router.get("/:slug", getCategory);

router.post("/", requireAuth, requireAdmin, createCategoryHandler);

router.patch("/:id", requireAuth, requireAdmin, updateCategoryHandler);
router.delete("/:id", requireAuth, requireAdmin, deleteCategoryHandler);

export default router;
