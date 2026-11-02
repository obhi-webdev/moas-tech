import { Setting } from "../../models/setting.model.js";

const DEFAULT_SETTINGS = {
  siteName: "VC Tech",
  phone: "01614106550",
  whatsapp: "01614106550",
  email: "",
  address: "Mymensingh, Bangladesh",
  deliveryChargeInside: 0,
  deliveryChargeOutside: 0,
  facebook: "",
  logo: "",
  logoFileId: "",
  primaryColor: "blue",
  secondaryColor: "orange",
};

export async function getSettings() {
  const settings = await Setting.findOne().lean();

  return settings || DEFAULT_SETTINGS;
}

export async function updateSettings(data) {
  const settings = await Setting.findOneAndUpdate(
    {},
    { $set: data },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    message: "Settings updated successfully",
    settings,
  };
}
