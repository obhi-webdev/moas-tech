import { z } from "zod";

const categoryFields = {
  name: z.string().trim().min(2),

  description: z.string().optional(),
  image: z.string().optional(),

  parentCategory: z.string()
    .regex(/^[a-f\d]{24}$/i)
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),

  sortOrder: z.coerce.number().int().min(0).optional(),
};

export const createCategorySchema = z.object(categoryFields).strict();

export const updateCategorySchema = createCategorySchema.partial();

export function validateCategoryInput(schema, data) {
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
