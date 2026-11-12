import { Router } from "express";
import multer from "multer";
import ImageKit, { toFile } from "@imagekit/nodejs";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }
    cb(null, true);
  },
});

router.post(
  "/banner",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, error => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Banner image is required",
        });
      }

      if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        return res.status(503).json({
          message: "ImageKit is not configured",
        });
      }

      const imagekit = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      });

      const result = await imagekit.files.upload({
        file: await toFile(
          req.file.buffer,
          req.file.originalname
        ),
        fileName: `banner-${Date.now()}.webp`,
        folder: "/vc-tech/banners",
        useUniqueFileName: true,
      });

      res.json({
        message: "Banner uploaded",
        image: result.url,
        fileId: result.fileId,
      });
    } catch (error) {
      next(error);
    }
  }
);



// Admin-only website logo upload.
router.post(
  "/logo",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, error => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Logo image is required",
        });
      }

      if (req.file.size > 3 * 1024 * 1024) {
        return res.status(400).json({
          message: "Logo must be smaller than 3 MB",
        });
      }

      if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        return res.status(503).json({
          message: "ImageKit is not configured",
        });
      }

      const extension = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      }[req.file.mimetype];

      const imagekit = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      });

      const result = await imagekit.files.upload({
        file: await toFile(
          req.file.buffer,
          req.file.originalname
        ),
        fileName: `vc-tech-logo-${Date.now()}.${extension}`,
        folder: "/vc-tech/logos",
        useUniqueFileName: true,
      });

      return res.json({
        message: "Logo uploaded successfully",
        image: result.url,
        fileId: result.fileId,
      });
    } catch (error) {
      next(error);
    }
  }
);


// Admin-only favicon upload.
router.post(
  "/favicon",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.single("image")(req, res, error => {
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Favicon image is required",
        });
      }

      if (req.file.size > 1024 * 1024) {
        return res.status(400).json({
          message: "Favicon must be smaller than 1 MB",
        });
      }

      if (!process.env.IMAGEKIT_PRIVATE_KEY) {
        return res.status(503).json({
          message: "ImageKit is not configured",
        });
      }

      const signatures = {
        "image/png": buffer =>
          buffer.subarray(0, 8).equals(
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
          ),
        "image/jpeg": buffer =>
          buffer[0] === 255 &&
          buffer[1] === 216 &&
          buffer[2] === 255,
        "image/webp": buffer =>
          buffer.toString("ascii", 0, 4) === "RIFF" &&
          buffer.toString("ascii", 8, 12) === "WEBP",
      };

      const valid = signatures[req.file.mimetype]?.(req.file.buffer);

      if (!valid) {
        return res.status(400).json({
          message: "Invalid favicon image",
        });
      }

      const extension = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
      }[req.file.mimetype];

      const imagekit = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      });

      const result = await imagekit.files.upload({
        file: await toFile(
          req.file.buffer,
          `favicon.${extension}`
        ),
        fileName: `vc-tech-favicon-${Date.now()}.${extension}`,
        folder: "/vc-tech/favicons",
        useUniqueFileName: true,
      });

      return res.json({
        message: "Favicon uploaded successfully",
        image: result.url,
        fileId: result.fileId,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
