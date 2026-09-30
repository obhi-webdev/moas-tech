"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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


  const router = useRouter();
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

    router.push("/shop");
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

      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">

          {/* =================================
              BREADCRUMB
          ================================= */}

          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
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

          <section className="mb-5 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              MOAS Tech
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              All Products
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Find laptops, computers,
              accessories and technology
              products from MOAS Tech.
            </p>
          </section>

          {/* =================================
              FILTERS
          ================================= */}

          <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">

              {/* Search */}


              {/* Category */}

              <select
                value={category}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value,
                  )
                }
                className="w-full cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                className="w-full cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-all duration-300 hover:border-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500 active:scale-[0.97]"
              >
                Clear
              </button>
            </div>
          </section>

          {/* ACTIVE FILTERS */}

          {(search || category || featured || offer) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-slate-500">
                Active:
              </span>

              {search && (
                <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
                  Search: “{search}”
                </span>
              )}

              {category && (
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Category:{" "}
                  {categories.find(
                    (item) => item._id === category,
                  )?.name || "Selected"}
                </span>
              )}

              {featured && (
                <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                  Featured
                </span>
              )}

              {offer && (
                <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                  Special Offers
                </span>
              )}
            </div>
          )}

          {/* =================================
              RESULT INFORMATION
          ================================= */}

          {!loading && !error && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="h-[135px] animate-pulse bg-slate-100 sm:h-[165px] md:h-[180px]" />

                    <div className="space-y-3 border-t border-slate-100 p-3 sm:p-4">
                      <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />

                      <div className="space-y-2">
                        <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
                        <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
                      </div>

                      <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />

                      <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {/* =================================
              ERROR
          ================================= */}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-10 text-center">
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
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map(
                    (product) => (
                      <div
                        key={product._id}
                        className="shop-product-enter"
                      >
                        <ProductCard
                          product={product}
                        />
                      </div>
                    ),
                  )}
                </div>

                {/* =============================
                    PAGINATION
                ============================= */}

                {pagination.totalPages >
                  1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={
                        goToPreviousPage
                      }
                      disabled={
                        !pagination.hasPreviousPage ||
                        loading
                      }
                      className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
                    >
                      ← Previous
                    </button>

                    <div className="rounded-md bg-[#071724] px-5 py-2.5 text-sm font-bold text-white">
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
                      className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500 active:translate-y-0 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
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
