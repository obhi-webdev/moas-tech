import mongoose from "mongoose";
import { Category } from "../../models/category.model.js";

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

export async function findCategories(admin = false) {
  const filter = admin ? {} : { isActive: true };

  return Category.find(filter)
    .populate("parentCategory", "name slug image isActive")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
}

export async function findMainCategories(admin = false) {
  const filter = admin
    ? { parentCategory: null }
    : { parentCategory: null, isActive: true };

  return Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();
}

export async function findSubcategories(parentId, admin = false) {
  if (!mongoose.isObjectIdOrHexString(parentId)) {
    throw httpError(400, "Invalid parent category");
  }

  const parentExists = await Category.exists({ _id: parentId });

  if (!parentExists) {
    throw httpError(404, "Parent category not found");
  }

  const filter = admin
    ? { parentCategory: parentId }
    : { parentCategory: parentId, isActive: true };

  return Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();
}

export async function findCategoryBySlug(slug) {
  const category = await Category.findOne({
    slug,
    isActive: true,
  })
    .populate("parentCategory", "name slug image")
    .lean();

  if (!category) {
    throw httpError(404, "Category not found");
  }

  return category;
}

export async function findCategoryById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw httpError(400, "Invalid category ID");
  }

  const category = await Category.findById(id)
    .populate("parentCategory", "name slug image isActive");

  if (!category) {
    throw httpError(404, "Category not found");
  }

  return category;
}
