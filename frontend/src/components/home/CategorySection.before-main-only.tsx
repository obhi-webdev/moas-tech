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

  /*
   * Duplicate categories so the track can loop seamlessly.
   */
  const loopCategories =
    categories.length > 0
      ? [...categories, ...categories]
      : [];

  return (
    <section className="overflow-hidden bg-[#f1f3f6] py-9 md:py-11">
      <div className="mx-auto max-w-7xl px-4">

        {/* Heading */}

        <div className="mb-7 text-center">
          <h2 className="text-2xl font-black tracking-tight text-[#071724] md:text-[28px]">
            Featured Category
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Get Your Desired Product from Featured Category!
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[140px] animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
        )}

        {/* Categories */}

        {!loading && categories.length > 0 && (
          <div className="category-marquee relative overflow-hidden">

            {/* soft edge fades */}

            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-[#f1f3f6] to-transparent md:w-16" />

            <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#f1f3f6] to-transparent md:w-16" />

            <div className="category-track flex w-max gap-3 py-2">
              {loopCategories.map((category, index) => (
                <Link
                  key={`${category._id}-${index}`}
                  href={`/category/${category.slug}`}
                  className="group flex h-[140px] w-[145px] shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-lg sm:w-[155px]"
                >
                  <div className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-xl font-black text-orange-500 transition duration-300 group-hover:bg-orange-500 group-hover:text-white">
                        {category.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-[13px] font-bold leading-5 text-slate-800 transition-colors duration-300 group-hover:text-orange-500">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No categories available.
          </div>
        )}

      </div>

      <style jsx>{`
        .category-marquee {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 4%,
            black 96%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 4%,
            black 96%,
            transparent
          );
        }

        .category-track {
          animation: category-scroll 32s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        @media (hover: hover) {
          .category-marquee:hover .category-track {
            animation-play-state: paused;
          }
        }

        @keyframes category-scroll {
          0% {
            transform: translate3d(0, 0, 0);
          }

          100% {
            transform: translate3d(
              calc(-50% - 0.375rem),
              0,
              0
            );
          }
        }

        @media (max-width: 640px) {
          .category-track {
            animation-duration: 25s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .category-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
