import mongoose from "mongoose";
import { z } from "zod";
import { Order } from "../../models/order.model.js";

const schema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
}).strict();

const transitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function updateOrderStatus(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const nextStatus = parsed.data.status;

    if (nextStatus === order.status) {
      return res.json({ success: true, order });
    }

    if (!transitions[order.status]?.includes(nextStatus)) {
      return res.status(409).json({
        message: "Invalid order status transition",
      });
    }

    // Conditional update prevents concurrent status overwrites.
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { $set: { status: nextStatus } },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(409).json({
        message: "Order changed. Refresh and try again.",
      });
    }

    res.json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
}
