import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["hero", "text", "image", "features", "reviews", "faq", "cta", "product"],
    required: true,
  },
  heading: { type: String, default: "" },
  body: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  buttonText: { type: String, default: "" },
  buttonUrl: { type: String, default: "" },
}, { _id: true });

const landingPageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
    index: true,
  },
  description: { type: String, default: "" },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
  sections: { type: [sectionSchema], default: [] },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  publishedAt: { type: Date, default: null },
}, {
  timestamps: true,
  versionKey: false,
  collection: "landing_pages",
  autoIndex: false,
});

export const LandingPage =
  mongoose.models.LandingPage ||
  mongoose.model("LandingPage", landingPageSchema);
