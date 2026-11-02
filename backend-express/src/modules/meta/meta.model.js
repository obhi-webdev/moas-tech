import mongoose from "mongoose";

const metaSchema = new mongoose.Schema(
  {
    pixelId: { type: String, default: "" },
    encryptedAccessToken: { type: String, select: false },
    testEventCode: { type: String, default: "" },
    enabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    collection: "meta_marketing_settings",
  }
);

export const MetaSetting =
  mongoose.models.MetaSetting ||
  mongoose.model("MetaSetting", metaSchema);
