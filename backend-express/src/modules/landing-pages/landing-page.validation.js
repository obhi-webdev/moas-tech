import { z } from "zod";

const sectionSchema = z.object({
  type: z.enum([
    "hero", "text", "image", "features",
    "reviews", "faq", "cta", "product",
  ]),
  heading: z.string().max(250).optional(),
  body: z.string().max(10000).optional(),
  imageUrl: z.string().max(2000).optional(),
  buttonText: z.string().max(150).optional(),
  buttonUrl: z.string().max(2000).optional(),
}).strict();

const fields = {
  title: z.string().trim().min(2).max(200),
  slug: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug")
    .max(150),
  status: z.enum(["draft", "published"]).optional(),
  description: z.string().max(5000).optional(),
  productId: z.string().regex(/^[a-f\d]{24}$/i).nullable().optional(),
  sections: z.array(sectionSchema).max(50).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
};

export const createLandingPageSchema = z.object(fields).strict();

export const updateLandingPageSchema =
  createLandingPageSchema.partial().refine(
    data => Object.keys(data).length > 0,
    "At least one field is required"
  );

export function validateLandingPage(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const error = new Error(
      result.error.issues.map(issue => issue.message).join("; ")
    );
    error.status = 400;
    throw error;
  }

  return result.data;
}
