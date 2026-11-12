import mongoose from "mongoose";
import { LandingPage } from "../../models/landing-page.model.js";
import {
  createLandingPageSchema,
  updateLandingPageSchema,
  validateLandingPage,
} from "./landing-page.validation.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function sendError(res, error) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Landing page slug already exists",
    });
  }

  const status = error.status || 500;

  if (status === 500) console.error(error);

  return res.status(status).json({
    message: status === 500
      ? "Internal server error"
      : error.message,
  });
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

export async function listPublishedPages(req, res) {
  try {
    const pages = await LandingPage.find({
      status: "published",
    })
      .select("title slug description seoTitle updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, pages });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getPublishedPage(req, res) {
  try {
    const { slug } = req.params;

    if (!slugPattern.test(slug)) {
      return res.status(404).json({ message: "Page not found" });
    }

    const page = await LandingPage.findOne({
      slug,
      status: "published",
    }).lean();

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({ success: true, page });
  } catch (error) {
    sendError(res, error);
  }
}

export async function listAdminPages(req, res) {
  try {
    const pages = await LandingPage.find()
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, pages });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getAdminPage(req, res) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }

    const page = await LandingPage.findById(req.params.id).lean();

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({ success: true, page });
  } catch (error) {
    sendError(res, error);
  }
}

export async function createPage(req, res) {
  try {
    const data = validateLandingPage(
      createLandingPageSchema,
      req.body
    );

    const page = await LandingPage.create({
      ...data,
      publishedAt: data.status === "published"
        ? new Date()
        : null,
    });

    res.status(201).json({ success: true, page });
  } catch (error) {
    sendError(res, error);
  }
}

export async function updatePage(req, res) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }

    const data = validateLandingPage(
      updateLandingPageSchema,
      req.body
    );

    const existing = await LandingPage.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ message: "Page not found" });
    }

    if (data.status === "published" && existing.status !== "published") {
      data.publishedAt = new Date();
    }

    if (data.status === "draft") {
      data.publishedAt = null;
    }

    const page = await LandingPage.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    res.json({ success: true, page });
  } catch (error) {
    sendError(res, error);
  }
}

export async function deletePage(req, res) {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ message: "Invalid page ID" });
    }

    const page = await LandingPage.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json({ success: true, message: "Landing page deleted" });
  } catch (error) {
    sendError(res, error);
  }
}
