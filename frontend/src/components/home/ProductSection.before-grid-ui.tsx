"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ProductCard, {
  Product,
} from "@/components/home/ProductCard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

interface ProductResponse {
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  query?: string;
  viewAllHref?: string;
}

export default function ProductSection({
  title,
  subtitle,
  query = "",
  viewAllHref = "/shop",
}: ProductSectionProps) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const separator =
          query.trim() ? "&" : "";

        const response = await fetch(
          `${API_URL}/products?${query}${separator}limit=8`,
          {
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as ProductResponse & {
            message?: string | string[];
          };

        if (!response.ok) {
          const message =
            Array.isArray(data.message)
              ? data.message.join(", ")
              : data.message;

          throw new Error(
            message ||
              "Products could not be loaded.",
          );
        }

        setProducts(
          Array.isArray(data.products)
            ? data.products
            : [],
        );
      } catch (error) {
        console.error(
          `${title} loading error:`,
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
    }

    loadProducts();
  }, [query, title]);

  if (
    !loading &&
    !error &&
    products.length === 0
  ) {
    return null;
  }

  return (
    <section className="bg-[#f1f3f6] py-9 md:py-11">
      <div className="mx-auto max-w-7xl px-4">

        {/* Section Header */}

        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            href={viewAllHref}
            className="shrink-0 text-sm font-semibold text-orange-500 transition hover:text-orange-600"
          >
            View All →
          </Link>
        </div>

        {/* Loading */}

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-md border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Products */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map(
                (product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ),
              )}
            </div>
          )}
      </div>
    </section>
  );
}
