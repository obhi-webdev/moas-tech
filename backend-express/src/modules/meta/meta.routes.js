import { Router } from "express";
import { z } from "zod";
import { MetaSetting } from "./meta.model.js";
import { encryptToken } from "./meta.crypto.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

const schema = z.object({
  pixelId: z.string().regex(/^\d{5,25}$/).or(z.literal("")),
  accessToken: z.string().max(4096).optional(),
  testEventCode: z.string().max(100).default(""),
  enabled: z.boolean(),
}).strict();

router.use(requireAuth, requireAdmin);

router.get("/settings", async (req, res, next) => {
  try {
    const settings = await MetaSetting.findOne().select("+encryptedAccessToken").lean();

    res.json({
      pixelId: settings?.pixelId || "",
      testEventCode: settings?.testEventCode || "",
      enabled: settings?.enabled || false,
      hasAccessToken: Boolean(settings?.encryptedAccessToken),
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/settings", async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid Meta settings",
        errors: parsed.error.issues,
      });
    }

    const { accessToken, ...values } = parsed.data;

    if (values.enabled && !values.pixelId) {
      return res.status(400).json({
        message: "Pixel ID is required to enable tracking",
      });
    }

    const update = { ...values };

    if (accessToken) {
      update.encryptedAccessToken = encryptToken(accessToken);
    }

    const current = await MetaSetting.findOne();

    if (current) {
      await MetaSetting.updateOne(
        { _id: current._id },
        { $set: update }
      );
    } else {
      await MetaSetting.create(update);
    }

    res.json({ success: true, message: "Meta settings saved" });
  } catch (error) {
    next(error);
  }
});

export default router;
