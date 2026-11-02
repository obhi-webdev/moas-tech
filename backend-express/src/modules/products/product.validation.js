import mongoose from "mongoose";

export function parseProductQuery(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw Object.assign(new Error("Invalid page"), { status: 400 });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw Object.assign(new Error("Limit must be between 1 and 50"), {
      status: 400,
    });
  }

  if (
    query.category !== undefined &&
    !mongoose.isObjectIdOrHexString(query.category)
  ) {
    throw Object.assign(new Error("Invalid category ID"), {
      status: 400,
    });
  }

  const parseBoolean = (value, field) => {
    if (value === undefined) return undefined;
    if (value === "true") return true;
    if (value === "false") return false;

    throw Object.assign(new Error(`Invalid ${field} value`), {
      status: 400,
    });
  };

  for (const key of Object.keys(query)) {
    if (![
      "page", "limit", "category", "brand",
      "search", "featured", "offer", "sort"
    ].includes(key)) {
      throw Object.assign(new Error(`Unknown query field: ${key}`), {
        status: 400,
      });
    }
  }

  for (const field of ["category", "brand", "search", "sort"]) {
    if (query[field] !== undefined && typeof query[field] !== "string") {
      throw Object.assign(new Error(`Invalid ${field} value`), {
        status: 400,
      });
    }
  }

  return {
    page,
    limit,
    category: query.category,
    brand: query.brand,
    search: query.search,
    featured: parseBoolean(query.featured, "featured"),
    offer: parseBoolean(query.offer, "offer"),
    sort: query.sort,
  };
}
