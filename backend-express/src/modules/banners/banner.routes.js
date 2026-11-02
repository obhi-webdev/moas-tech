import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";

import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = Router();

const collection = () =>
  mongoose.connection.db.collection("banners");

const schema = z.object({
  position: z.enum(["main", "side-one", "side-two"]),
  image: z.string().url(),
  imageFileId: z.string().default(""),
  link: z.string().min(1).max(2048),
  alt: z.string().max(300).default(""),
  isActive: z.boolean(),
}).strict();

const validId = id =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id.toLowerCase();

router.get("/", async (req, res, next) => {
  try {
    const data = await collection()
      .find({ isActive: true })
      .sort({ createdAt: 1 })
      .toArray();

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth, requireAdmin);

router.get("/admin/all", async (req, res, next) => {
  try {
    const data = await collection()
      .find({})
      .sort({ createdAt: 1 })
      .toArray();

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid banner data",
        errors: parsed.error.issues,
      });
    }

    const existing = await collection().findOne({
      position: parsed.data.position,
    });

    if (existing) {
      return res.status(409).json({
        message: "Banner position already exists",
      });
    }

    const now = new Date();

    const banner = {
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection().insertOne(banner);

    res.status(201).json({
      ...banner,
      _id: result.insertedId,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Banner position already exists",
      });
    }
    next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid banner ID",
      });
    }

    const parsed = schema.partial().safeParse(req.body);

    if (!parsed.success || !Object.keys(parsed.data || {}).length) {
      return res.status(400).json({
        message: "Invalid banner update",
      });
    }

    const result = await collection().findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      {
        $set: {
          ...parsed.data,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    res.json(result);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Banner position already exists",
      });
    }
    next(error);
  }
});

export default router;
