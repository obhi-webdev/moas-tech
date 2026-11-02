import { Order } from "../../models/order.model.js";
import { orderQuerySchema } from "./order.validation.js";

export async function listAdminOrders(req, res, next) {
  try {
    const parsed = orderQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order query",
        errors: parsed.error.issues,
      });
    }

    const { page, limit, status } = parsed.data;

    const filter = status ? { status } : {};

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .select(
          "orderNumber customerName phone deliveryArea total status paymentMethod paymentStatus createdAt"
        )
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
