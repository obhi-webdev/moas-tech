"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category?: Category;
  brand?: string;
  images: string[];
  regularPrice: number;
  salePrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOffer: boolean;
  createdAt: string;
}

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

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD").format(price || 0);
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  async function loadProducts() {
    const token = localStorage.getItem(
      "moas-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem(
          "moas-tech-admin-token",
        );

        localStorage.removeItem(
          "moas-tech-admin-user",
        );

        router.replace("/admin/login");
        return;
      }

      const data: ProductResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "Products could not be loaded.",
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Products loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Products could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function deleteProduct(
    id: string,
    name: string,
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`,
    );

    if (!confirmed) return;

    const token = localStorage.getItem(
      "moas-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${API_URL}/products/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        throw new Error(
          message || "Product could not be deleted.",
        );
      }

      setProducts((current) =>
        current.filter(
          (product) => product._id !== id,
        ),
      );
    } catch (error) {
      console.error("Product delete error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Product could not be deleted.",
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage products, pricing and inventory."
    >
      <div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

<div />

          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
          >
            + Add Product
          </Link>

        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-bold text-slate-900">
                No products found
              </h3>

              <Link
                href="/admin/products/new"
                className="mt-4 inline-flex rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
              >
                Add First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px]">

                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Category
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Stock
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {products.map((product) => {
                    const displayPrice =
                      product.salePrice &&
                      product.salePrice > 0
                        ? product.salePrice
                        : product.regularPrice;

                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">

                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">

                              {product.images?.[0] ? (
                                <img
                                  src={
                                    product.images[0]
                                  }
                                  alt={product.name}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <span className="text-xs text-slate-400">
                                  No Image
                                </span>
                              )}

                            </div>

                            <div>
                              <p className="font-bold text-slate-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                SKU: {product.sku}
                              </p>

                              {product.brand && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {product.brand}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {product.category?.name ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">
                            ৳
                            {formatPrice(
                              displayPrice,
                            )}
                          </p>

                          {product.salePrice &&
                            product.salePrice > 0 &&
                            product.salePrice <
                              product.regularPrice && (
                              <p className="mt-1 text-xs text-slate-400 line-through">
                                ৳
                                {formatPrice(
                                  product.regularPrice,
                                )}
                              </p>
                            )}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : product.stock <= 5
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {product.stock === 0
                              ? "Out of Stock"
                              : `${product.stock} in stock`}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex flex-wrap gap-2">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                product.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {product.isActive
                                ? "Active"
                                : "Inactive"}
                            </span>

                            {product.isFeatured && (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                Featured
                              </span>
                            )}

                            {product.isOffer && (
                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                Offer
                              </span>
                            )}

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                              View
                            </Link>

                            <Link
                              href={`/admin/products/${product._id}/edit`}
                              className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                            >
                              Edit
                            </Link>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                product._id
                              }
                              onClick={() =>
                                deleteProduct(
                                  product._id,
                                  product.name,
                                )
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId ===
                              product._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>

            </div>
          )}

        </section>
      </div>
    </AdminLayout>
  );
}
