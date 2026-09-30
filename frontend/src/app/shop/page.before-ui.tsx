"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Header from "@/components/home/Header";
import ProductCard, {
  Product,
} from "@/components/home/ProductCard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ProductResponse {
  products: Product[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const INITIAL_PAGINATION: Pagination = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default function ShopPage() {
  // =========================================
  // PRODUCTS
  // =========================================

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================
  // CATEGORIES
  // =========================================

  const [categories, setCategories] = useState<Category[]>([]);

  // =========================================
  // FILTERS
  // =========================================


  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.trim() || "";
  const featured = searchParams.get("featured") === "true";
  const offer = searchParams.get("offer") === "true";

  const [category, setCategory] = useState("");

  const [sort, setSort] = useState("newest");

  const [page, setPage] = useState(1);

  // =========================================
  // PAGINATION
  // =========================================

  const [pagination, setPagination] =
    useState<Pagination>(INITIAL_PAGINATION);

  // =========================================
  // LOAD CATEGORIES
  // =========================================

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(
          `${API_URL}/categories`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Categories could not be loaded.",
          );
        }

        const data: Category[] =
          await response.json();

        setCategories(
          Array.isArray(data) ? data : [],
        );
      } catch (error) {
        console.error(
          "Category loading error:",
          error,
        );
      }
    }

    loadCategories();
  }, []);

  // =========================================
  // LOAD PRODUCTS
  // =========================================

  const loadProducts = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page),
        );

        params.set(
          "limit",
          "12",
        );

        if (search.trim()) {
          params.set(
            "search",
            search.trim(),
          );
        }

        if (category) {
          params.set(
            "category",
            category,
          );
        }

        if (featured) {
          params.set(
            "featured",
            "true",
          );
        }

        if (offer) {
          params.set(
            "offer",
            "true",
          );
        }

        if (sort) {
          params.set(
            "sort",
            sort,
          );
        }

        const response = await fetch(
          `${API_URL}/products?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        let data: ProductResponse | null =
          null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (!response.ok) {
          const responseData =
            data as unknown as {
              message?: string | string[];
            } | null;

          const message =
            Array.isArray(
              responseData?.message,
            )
              ? responseData.message.join(
                  ", ",
                )
              : responseData?.message;

          throw new Error(
            message ||
              "Products could not be loaded.",
          );
        }

        setProducts(
          Array.isArray(data?.products)
            ? data.products
            : [],
        );

        if (data?.pagination) {
          setPagination(
            data.pagination,
          );
        } else {
          setPagination(
            INITIAL_PAGINATION,
          );
        }
      } catch (error) {
        console.error(
          "Shop products error:",
          error,
        );

        setProducts([]);

        setError(
          error instanceof Error
            ? error.message
            : "Products could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      search,
      category,
      sort,
      featured,
      offer,
    ],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // =========================================
  // SEARCH
  // =========================================


  // =========================================
  // CATEGORY
  // =========================================

  function handleCategoryChange(
    value: string,
  ) {
    setCategory(value);

    setPage(1);
  }

  // =========================================
  // SORT
  // =========================================

  function handleSortChange(
    value: string,
  ) {
    setSort(value);

    setPage(1);
  }

  // =========================================
  // CLEAR FILTERS
  // =========================================

  function clearFilters() {


    setCategory("");

    setSort("newest");

    setPage(1);
  }

  // =========================================
  // PAGINATION
  // =========================================

  function goToPreviousPage() {
    if (
      !pagination.hasPreviousPage ||
      loading
    ) {
      return;
    }

    setPage((current) =>
      Math.max(
        current - 1,
        1,
      ),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToNextPage() {
    if (
      !pagination.hasNextPage ||
      loading
    ) {
      return;
    }

    setPage(
      (current) =>
        current + 1,
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      <Header
        phone="01614106550"
        whatsapp="01614106550"
      />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">

          {/* =================================
              BREADCRUMB
          ================================= */}

          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="transition hover:text-blue-700"
            >
              Home
            </Link>

            <span>/</span>

            <span className="font-medium text-slate-900">
              Shop
            </span>
          </div>

          {/* =================================
              PAGE HEADER
          ================================= */}

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              MOAS Tech
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              All Products
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
              Find laptops, computers,
              accessories and technology
              products from MOAS Tech.
            </p>
          </section>

          {/* =================================
              FILTERS
          ================================= */}

          <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]">

              {/* Search */}


              {/* Category */}

              <select
                value={category}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600"
              >
                <option value="">
                  All Categories
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>

              {/* Sort */}

              <select
                value={sort}
                onChange={(event) =>
                  handleSortChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600"
              >
                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

              {/* Clear */}

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </section>

          {/* =================================
              RESULT INFORMATION
          ================================= */}

          {!loading && !error && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-900">
                  {pagination.total}
                </span>{" "}
                {pagination.total === 1
                  ? "product"
                  : "products"}{" "}
                found
              </p>

              {pagination.totalPages >
                0 && (
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-900">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {pagination.totalPages}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* =================================
              LOADING
          ================================= */}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-700" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading products...
              </p>
            </div>
          )}

          {/* =================================
              ERROR
          ================================= */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
              <h2 className="text-xl font-bold text-red-700">
                Products could not be
                loaded
              </h2>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadProducts()
                }
                className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Try Again
              </button>
            </div>
          )}

          {/* =================================
              EMPTY
          ================================= */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <h2 className="text-xl font-bold text-slate-900">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search
                  or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Clear Filters
                </button>
              </div>
            )}

          {/* =================================
              PRODUCTS
          ================================= */}

          {!loading &&
            !error &&
            products.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {products.map(
                    (product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    ),
                  )}
                </div>

                {/* =============================
                    PAGINATION
                ============================= */}

                {pagination.totalPages >
                  1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={
                        goToPreviousPage
                      }
                      disabled={
                        !pagination.hasPreviousPage ||
                        loading
                      }
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <div className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
                      {pagination.page} /{" "}
                      {
                        pagination.totalPages
                      }
                    </div>

                    <button
                      type="button"
                      onClick={
                        goToNextPage
                      }
                      disabled={
                        !pagination.hasNextPage ||
                        loading
                      }
                      className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
        </div>
      </main>
    </>
  );
}
