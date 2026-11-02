import { Category } from "../../models/category.model.js";

import {
  createCategorySchema,
  validateCategoryInput,
} from "./category.crud.validation.js";

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategoryHandler(req, res, next) {
  try {
    const dto = validateCategoryInput(
      createCategorySchema,
      req.body
    );

    const slug = createSlug(dto.name);

    if (!slug) {
      return res.status(400).json({
        message: "Invalid category name for slug generation",
      });
    }

    const duplicate = await Category.findOne({
      $or: [{ name: dto.name }, { slug }],
    });

    if (duplicate) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    if (dto.parentCategory) {
      const parent = await Category.findById(dto.parentCategory);

      if (!parent) {
        return res.status(404).json({
          message: "Parent category not found",
        });
      }

      if (parent.parentCategory) {
        return res.status(400).json({
          message: "Nested subcategories are not allowed",
        });
      }
    }

    const category = await Category.create({
      ...dto,
      slug,
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    next(error);
  }
}

import {
  updateCategory,
  deleteCategory,
} from "./category.update-delete.service.js";

import {
  updateCategorySchema,
  validateCategoryInput as validateUpdateInput,
} from "./category.crud.validation.js";

export async function updateCategoryHandler(req, res, next) {
  try {
    const dto = validateUpdateInput(updateCategorySchema, req.body);
    const category = await updateCategory(req.params.id, dto);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategoryHandler(req, res, next) {
  try {
    const result = await deleteCategory(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
