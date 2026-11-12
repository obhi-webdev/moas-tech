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


export async function getPublicProductById(req, res, next) {
  try {
    const id = req.params.id;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const product = await findProductById(id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    return res.json(product);
  } catch (error) {
    next(error);
  }
}
