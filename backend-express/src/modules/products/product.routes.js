import {
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./product.crud.controller.js";
import { Router } from "express";

import {
  listProducts,
  listAdminProducts,
  getProduct,
  getAdminProduct,
} from "./product.controller.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.get("/", listProducts);

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  listAdminProducts
);

router.get(
  "/admin/:id",
  requireAuth,
  requireAdmin,
  getAdminProduct
);

router.get("/:slug", getProduct);

router.post("/", requireAuth, requireAdmin, createProductHandler);

router.patch("/:id", requireAuth, requireAdmin, updateProductHandler);
router.delete("/:id", requireAuth, requireAdmin, deleteProductHandler);

export default router;
