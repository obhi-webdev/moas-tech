"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) return;

        const data: Category[] = await response.json();

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Category loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <section className="bg-[#f1f3f6] py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-7 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Featured Category
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Get Your Desired Product from Featured Category!
          </p>
        </div>

        {loading ? (
          <p className="text-center text-sm text-slate-500">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-sm text-slate-500">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group flex min-h-[145px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center transition duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl font-black text-slate-500">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h3 className="mt-4 line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-orange-500">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/shop"
            className="inline-flex rounded-md bg-[#071724] px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
