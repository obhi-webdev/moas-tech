import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "VC Tech",
      trim: true,
    },

    phone: {
      type: String,
      default: "01614106550",
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "01614106550",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "Mymensingh, Bangladesh",
      trim: true,
    },

    deliveryChargeInside: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryChargeOutside: {
      type: Number,
      default: 0,
      min: 0,
    },

    facebook: {
      type: String,
      default: "",
      trim: true,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    logoFileId: {
      type: String,
      default: "",
      trim: true,
    },

    primaryColor: {
      type: String,
      default: "blue",
    },

    secondaryColor: {
      type: String,
      default: "orange",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "settings",
    autoIndex: false,
  }
);

export const Setting =
  mongoose.models.Setting ||
  mongoose.model("Setting", settingSchema);
