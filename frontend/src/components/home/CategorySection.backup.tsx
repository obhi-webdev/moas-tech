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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data: Category[] = await response.json();

        setCategories(data);
      } catch (err) {
        console.error(err);
        setError("Categories could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm text-slate-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
              Categories
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Shop by Category
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Find the right tech products for your needs.
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden text-sm font-semibold text-blue-700 hover:text-blue-800 sm:block"
          >
            View All Products →
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No categories available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-bold text-blue-700">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h3 className="mt-4 text-center font-semibold text-slate-900 group-hover:text-blue-700">
                  {category.name}
                </h3>

                {category.description && (
                  <p className="mt-1 line-clamp-2 text-center text-xs leading-5 text-slate-500">
                    {category.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
