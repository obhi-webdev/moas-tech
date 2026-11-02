import mongoose from "mongoose";
import { Category } from "../../models/category.model.js";
import { Product } from "../../models/product.model.js";

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

function slugify(name) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateId(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    fail(400, "Invalid category ID");
  }
}

export async function updateCategory(id, dto) {
  validateId(id);

  const category = await Category.findById(id);
  if (!category) fail(404, "Category not found");

  const changes = { ...dto };

  if (dto.name !== undefined) {
    const slug = slugify(dto.name);

    if (!slug) fail(400, "Invalid category name");

    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      $or: [{ name: dto.name }, { slug }],
    });

    if (duplicate) fail(409, "Category already exists");

    changes.slug = slug;
  }

  if (Object.hasOwn(dto, "parentCategory")) {
    const parentId = dto.parentCategory;

    if (parentId) {
      validateId(parentId);

      if (parentId === id) {
        fail(400, "Category cannot be its own parent");
      }

      const parent = await Category.findById(parentId);
      if (!parent) fail(404, "Parent category not found");

      if (parent.parentCategory) {
        fail(400, "Nested subcategories are not allowed");
      }

      const hasChildren = await Category.exists({
        parentCategory: category._id,
      });

      if (hasChildren) {
        fail(400, "Move child categories before changing parent");
      }
    }

    changes.parentCategory = parentId || null;
  }

  try {
    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: changes },
      { new: true, runValidators: true }
    );

    return updated;
  } catch (error) {
    if (error.code === 11000) {
      fail(409, "Category already exists");
    }
    throw error;
  }
}

export async function deleteCategory(id) {
  validateId(id);

  const category = await Category.findById(id);
  if (!category) fail(404, "Category not found");

  const hasChildren = await Category.exists({
    parentCategory: category._id,
  });

  if (hasChildren) {
    fail(400, "Delete or move subcategories first");
  }

  const hasProducts = await Product.exists({
    category: category._id,
  });

  if (hasProducts) {
    fail(400, "Move or delete associated products first");
  }

  await category.deleteOne();

  return { message: "Category deleted successfully" };
}
