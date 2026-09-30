"use client";

import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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

  status: OrderStatus;

  paymentMethod: string;
  paymentStatus: string;

  note?: string;

  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // AUTH ERROR
  // =========================================

  function handleUnauthorized() {
    localStorage.removeItem("moas-tech-admin-token");
    localStorage.removeItem("moas-tech-admin-user");

    router.replace("/admin/login");
  }

  // =========================================
  // LOAD ORDER
  // =========================================

  useEffect(() => {
    async function loadOrder() {
      const token = localStorage.getItem("moas-tech-admin-token");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/orders/admin/${id}`, {
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
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          const message = Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

          throw new Error(message || "Order could not be loaded.");
        }

        setOrder(data);
        setSelectedStatus(data.status);
      } catch (error) {
        console.error("Order loading error:", error);

        setError(
          error instanceof Error ? error.message : "Order could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadOrder();
    }
  }, [id, router]);

  // =========================================
  // UPDATE STATUS
  // =========================================

  async function handleStatusUpdate() {
    if (!order) return;

    const token = localStorage.getItem("moas-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (selectedStatus === order.status) {
      setError("Please select a different order status.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/orders/admin/${order._id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: selectedStatus,
          }),
        },
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Order status could not be updated.");
      }

      /*
       * Your API previously returned:
       *
       * {
       *   message: "...",
       *   order: {...}
       * }
       *
       * Handle both that format and a direct order response.
       */

      const updatedOrder = data?.order || data;

      if (updatedOrder?._id) {
        setOrder(updatedOrder);
        setSelectedStatus(updatedOrder.status);
      } else {
        setOrder((current) =>
          current
            ? {
                ...current,
                status: selectedStatus,
              }
            : current,
        );
      }

      setSuccess("Order status updated successfully.");
    } catch (error) {
      console.error("Status update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Order status could not be updated.",
      );
    } finally {
      setUpdating(false);
    }
  }

  // =========================================
  // HELPERS
  // =========================================

  function formatMoney(value: number) {
    return new Intl.NumberFormat("en-BD").format(Number(value || 0));
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  function statusClass(status: OrderStatus) {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "processing":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "shipped":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm px-12 py-10 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-semibold text-slate-600">Loading order...</p>
        </div>
      </div>
    );
  }

  // =========================================
  // ORDER NOT FOUND / ERROR
  // =========================================

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Order Not Available
          </h1>

          <p className="mt-3 text-slate-500">
            {error || "The requested order could not be found."}
          </p>

          <Link
            href="/admin/orders"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <AdminLayout
      title={`Order ${order.orderNumber}`}
      subtitle={`Placed ${formatDate(order.createdAt)}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* TOP ACTIONS */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/admin/orders"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Orders
          </Link>

          <span
            className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-bold capitalize ${statusClass(
              order.status,
            )}`}
          >
            {order.status}
          </span>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 font-medium text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}

          <div className="space-y-6">
            {/* PRODUCTS */}

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Ordered Products
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.product}-${index}`}
                    className="flex gap-4 p-6"
                  >
                    {/* IMAGE */}

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          No Image
                        </span>
                      )}
                    </div>

                    {/* PRODUCT */}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900">{item.name}</h3>

                      <p className="mt-2 text-sm text-slate-500">
                        ৳{formatMoney(item.price)} × {item.quantity}
                      </p>
                    </div>

                    {/* ITEM TOTAL */}

                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        ৳{formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* CUSTOMER */}

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Customer Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.customerName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <a
                    href={`tel:${order.phone}`}
                    className="mt-1 block font-semibold text-orange-600 hover:text-orange-700"
                  >
                    {order.phone}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.email || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    District
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {order.district}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Delivery Address
                </p>

                <p className="mt-2 leading-7 text-slate-700">{order.address}</p>
              </div>
            </section>

            {/* NOTE */}

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900">Order Note</h2>

              <p className="mt-4 leading-7 text-slate-600">
                {order.note?.trim()
                  ? order.note
                  : "No note was provided for this order."}
              </p>
            </section>
          </div>

          {/* RIGHT */}

          <div className="space-y-6">
            {/* STATUS */}

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900">Order Status</h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the fulfillment status.
              </p>

              <label className="mt-6 block text-sm font-semibold text-slate-700">
                Status
              </label>

              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value as OrderStatus);

                  setError("");
                  setSuccess("");
                }}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold capitalize text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleStatusUpdate}
                disabled={updating || selectedStatus === order.status}
                className="mt-4 w-full rounded-lg bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </section>

            {/* PAYMENT */}

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900">Payment</h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Method</span>

                  <span className="font-bold uppercase text-slate-900">
                    {order.paymentMethod}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">Payment Status</span>

                  <span className="font-bold capitalize text-slate-900">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </section>

            {/* TOTAL */}

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900">
                Order Summary
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>

                  <span className="font-semibold text-slate-900">
                    ৳{formatMoney(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Delivery</span>

                  <span className="font-semibold text-slate-900">
                    ৳{formatMoney(order.deliveryCharge)}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-bold text-slate-900">
                      Grand Total
                    </span>

                    <span className="text-2xl font-bold text-orange-600">
                      ৳{formatMoney(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* META */}

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="font-bold text-slate-900">Order Information</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <p className="text-slate-400">Created</p>

                  <p className="mt-1 font-medium text-slate-700">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-400">Last Updated</p>

                  <p className="mt-1 font-medium text-slate-700">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
