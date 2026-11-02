import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      trim: true,
    },

    requestHash: {
      type: String,
      trim: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      default: "",
      trim: true,
    },

    deliveryArea: {
      type: String,
      enum: ["inside", "outside"],
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: value => value.length > 0,
        message: "Order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "bkash", "nagad"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "orders",
    autoIndex: false,
  }
);

orderSchema.index(
  { requestId: 1 },
  {
    unique: true,
    partialFilterExpression: { requestId: { $type: "string" } },
    name: "unique_checkout_request_id",
  }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ phone: 1, createdAt: -1 });
orderSchema.index({ deliveryArea: 1, createdAt: -1 });

export const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);
