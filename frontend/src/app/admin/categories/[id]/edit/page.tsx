"use client";

import Link from "next/link";
import { FormEvent, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCategoryPage({ params }: PageProps) {
  const router = useRouter();

  const { id } = use(params);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // LOAD CATEGORY
  // =========================================

  useEffect(() => {
    async function loadCategory() {
      const token = localStorage.getItem("vc-tech-admin-token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/categories/admin/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        let data: Category | any = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (response.status === 401) {
          localStorage.removeItem("vc-tech-admin-token");

          localStorage.removeItem("vc-tech-admin-user");

          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          const message = Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

          throw new Error(message || "Category could not be loaded.");
        }

        setName(data.name || "");
        setSlug(data.slug || "");
        setDescription(data.description || "");
        setImage(data.image || "");
        setSortOrder(String(data.sortOrder ?? 0));
        setIsActive(data.isActive ?? true);
      } catch (error) {
        console.error("Category loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Category could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCategory();
    }
  }, [id, router]);

  // =========================================
  // UPDATE CATEGORY
  // =========================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("vc-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Category name must contain at least 2 characters.");
      return;
    }

    const numericSortOrder = Number(sortOrder);

    if (!Number.isInteger(numericSortOrder) || numericSortOrder < 0) {
      setError("Sort order must be zero or a positive whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * IMPORTANT:
       *
       * UpdateCategoryDto accepts ONLY:
       *
       * name
       * description
       * image
       * isActive
       * sortOrder
       *
       * DO NOT send slug.
       *
       * Backend CategoriesService automatically
       * regenerates slug when name changes.
       */

      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        isActive,
        sortOrder: numericSortOrder,
      };

      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        localStorage.removeItem("vc-tech-admin-token");

        localStorage.removeItem("vc-tech-admin-user");

        router.replace("/admin/login");

        return;
      }

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Category could not be updated.");
      }

      router.push("/admin/categories");

      router.refresh();
    } catch (error) {
      console.error("Category update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Category could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white px-10 py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-600">
            Loading category...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <AdminLayout
      title="Edit Category"
      subtitle="Update category information and storefront visibility."
    >
      <div className="mx-auto max-w-4xl">

        <div className="mb-6">
          <Link
            href="/admin/categories"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Categories
          </Link>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Category Information
            </h2>

            <div className="mt-6 space-y-5">
              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category Name *
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* CURRENT SLUG */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Slug is generated automatically from the category name.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="Category description"
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* IMAGE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Image URL
                </label>

                <input
                  type="text"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://example.com/category.jpg"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                {image.trim() && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Image Preview
                    </p>

                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SETTINGS */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Category Settings
            </h2>

            <div className="mt-6 space-y-5">
              {/* SORT ORDER */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Lower numbers appear before higher numbers.
                </p>
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Active Category
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Show this category on the public store.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-5 w-5 accent-orange-500"
                />
              </label>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
            <Link
              href="/admin/categories"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-8 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
