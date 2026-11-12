import landingPageRoutes from "./modules/landing-pages/landing-page.routes.js";
import uploadRoutes from "./modules/uploads/upload.routes.js";
import metaRoutes from "./modules/meta/meta.routes.js";
import bannerRoutes from "./modules/banners/banner.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import settingRoutes from "./modules/settings/setting.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(v => v.trim())
    : ["http://localhost:5173"],
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/meta", metaRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/landing-pages", landingPageRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VC Tech Express API running",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((err, req, res, next) => {
  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 500
      ? err.status
      : 500;

  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message,
  });
});

export default app;
