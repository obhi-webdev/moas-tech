"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================================
  // LOAD CATEGORIES
  // =========================================

  async function loadCategories() {
    const token = localStorage.getItem("vc-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/categories/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
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

        throw new Error(message || "Categories could not be loaded.");
      }

      setCategories(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.categories)
            ? data.categories
            : [],
      );
    } catch (error) {
      console.error("Category loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Categories could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // =========================================
  // DELETE CATEGORY
  // =========================================

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    const token = localStorage.getItem("vc-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setDeletingId(category._id);
      setError("");

      const response = await fetch(`${API_URL}/categories/${category._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

        throw new Error(message || "Category could not be deleted.");
      }

      setCategories((current) =>
        current.filter((item) => item._id !== category._id),
      );
    } catch (error) {
      console.error("Category delete error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Category could not be deleted.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <AdminLayout
      title="Categories"
      subtitle="Manage VC Tech product categories."
    >
      <div>
        <div className="mb-6 flex justify-end">
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            + Add Category
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="font-semibold text-slate-500">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              No Categories Found
            </h2>

            <p className="mt-2 text-slate-500">
              Create your first product category.
            </p>

            <Link
              href="/admin/categories/new"
              className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Add Category
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-bold text-slate-600">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-slate-600">
                      Slug
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-slate-600">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-bold text-slate-600">
                      Sort
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-bold text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-400">
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-slate-900">
                              {category.name}
                            </p>

                            {category.description && (
                              <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {category.slug}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            category.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {category.sortOrder ?? 0}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/categories/${category._id}/edit`}
                            className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            disabled={deletingId === category._id}
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                          >
                            {deletingId === category._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
