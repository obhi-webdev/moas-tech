import {
  findCategories,
  findMainCategories,
  findSubcategories,
  findCategoryBySlug,
  findCategoryById,
} from "./category.service.js";

export async function listCategories(req, res, next) {
  try {
    res.json(await findCategories(false));
  } catch (error) {
    next(error);
  }
}

export async function listAdminCategories(req, res, next) {
  try {
    res.json(await findCategories(true));
  } catch (error) {
    next(error);
  }
}

export async function getAdminCategory(req, res, next) {
  try {
    res.json(await findCategoryById(req.params.id));
  } catch (error) {
    next(error);
  }
}

export async function listMainCategories(req, res, next) {
  try {
    res.json(await findMainCategories(false));
  } catch (error) {
    next(error);
  }
}

export async function listSubcategories(req, res, next) {
  try {
    res.json(await findSubcategories(req.params.parentId, false));
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req, res, next) {
  try {
    res.json(await findCategoryBySlug(req.params.slug));
  } catch (error) {
    next(error);
  }
}
