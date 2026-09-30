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

      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">

          {/* Breadcrumb */}

          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
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

          <div className="mb-5 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
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
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
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
                className="mt-7 inline-flex rounded-md bg-orange-500 px-7 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_350px]">

              {/* Products */}

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">

                      {/* Image */}

                      <Link
                        href={`/product/${item.slug}`}
                        className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-100 bg-white sm:w-32"
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
                            className="text-base font-semibold leading-6 text-slate-900 transition hover:text-orange-500"
                          >
                            {item.name}
                          </Link>

                          <p className="mt-1 text-xs text-slate-500">
                            SKU: {item.sku}
                          </p>

                          <p className="mt-3 text-lg font-black text-red-600">
                            ৳{formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">

                          {/* Quantity */}

                          <div className="inline-flex overflow-hidden rounded-md border border-slate-300">
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

                        <p className="mt-1 text-lg font-bold text-slate-900">
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

              <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
                <h2 className="text-lg font-bold text-slate-900">
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

                  <span className="text-2xl font-black text-red-600">
                    ৳{formatPrice(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center rounded-md bg-orange-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="mt-3 flex w-full items-center justify-center rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
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
