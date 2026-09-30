"use client";

import Link from "next/link";

import Header from "@/components/home/Header";
import { useCart } from "@/context/CartContext";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD").format(price);
}

export default function CartPage() {
  const {
    items,
    subtotal,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  return (
    <>
      <Header
        phone="01614106550"
        whatsapp="01614106550"
      />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">

          {/* Breadcrumb */}

          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/"
              className="hover:text-blue-700"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-slate-900">
              Cart
            </span>
          </div>

          <div className="mb-7 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">
              Shopping Cart
            </h1>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Empty Cart */}

          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
              <div className="text-5xl">
                🛒
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-900">
                Your cart is empty
              </h2>

              <p className="mt-2 text-slate-500">
                Add some products to continue shopping.
              </p>

              <Link
                href="/shop"
                className="mt-7 inline-flex rounded-xl bg-blue-700 px-7 py-3.5 font-bold text-white transition hover:bg-blue-800"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-7 lg:grid-cols-[1fr_360px]">

              {/* Products */}

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">

                      {/* Image */}

                      <Link
                        href={`/product/${item.slug}`}
                        className="flex h-32 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:w-36"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-contain p-3"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">
                            No Image
                          </span>
                        )}
                      </Link>

                      {/* Information */}

                      <div className="flex flex-1 flex-col justify-between gap-4">
                        <div>
                          <Link
                            href={`/product/${item.slug}`}
                            className="text-lg font-bold text-slate-900 transition hover:text-blue-700"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-1 text-sm text-slate-500">
                            SKU: {item.sku}
                          </p>

                          <p className="mt-3 text-xl font-bold text-blue-700">
                            ৳{formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">

                          {/* Quantity */}

                          <div className="inline-flex overflow-hidden rounded-lg border border-slate-300">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              className="h-10 w-10 text-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              −
                            </button>

                            <div className="flex h-10 min-w-12 items-center justify-center border-x border-slate-300 font-semibold">
                              {item.quantity}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item._id,
                                  item.quantity + 1,
                                )
                              }
                              disabled={
                                item.quantity >= item.stock
                              }
                              className="h-10 w-10 text-lg transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item._id)
                            }
                            className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}

                      <div className="sm:text-right">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Total
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-900">
                          ৳
                          {formatPrice(
                            item.price *
                              item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}

              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Order Summary
                </h2>

                <div className="mt-6 space-y-4 border-b border-slate-200 pb-5">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-900">
                      ৳{formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>
                      Delivery
                    </span>

                    <span className="text-sm">
                      Calculated at checkout
                    </span>
                  </div>
                </div>

                <div className="flex justify-between py-5">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-blue-700">
                    ৳{formatPrice(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Continue Shopping
                </Link>

                <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                  Final delivery charge will be calculated
                  during checkout.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
