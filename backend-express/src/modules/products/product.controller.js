import {
  findProducts,
  findProductBySlug,
  findProductById,
} from "./product.service.js";

import { parseProductQuery } from "./product.validation.js";

export async function listProducts(req, res, next) {
  try {
    const query = parseProductQuery(req.query);
    res.json(await findProducts(query, false));
  } catch (error) {
    next(error);
  }
}

export async function listAdminProducts(req, res, next) {
  try {
    const query = parseProductQuery(req.query);
    res.json(await findProducts(query, true));
  } catch (error) {
    next(error);
  }
}

export async function getProduct(req, res, next) {
  try {
    res.json(await findProductBySlug(req.params.slug));
  } catch (error) {
    next(error);
  }
}

export async function getAdminProduct(req, res, next) {
  try {
    res.json(await findProductById(req.params.id));
  } catch (error) {
    next(error);
  }
}
