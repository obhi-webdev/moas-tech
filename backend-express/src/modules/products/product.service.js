import mongoose from "mongoose";
import { Product } from "../../models/product.model.js";
import "../../models/category.model.js";

export async function findProducts(query, admin = false) {
  const {
    page,
    limit,
    category,
    brand,
    search,
    featured,
    offer,
    sort,
  } = query;

  const filter = {};

  if (!admin) filter.isActive = true;

  if (category) filter.category = category;

  if (brand) {
    filter.brand = {
      $regex: brand.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  if (featured !== undefined) filter.isFeatured = featured;
  if (offer !== undefined) filter.isOffer = offer;

  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  let sorting = {
    sortOrder: 1,
    createdAt: -1,
  };

  switch (sort) {
    case "price-low":
      sorting = { salePrice: 1, regularPrice: 1 };
      break;
    case "price-high":
      sorting = { salePrice: -1, regularPrice: -1 };
      break;
    case "oldest":
      sorting = { createdAt: 1 };
      break;
    case "newest":
      sorting = { createdAt: -1 };
      break;
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sorting)
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function findProductBySlug(slug) {
  const product = await Product.findOne({
    slug,
    isActive: true,
  })
    .populate("category", "name slug")
    .lean();

  if (!product) {
    throw Object.assign(new Error("Product not found"), {
      status: 404,
    });
  }

  return product;
}

export async function findProductById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw Object.assign(new Error("Invalid product ID"), {
      status: 400,
    });
  }

  const product = await Product.findById(id)
    .populate("category", "name slug");

  if (!product) {
    throw Object.assign(new Error("Product not found"), {
      status: 404,
    });
  }

  return product;
}
