import { createOrderSchema } from "./order.validation.js";
import { createOrder } from "./order.service.js";

export async function createOrderHandler(req, res, next) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid order data",
        errors: parsed.error.issues,
      });
    }

    const order = await createOrder(parsed.data);

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
}
