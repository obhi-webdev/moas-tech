"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
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

function ShopContent() {
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

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const category =
    searchParams.get("category") || "";

  const sort =
    searchParams.get("sort") || "newest";

  const pageParam = Number(
    searchParams.get("page") || "1",
  );

  const page =
    Number.isInteger(pageParam) && pageParam > 0
      ? pageParam
      : 1;

  function updateShopParams(
    updates: Record<string, string | null>,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === "" ||
          (key === "sort" && value === "newest") ||
          (key === "page" && value === "1")
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      },
    );

    const query = params.toString();

    router.push(
      query ? `/shop?${query}` : "/shop",
      {
        scroll: false,
      },
    );
  }

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
    updateShopParams({
      category: value || null,
      page: null,
    });
  }

  // =========================================
  // SORT
  // =========================================

  function handleSortChange(
    value: string,
  ) {
    updateShopParams({
      sort:
        value === "newest"
          ? null
          : value,
      page: null,
    });
  }

  // =========================================
  // CLEAR FILTERS
  // =========================================

  function clearFilters() {
    router.push("/shop");
  }

  // =========================================
  // PAGINATION
  // =========================================

  function scrollToProducts() {
    window.setTimeout(() => {
      const element =
        document.getElementById(
          "shop-products",
        );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 50);
  }

  function goToPreviousPage() {
    if (
      !pagination.hasPreviousPage ||
      loading
    ) {
      return;
    }

    updateShopParams({
      page: String(
        Math.max(page - 1, 1),
      ),
    });

    scrollToProducts();
  }

  function goToNextPage() {
    if (
      !pagination.hasNextPage ||
      loading
    ) {
      return;
    }

    updateShopParams({
      page: String(page + 1),
    });

    scrollToProducts();
  }

  function goToPage(targetPage: number) {
    if (
      loading ||
      targetPage === page ||
      targetPage < 1 ||
      targetPage > pagination.totalPages
    ) {
      return;
    }

    updateShopParams({
      page: String(targetPage),
    });

    scrollToProducts();
  }

  function getPaginationItems() {
    const total = pagination.totalPages;
    const current = pagination.page;

    if (total <= 7) {
      return Array.from(
        { length: total },
        (_, index) => index + 1,
      );
    }

    const items: Array<number | "..."> = [1];

    if (current > 4) {
      items.push("...");
    }

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (current < total - 3) {
      items.push("...");
    }

    items.push(total);

    return items;
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      <Header
        phone="+8809696492358"
        whatsapp="8809696492358"
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
              VC Tech
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
              All Products
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Find laptops, computers,
              accessories and technology
              products from VC Tech.
            </p>
          </section>

          {/* =================================
              FILTERS
          ================================= */}

          <section className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

            {/* Mobile Filter Toggle */}

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  (current) => !current,
                )
              }
              aria-expanded={mobileFiltersOpen}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left md:hidden"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-50 text-orange-500">
                  ☰
                </span>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Filter & Sort
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {category || sort !== "newest"
                      ? "Filters applied"
                      : "Refine products"}
                  </p>
                </div>
              </div>

              <span
                className={`text-lg text-slate-500 transition-transform duration-300 ${
                  mobileFiltersOpen
                    ? "rotate-180"
                    : ""
                }`}
              >
                ⌄
              </span>
            </button>

            {/* Filters */}

            <div
              className={`grid transition-all duration-300 ease-out md:grid-rows-[1fr] ${
                mobileFiltersOpen
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden md:overflow-visible">
                <div className="border-t border-slate-100 p-4 md:border-t-0">
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">

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
                </div>
              </div>
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
              <div
                id="shop-products"
                className="scroll-mt-28"
              >
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

                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex w-full items-center justify-center">

                    <div className="flex max-w-full items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:gap-2 sm:p-2">

                      {/* Previous */}

                      <button
                        type="button"
                        onClick={goToPreviousPage}
                        disabled={
                          !pagination.hasPreviousPage ||
                          loading
                        }
                        aria-label="Previous page"
                        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:px-4"
                      >
                        <span className="sm:hidden">
                          ←
                        </span>

                        <span className="hidden sm:inline">
                          ← Previous
                        </span>
                      </button>

                      {/* Page Numbers */}

                      <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                        {getPaginationItems().map(
                          (item, index) =>
                            item === "..." ? (
                              <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 min-w-5 items-center justify-center text-xs font-bold text-slate-400 sm:h-10 sm:min-w-7 sm:text-sm"
                              >
                                …
                              </span>
                            ) : (
                              <button
                                key={item}
                                type="button"
                                onClick={() =>
                                  goToPage(item)
                                }
                                aria-label={`Go to page ${item}`}
                                aria-current={
                                  item === pagination.page
                                    ? "page"
                                    : undefined
                                }
                                className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-bold transition-all duration-300 active:scale-95 sm:h-10 sm:min-w-10 sm:px-3 sm:text-sm ${
                                  item === pagination.page
                                    ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500"
                                }`}
                              >
                                {item}
                              </button>
                            ),
                        )}
                      </div>

                      {/* Next */}

                      <button
                        type="button"
                        onClick={goToNextPage}
                        disabled={
                          !pagination.hasNextPage ||
                          loading
                        }
                        aria-label="Next page"
                        className="flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-sm font-bold text-slate-700 transition-all duration-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 sm:h-10 sm:px-4"
                      >
                        <span className="sm:hidden">
                          →
                        </span>

                        <span className="hidden sm:inline">
                          Next →
                        </span>
                      </button>

                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </main>
    </>
  );
}


export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopContent />
    </Suspense>
  );
}
