import { z } from "zod";

const specificationSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().min(1),
}).strict();

const productFields = {
  name: z.string().trim().min(2),
  sku: z.string().trim().min(2),
  category: z.string().regex(/^[a-f\d]{24}$/i),

  brand: z.string().optional(),
  images: z.array(z.string()).max(10).optional(),

  regularPrice: z.coerce.number().finite().min(0),
  salePrice: z.coerce.number().finite().min(0).nullable().optional(),

  stock: z.coerce.number().int().min(0).optional(),

  shortDescription: z.string().optional(),
  description: z.string().optional(),

  specifications: z.array(specificationSchema).optional(),

  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isOffer: z.boolean().optional(),

  sortOrder: z.coerce.number().int().min(0).optional(),
};

export const createProductSchema = z.object(productFields).strict();

export const updateProductSchema = createProductSchema.partial();

export function validateProductInput(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    const error = new Error(
      result.error.issues.map(x => x.message).join("; ")
    );
    error.status = 400;
    throw error;
  }

  return result.data;
}
