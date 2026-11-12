import mongoose from "mongoose";

const schema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    maxlength: 64
  },
  path: {
    type: String,
    required: true,
    maxlength: 300
  },
  pageType: {
    type: String,
    enum: ["home", "shop", "product", "category", "landing", "other"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "analytics_page_views",
  versionKey: false,
  autoIndex: false
});

schema.index({ createdAt: -1 });
schema.index({ pageType: 1, createdAt: -1 });
schema.index({ visitorId: 1, createdAt: -1 });

export const PageView =
  mongoose.models.PageView ||
  mongoose.model("PageView", schema);
