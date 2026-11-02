import { updateOrderStatus } from "./order.status.controller.js";
import { Router } from "express";

import { createOrderHandler } from "./order.controller.js";
import { listAdminOrders } from "./order.admin.controller.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  listAdminOrders
);

router.patch("/admin/:id/status", requireAuth, requireAdmin, updateOrderStatus);

router.post("/", createOrderHandler);

export default router;
