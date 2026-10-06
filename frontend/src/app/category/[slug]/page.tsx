"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Header from "@/components/home/Header";
import ProductCard, { Product } from "@/components/home/ProductCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
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

export default function CategoryPage() {
  const params = useParams();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    async function loadCategory() {
      try {
        setLoading(true);
        setError("");

        // Get category information
        const categoryResponse = await fetch(`${API_URL}/categories/${slug}`);

        if (!categoryResponse.ok) {
          throw new Error("Category not found");
        }

        const categoryData: Category = await categoryResponse.json();

        setCategory(categoryData);

        // Get products using category ID
        const productResponse = await fetch(
          `${API_URL}/products?category=${categoryData._id}&limit=50`,
        );

        if (!productResponse.ok) {
          throw new Error("Failed to load products");
        }

        const productData: ProductResponse = await productResponse.json();

        setProducts(productData.products);
      } catch (err) {
        console.error("Category page error:", err);

        setError("Category could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [slug]);

  return (
    <>
      <Header phone="+8809696492358" whatsapp="8809696492358" />

      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-700">
              Home
            </Link>

            <span>/</span>

            <span>{category?.name || "Category"}</span>
          </div>

          {loading && (
            <div className="rounded-lg border border-slate-200 bg-white p-10 shadow-sm">
              <p className="text-slate-500">Loading category...</p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-10">
              <h1 className="text-xl font-bold text-red-700">
                Category not found
              </h1>

              <p className="mt-2 text-sm text-red-600">{error}</p>

              <Link
                href="/"
                className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
              >
                Back to Home
              </Link>
            </div>
          )}

          {!loading && !error && category && (
            <>
              {/* Category Header */}
              <div className="mb-5 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                  Product Category
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">
                  {category.name}
                </h1>

                {category.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {category.description}
                  </p>
                )}

                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {products.length}{" "}
                  {products.length === 1 ? "product" : "products"} found
                </p>
              </div>

              {/* Products */}
              {products.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">
                    No products found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    There are currently no products in this category.
                  </p>

                  <Link
                    href="/shop"
                    className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Browse All Products
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
