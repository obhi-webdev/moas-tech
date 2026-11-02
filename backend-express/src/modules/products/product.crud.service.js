import { Product } from "../../models/product.model.js";
import { Category } from "../../models/category.model.js";

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(dto) {
  const slug = slugify(dto.name);
  const sku = dto.sku.trim().toUpperCase();

  if (!slug) {
    fail(400, "Product name must generate a valid slug");
  }

  const category = await Category.findById(dto.category);

  if (!category) {
    fail(400, "Selected category does not exist");
  }

  if (!category.isActive) {
    fail(400, "Selected category is inactive");
  }

  if (
    dto.salePrice != null &&
    dto.salePrice > dto.regularPrice
  ) {
    fail(400, "Sale price cannot exceed regular price");
  }

  const duplicate = await Product.findOne({
    $or: [
      { slug },
      { sku },
    ],
  });

  if (duplicate) {
    fail(409, "Product SKU or slug already exists");
  }

  try {
    const product = await Product.create({
      ...dto,
      slug,
      sku,
    });

    return await Product.findById(product._id)
      .populate("category", "name slug");

  } catch (error) {
    if (error.code === 11000) {
      fail(409, "Product SKU or slug already exists");
    }

    throw error;
  }
}

export async function updateProduct(id, dto) {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    fail(400, "Invalid product ID");
  }

  const product = await Product.findById(id);

  if (!product) {
    fail(404, "Product not found");
  }

  if (dto.category !== undefined) {
    const category = await Category.findById(dto.category);

    if (!category) {
      fail(400, "Selected category does not exist");
    }
  }

  const regularPrice =
    dto.regularPrice ?? product.regularPrice;

  const salePrice =
    dto.salePrice !== undefined
      ? dto.salePrice
      : product.salePrice;

  if (salePrice != null && salePrice > regularPrice) {
    fail(400, "Sale price cannot exceed regular price");
  }

  if (dto.name !== undefined) {
    const slug = slugify(dto.name);

    if (!slug) {
      fail(400, "Invalid product name");
    }

    dto.slug = slug;
  }

  if (dto.sku !== undefined) {
    dto.sku = dto.sku.trim().toUpperCase();
  }

  if (dto.slug !== undefined || dto.sku !== undefined) {
    const conditions = [];

    if (dto.slug !== undefined) {
      conditions.push({ slug: dto.slug });
    }

    if (dto.sku !== undefined) {
      conditions.push({ sku: dto.sku });
    }

    const duplicate = await Product.findOne({
      _id: { $ne: product._id },
      $or: conditions,
    });

    if (duplicate) {
      fail(409, "Product SKU or slug already exists");
    }
  }

  Object.assign(product, dto);

  try {
    await product.save();

    return await Product.findById(product._id)
      .populate("category", "name slug");
  } catch (error) {
    if (error.code === 11000) {
      fail(409, "Product SKU or slug already exists");
    }

    throw error;
  }
}

export async function deleteProduct(id) {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    fail(400, "Invalid product ID");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    fail(404, "Product not found");
  }

  return {
    success: true,
    message: "Product deleted successfully",
  };
}
