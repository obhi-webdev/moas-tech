"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function AddCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // AUTH CHECK
  // =========================================

  useEffect(() => {
    const token = localStorage.getItem("moas-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
    }
  }, [router]);

  // =========================================
  // CREATE CATEGORY
  // =========================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("moas-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    const numericSortOrder = Number(sortOrder);

    if (!Number.isFinite(numericSortOrder) || numericSortOrder < 0) {
      setError("Sort order must be zero or a positive number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // IMPORTANT:
      // slug is NOT sent.
      // Backend generates slug from category name.
      const payload = {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        isActive,
        sortOrder: numericSortOrder,
      };

      const response = await fetch(`${API_URL}/categories`, {
        method: "POST",
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
        localStorage.removeItem("moas-tech-admin-token");
        localStorage.removeItem("moas-tech-admin-user");

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Category could not be created.");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Create category error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Category could not be created.",
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <AdminLayout
      title="Add Category"
      subtitle="Create a new product category for VS Tech."
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
          {/* CATEGORY INFORMATION */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Category Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the basic information for this category.
            </p>

            <div className="mt-6 space-y-5">
              {/* NAME */}

              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Category Name *
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Example: Desktop"
                  required
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  The backend will automatically create the category slug.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="Example: Desktop computers, custom PCs and accessories."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* IMAGE URL */}

              <div>
                <label
                  htmlFor="category-image"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Image URL
                </label>

                <input
                  id="category-image"
                  type="text"
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://example.com/category.jpg"
                  autoComplete="off"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Optional. You can leave this blank for now.
                </p>

                {image.trim() && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Image Preview
                    </p>

                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      <img
                        src={image}
                        alt="Category preview"
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

            <p className="mt-1 text-sm text-slate-500">
              Control category visibility and display order.
            </p>

            <div className="mt-6 space-y-5">
              {/* SORT ORDER */}

              <div>
                <label
                  htmlFor="sort-order"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Sort Order
                </label>

                <input
                  id="sort-order"
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Lower numbers appear before higher numbers.
                </p>
              </div>

              {/* ACTIVE STATUS */}

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Active Category
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Allow this category to appear on the storefront.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-5 w-5 cursor-pointer accent-orange-500"
                />
              </label>
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
            <Link
              href="/admin/categories"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-8 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
