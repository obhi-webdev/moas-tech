import {
  getSettings,
  updateSettings,
} from "./setting.service.js";

import {
  updateSettingsSchema,
} from "./setting.validation.js";

export async function getSettingsHandler(req, res, next) {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettingsHandler(req, res, next) {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid settings data",
        errors: parsed.error.issues,
      });
    }

    if (Object.keys(parsed.data).length === 0) {
      return res.status(400).json({
        message: "No settings fields provided",
      });
    }

    const result = await updateSettings(parsed.data);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
