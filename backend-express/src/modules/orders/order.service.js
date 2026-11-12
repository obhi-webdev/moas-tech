import crypto from "node:crypto";
import mongoose from "mongoose";

import { Product } from "../../models/product.model.js";
import { Order } from "../../models/order.model.js";
import { Setting } from "../../models/setting.model.js";

function checkoutError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function money(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function generateOrderNumber() {
  return `MT-${Date.now()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}


function checkoutRequestHash(data) {
  const payload = {
    customerName: data.customerName,
    phone: data.phone,
    email: data.email || "",
    address: data.address,
    district: data.district || "",
    deliveryArea: data.deliveryArea,
    paymentMethod: data.paymentMethod || "cod",
    note: data.note || "",
    items: [...data.items]
      .map(item => ({
        product: item.product.toLowerCase(),
        quantity: item.quantity,
      }))
      .sort((a, b) => a.product.localeCompare(b.product)),
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

async function findExistingRequest(requestId, requestHash) {
  const existing = await Order.findOne({ requestId });

  if (!existing) return null;

  if (existing.requestHash !== requestHash) {
    throw checkoutError(
      409,
      "Request ID already used for a different order"
    );
  }

  return existing;
}

export async function createOrder(data) {
  if (!data.requestId) {
    throw checkoutError(400, "requestId is required");
  }

  const requestHash = checkoutRequestHash(data);

  const existing = await findExistingRequest(
    data.requestId,
    requestHash
  );

  if (existing) return existing;

  const session = await mongoose.startSession();

  try {
    let createdOrder;

    await session.withTransaction(async () => {
      const settings = await Setting.findOne()
        .session(session)
        .lean();

      const deliveryCharge = Number(
        data.deliveryArea === "inside"
          ? settings?.deliveryChargeInside ?? 0
          : settings?.deliveryChargeOutside ?? 0
      );

      if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
        throw checkoutError(500, "Invalid delivery settings");
      }

      const orderItems = [];
      let subtotal = 0;

      for (const item of data.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.product,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: false,
            session,
          }
        );

        if (!product) {
          throw checkoutError(
            400,
            "Product unavailable or insufficient stock"
          );
        }

        const price = Number(
          product.salePrice != null &&
          product.salePrice > 0 &&
          product.salePrice < product.regularPrice
            ? product.salePrice
            : product.regularPrice
        );

        if (!Number.isFinite(price) || price < 0) {
          throw checkoutError(500, "Invalid product price");
        }

        subtotal = money(subtotal + price * item.quantity);

        orderItems.push({
          product: product._id,
          name: product.name,
          price,
          quantity: item.quantity,
          image: product.images?.[0] || "",
        });
      }

      const total = money(subtotal + deliveryCharge);

      const orders = await Order.create(
        [{
          requestId: data.requestId,
          requestHash,
          orderNumber: generateOrderNumber(),
          customerName: data.customerName,
          phone: data.phone,
          email: data.email || "",
          address: data.address,
          district: data.district || "",
          deliveryArea: data.deliveryArea,
          items: orderItems,
          subtotal,
          deliveryCharge,
          total,
          status: "pending",
          paymentMethod: "cod",
          paymentStatus: "unpaid",
          note: data.note || "",
        }],
        { session }
      );

      createdOrder = orders[0];
    });

    return createdOrder;
  } catch (error) {
    if (error.code === 11000) {
      const existing = await findExistingRequest(
        data.requestId,
        requestHash
      );

      if (existing) return existing;
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
