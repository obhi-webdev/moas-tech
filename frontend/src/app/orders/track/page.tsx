"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import Header from "@/components/home/Header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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
  createdAt: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD").format(price);
}

function getStatusLabel(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "Order Pending";

    case "confirmed":
      return "Order Confirmed";

    case "processing":
      return "Processing";

    case "shipped":
      return "Shipped";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}

function TrackOrderContent() {
  const searchParams = useSearchParams();

  const initialOrder =
    searchParams.get("order") || "";

  const [orderNumber, setOrderNumber] =
    useState(initialOrder);

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function trackOrder(number: string) {
    const cleanNumber = number.trim();

    if (!cleanNumber) {
      setError("Please enter your order number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const response = await fetch(
        `${API_URL}/orders/track/${encodeURIComponent(
          cleanNumber,
        )}`,
      );

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        throw new Error(
          message || "Order not found.",
        );
      }

      setOrder(data.order || data);
    } catch (error) {
      console.error(
        "Order tracking error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Order could not be found.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialOrder) {
      trackOrder(initialOrder);
    }
  }, [initialOrder]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    trackOrder(orderNumber);
  }

  return (
    <>
      <Header
        phone="+8809696492358"
        whatsapp="8809696492358"
      />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-10">

          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-semibold text-blue-700"
            >
              ← Back to Home
            </Link>

            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Track Your Order
            </h1>

            <p className="mt-2 text-slate-500">
              Enter your VC Tech order number to
              check the current order status.
            </p>
          </div>

          {/* Search */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
          >
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Order Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(
                    event.target.value,
                  )
                }
                placeholder="Example: MT-46198533-9229"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-700 px-7 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
              >
                {loading
                  ? "Checking..."
                  : "Track Order"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
          </form>

          {/* Order Result */}

          {order && (
            <div className="mt-7 space-y-6">

              {/* Status */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                  <div>
                    <p className="text-sm text-slate-500">
                      Order Number
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Placed on{" "}
                      {new Date(
                        order.createdAt,
                      ).toLocaleString(
                        "en-BD",
                      )}
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                        order.status ===
                        "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status ===
                              "cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.status ===
                                "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {getStatusLabel(
                        order.status,
                      )}
                    </span>
                  </div>

                </div>

                {/* Progress */}

                {order.status !==
                  "cancelled" && (
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">

                    {[
                      "pending",
                      "confirmed",
                      "processing",
                      "shipped",
                      "delivered",
                    ].map(
                      (
                        status,
                        index,
                      ) => {
                        const statuses = [
                          "pending",
                          "confirmed",
                          "processing",
                          "shipped",
                          "delivered",
                        ];

                        const currentIndex =
                          statuses.indexOf(
                            order.status,
                          );

                        const completed =
                          index <=
                          currentIndex;

                        return (
                          <div
                            key={status}
                            className="text-center"
                          >
                            <div
                              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                                completed
                                  ? "bg-blue-700 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {completed
                                ? "✓"
                                : index +
                                  1}
                            </div>

                            <p
                              className={`mt-2 text-xs font-semibold capitalize ${
                                completed
                                  ? "text-blue-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {status}
                            </p>
                          </div>
                        );
                      },
                    )}

                  </div>
                )}

                {order.status ===
                  "cancelled" && (
                  <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    This order has been
                    cancelled.
                  </div>
                )}
              </section>

              {/* Customer */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Delivery Information
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {order.customerName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {order.phone}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Address
                    </p>

                    <p className="mt-1 text-slate-700">
                      {order.address}
                      {order.district
                        ? `, ${order.district}`
                        : ""}
                    </p>
                  </div>
                </div>
              </section>

              {/* Items */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Order Items
                </h2>

                <div className="mt-5 divide-y divide-slate-100">
                  {order.items.map(
                    (item, index) => (
                      <div
                        key={`${item.product}-${index}`}
                        className="flex gap-4 py-5 first:pt-0"
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                          {item.image ? (
                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">
                              No Image
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 justify-between gap-4">
                          <div>
                            <p className="font-bold text-slate-800">
                              {item.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              Qty:{" "}
                              {
                                item.quantity
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              ৳
                              {formatPrice(
                                item.price,
                              )}{" "}
                              each
                            </p>
                          </div>

                          <p className="font-bold text-slate-900">
                            ৳
                            {formatPrice(
                              item.price *
                                item.quantity,
                            )}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>

              {/* Payment Summary */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Payment Summary
                </h2>

                <div className="mt-5 space-y-3">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      ৳
                      {formatPrice(
                        order.subtotal,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      Delivery Charge
                    </span>

                    <span>
                      ৳
                      {formatPrice(
                        order.deliveryCharge,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-200 pt-4">
                    <span className="text-lg font-bold text-slate-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-blue-700">
                      ৳
                      {formatPrice(
                        order.total,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between pt-2 text-sm text-slate-500">
                    <span>
                      Payment Method
                    </span>

                    <span className="font-semibold uppercase">
                      {
                        order.paymentMethod
                      }
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-500">
                    <span>
                      Payment Status
                    </span>

                    <span className="font-semibold capitalize">
                      {
                        order.paymentStatus
                      }
                    </span>
                  </div>
                </div>
              </section>

            </div>
          )}
        </div>
      </main>
    </>
  );
}


export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderContent />
    </Suspense>
  );
}
