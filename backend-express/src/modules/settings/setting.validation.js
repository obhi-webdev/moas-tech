import { z } from "zod";

export const updateSettingsSchema = z.object({
  siteName: z.string().max(150).optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  email: z.union([
    z.email(),
    z.literal(""),
  ]).optional(),
  address: z.string().max(500).optional(),

  deliveryChargeInside: z.number()
    .finite().min(0).optional(),

  deliveryChargeOutside: z.number()
    .finite().min(0).optional(),

  facebook: z.string().max(500).optional(),
  logo: z.string().max(2000).optional(),
  logoFileId: z.string().max(500).optional(),
  primaryColor: z.string().max(50).optional(),
  secondaryColor: z.string().max(50).optional(),
}).strict();
