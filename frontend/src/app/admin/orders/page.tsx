"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentMethod: string;
  paymentStatus: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface OrdersResponse {
  orders: Order[];
  pagination: Pagination;
}

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  // =========================================
  // LOAD ORDERS
  // =========================================

  useEffect(() => {
    async function loadOrders() {
      const token = localStorage.getItem("moas-tech-admin-token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/orders/admin/all?page=${page}&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        let data: OrdersResponse | any = null;

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

          throw new Error(message || "Orders could not be loaded.");
        }

        setOrders(Array.isArray(data?.orders) ? data.orders : []);

        setPagination(data?.pagination || null);
      } catch (error) {
        console.error("Orders loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Orders could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [page, router]);

  // =========================================
  // HELPERS
  // =========================================

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-BD").format(Number(value || 0));
  }

  function formatDate(value: string) {
    const date = new Date(value);

    return new Intl.DateTimeFormat("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function statusClass(status: Order["status"]) {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700";

      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "processing":
        return "bg-purple-50 text-purple-700";

      case "shipped":
        return "bg-cyan-50 text-cyan-700";

      case "delivered":
        return "bg-green-50 text-green-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <AdminLayout
      title="Orders"
      subtitle="Manage customer orders and fulfillment."
    >
      <div>
        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        {pagination && !loading && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Orders</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pagination.total}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Current Page</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pagination.page}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Pages</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {pagination.totalPages}
              </p>
            </div>
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

            <p className="mt-4 font-semibold text-slate-500">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY */

          <div className="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              No Orders Found
            </h2>

            <p className="mt-2 text-slate-500">
              Customer orders will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* TABLE */}

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Order
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Items
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Total
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Payment
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        {/* ORDER */}

                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-900">
                            {order.orderNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-5 py-5">
                          <p className="font-semibold text-slate-900">
                            {order.customerName}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {order.phone}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.district}
                          </p>
                        </td>

                        {/* ITEMS */}

                        <td className="px-5 py-5">
                          <p className="font-semibold text-slate-700">
                            {order.items.reduce(
                              (total, item) => total + item.quantity,
                              0,
                            )}{" "}
                            item(s)
                          </p>

                          {order.items[0] && (
                            <p className="mt-1 max-w-[220px] truncate text-sm text-slate-500">
                              {order.items[0].name}
                            </p>
                          )}
                        </td>

                        {/* TOTAL */}

                        <td className="px-5 py-5">
                          <p className="font-bold text-slate-900">
                            ৳{formatMoney(order.total)}
                          </p>

                          {order.deliveryCharge > 0 && (
                            <p className="mt-1 text-xs text-slate-500">
                              Delivery: ৳{formatMoney(order.deliveryCharge)}
                            </p>
                          )}
                        </td>

                        {/* PAYMENT */}

                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold uppercase text-slate-700">
                            {order.paymentMethod}
                          </p>

                          <p className="mt-1 text-xs capitalize text-slate-500">
                            {order.paymentStatus}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-5 text-right">
                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="inline-flex rounded-lg bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  disabled={!pagination.hasPreviousPage || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <p className="text-sm font-semibold text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </p>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
