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
    <section className="bg-[#f1f3f6] py-9 md:py-11">
      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-7 text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#071724] md:text-[28px]">
            Featured Category
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Get Your Desired Product from Featured Category!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[142px] animate-pulse rounded-md border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No categories available.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group flex min-h-[142px] flex-col items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex h-[70px] w-[70px] items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-xl font-black text-orange-500">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <h3 className="mt-3 line-clamp-2 text-[13px] font-bold leading-5 text-slate-800 transition group-hover:text-orange-500">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
