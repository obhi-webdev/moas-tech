import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid product ID");

const orderItemSchema = z.object({
  product: objectIdSchema,

  quantity: z.number()
    .int()
    .min(1)
    .max(1000),
}).strict();

export const createOrderSchema = z.object({
  requestId: z.string()
    .uuid(),


  customerName: z.string()
    .trim()
    .min(2)
    .max(150),

  phone: z.string()
    .trim()
    .min(5)
    .max(30),

  email: z.union([
    z.email(),
    z.literal(""),
  ]).optional(),

  address: z.string()
    .trim()
    .min(5)
    .max(1000),

  district: z.string()
    .trim()
    .max(150)
    .optional(),

  deliveryArea: z.enum([
    "inside",
    "outside",
  ]),

  items: z.array(orderItemSchema)
    .min(1)
    .max(100),

  paymentMethod: z.literal("cod")
    .default("cod"),

  note: z.string()
    .trim()
    .max(2000)
    .optional(),
})
.strict()
.superRefine((data, ctx) => {
  const ids = data.items.map(
    item => item.product.toLowerCase()
  );

  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      code: "custom",
      path: ["items"],
      message: "Duplicate products are not allowed",
    });
  }
});

export const orderQuerySchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]).optional(),

  page: z.coerce.number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(20),
});
