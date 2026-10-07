"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/components/home/Header";
import { useCart } from "@/context/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

// =========================================
// TYPES
// =========================================

interface Settings {
  deliveryChargeInside: number;
  deliveryChargeOutside: number;
}

interface OrderResponse {
  message?: string | string[];

  order?: {
    orderNumber?: string;
  };

  orderNumber?: string;
}

// =========================================
// HELPERS
// =========================================

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD").format(price);
}

// =========================================
// CHECKOUT PAGE
// =========================================

export default function CheckoutPage() {
  const router = useRouter();

  const { items, subtotal, clearCart } = useCart();

  // =======================================
  // SETTINGS
  // =======================================

  const [settings, setSettings] = useState<Settings>({
    deliveryChargeInside: 60,
    deliveryChargeOutside: 120,
  });

  // =======================================
  // CUSTOMER FORM
  // =======================================

  const [customerName, setCustomerName] = useState("");

  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");

  const [district, setDistrict] = useState("Comilla");

  const [address, setAddress] = useState("");

  const [note, setNote] = useState("");

  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">(
    "inside",
  );

  // =======================================
  // PAGE STATE
  // =======================================

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =======================================
  // LOAD SETTINGS
  // =======================================

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch(`${API_URL}/settings`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!active) {
          return;
        }

        setSettings({
          deliveryChargeInside: Number(data.deliveryChargeInside) || 60,

          deliveryChargeOutside: Number(data.deliveryChargeOutside) || 120,
        });
      } catch (error) {
        console.error("Settings loading error:", error);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  // =======================================
  // PRICE CALCULATION
  // =======================================

  const deliveryCharge =
    deliveryArea === "inside"
      ? settings.deliveryChargeInside
      : settings.deliveryChargeOutside;

  const total = subtotal + deliveryCharge;

  // =======================================
  // PLACE ORDER
  // =======================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");

    // =====================================
    // CART VALIDATION
    // =====================================

    if (items.length === 0) {
      setError("Your cart is empty.");

      return;
    }

    // =====================================
    // NAME VALIDATION
    // =====================================

    if (!customerName.trim()) {
      setError("Please enter your full name.");

      return;
    }

    // =====================================
    // PHONE VALIDATION
    // =====================================

    const cleanPhone = phone.trim().replace(/\s+/g, "").replace(/-/g, "");

    if (!cleanPhone) {
      setError("Please enter your phone number.");

      return;
    }

    if (!/^01\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid Bangladesh phone number.");

      return;
    }

    // =====================================
    // OPTIONAL EMAIL VALIDATION
    // =====================================

    const cleanEmail = email.trim();

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");

      return;
    }

    // =====================================
    // DISTRICT VALIDATION
    // =====================================

    if (!district.trim()) {
      setError("Please enter your district.");

      return;
    }

    // =====================================
    // ADDRESS VALIDATION
    // =====================================

    if (!address.trim()) {
      setError("Please enter your full address.");

      return;
    }

    try {
      setSubmitting(true);

      // ===================================
      // REQUEST BODY
      // ===================================

      const requestBody = {
        customerName: customerName.trim(),

        phone: cleanPhone,

        // Email will NOT be sent when blank.
        ...(cleanEmail
          ? {
              email: cleanEmail,
            }
          : {}),

        address: address.trim(),

        district: district.trim(),

        // Backend calculates delivery charge
        // from this value.
        deliveryArea,

        items: items.map((item) => ({
          product: item._id,

          quantity: item.quantity,
        })),

        paymentMethod: "cod",

        // Note is optional.
        ...(note.trim()
          ? {
              note: note.trim(),
            }
          : {}),
      };

      // ===================================
      // CREATE ORDER
      // ===================================

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(requestBody),
      });

      // ===================================
      // PARSE RESPONSE
      // ===================================

      let data: OrderResponse = {};

      try {
        data = await response.json();
      } catch {
        // Ignore invalid JSON here.
      }

      // ===================================
      // API ERROR
      // ===================================

      if (!response.ok) {
        let message = "Order could not be placed.";

        if (Array.isArray(data.message)) {
          message = data.message.join(", ");
        } else if (typeof data.message === "string") {
          message = data.message;
        }

        throw new Error(message);
      }

      // ===================================
      // ORDER NUMBER
      // ===================================

      const orderNumber = data.order?.orderNumber || data.orderNumber;

      if (!orderNumber) {
        throw new Error(
          "Order was created, but the order number was not returned.",
        );
      }

      // ===================================
      // CLEAR CART
      // ===================================

      clearCart();

      // ===================================
      // SUCCESS PAGE
      // ===================================

      router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`);
    } catch (error) {
      console.error("Checkout error:", error);

      setError(
        error instanceof Error ? error.message : "Order could not be placed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =========================================
  // EMPTY CART
  // =========================================

  if (items.length === 0) {
    return (
      <>
        <Header phone="+8809696492358" whatsapp="8809696492358" />

        <main className="min-h-screen bg-[#f1f3f6]">
          <div className="mx-auto max-w-3xl px-4 py-16">
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              <div className="text-5xl">🛒</div>

              <h1 className="mt-5 text-2xl font-bold text-slate-900">
                Your cart is empty
              </h1>

              <p className="mt-2 text-slate-500">
                Add a product before proceeding to checkout.
              </p>

              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Go to Shop
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // =========================================
  // CHECKOUT UI
  // =========================================

  return (
    <>
      <Header phone="+8809696492358" whatsapp="8809696492358" />

      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Breadcrumb */}

          <div className="mb-7 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="transition hover:text-blue-700">
              Home
            </Link>

            <span>/</span>

            <Link href="/cart" className="transition hover:text-blue-700">
              Cart
            </Link>

            <span>/</span>

            <span className="text-slate-900">Checkout</span>
          </div>

          <h1 className="mb-5 text-2xl font-bold text-slate-900 md:text-3xl">Checkout</h1>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]"
          >
            {/* ================================= */}
            {/* CUSTOMER DETAILS */}
            {/* ================================= */}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <h2 className="text-lg font-bold text-slate-900">
                Customer Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your contact and delivery information.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Name */}

                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name *
                  </label>

                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    autoComplete="name"
                    required
                    placeholder="Your full name"
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Phone */}

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      const value = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);

                      setPhone(value);
                    }}
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength={11}
                    required
                    placeholder="01XXXXXXXXX"
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="example@email.com"
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* District */}

                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    District *
                  </label>

                  <input
                    id="district"
                    type="text"
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    autoComplete="address-level1"
                    required
                    placeholder="District"
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Address */}

              <div className="mt-5">
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Address *
                </label>

                <textarea
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={4}
                  required
                  autoComplete="street-address"
                  placeholder="House, road, area, thana..."
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* ================================= */}
              {/* DELIVERY AREA */}
              {/* ================================= */}

              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Delivery Area *
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Inside */}

                  <label
                    className={`cursor-pointer rounded-md border p-4 transition ${
                      deliveryArea === "inside"
                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="inside"
                        checked={deliveryArea === "inside"}
                        onChange={() => setDeliveryArea("inside")}
                        className="mt-1"
                      />

                      <div>
                        <p className="font-bold text-slate-900">
                          Comilla City
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Inside city delivery
                        </p>

                        <p className="mt-2 font-black text-orange-500">
                          ৳{formatPrice(settings.deliveryChargeInside)}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Outside */}

                  <label
                    className={`cursor-pointer rounded-md border p-4 transition ${
                      deliveryArea === "outside"
                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="deliveryArea"
                        value="outside"
                        checked={deliveryArea === "outside"}
                        onChange={() => setDeliveryArea("outside")}
                        className="mt-1"
                      />

                      <div>
                        <p className="font-bold text-slate-900">Outside City</p>

                        <p className="mt-1 text-sm text-slate-500">
                          Outside Comilla city
                        </p>

                        <p className="mt-2 font-black text-orange-500">
                          ৳{formatPrice(settings.deliveryChargeOutside)}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ================================= */}
              {/* PAYMENT */}
              {/* ================================= */}

              <div className="mt-7">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Payment Method
                </p>

                <div className="rounded-md border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-green-600">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-600" />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">
                        Cash on Delivery
                      </p>

                      <p className="mt-0.5 text-sm text-slate-500">
                        Pay when you receive your order.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}

              <div className="mt-7">
                <label
                  htmlFor="note"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Order Note
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  placeholder="Optional note..."
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}
            </div>

            {/* ================================= */}
            {/* ORDER SUMMARY */}
            {/* ================================= */}

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-slate-900">Your Order</h2>

              {/* Products */}

              <div className="mt-5 divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 py-4">
                    {/* Image */}

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-100 bg-white">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          No Image
                        </span>
                      )}
                    </div>

                    {/* Info */}

                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}

                    <p className="shrink-0 text-sm font-bold text-slate-900">
                      ৳{formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* ================================= */}
              {/* PRICE SUMMARY */}
              {/* ================================= */}

              <div className="mt-4 space-y-3 border-t border-slate-200 pt-5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>

                  <span className="font-semibold text-slate-900">
                    ৳{formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Delivery Charge</span>

                  <span className="font-semibold text-slate-900">
                    ৳{formatPrice(deliveryCharge)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-4">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-2xl font-black text-red-600">
                    ৳{formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* ================================= */}
              {/* PLACE ORDER */}
              {/* ================================= */}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full rounded-md bg-orange-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Placing Order..."
                  : `Place Order — ৳${formatPrice(total)}`}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                Product prices and delivery charge are verified by the server
                before your order is created.
              </p>

              <Link
                href="/cart"
                className="mt-4 flex justify-center text-sm font-semibold text-slate-600 transition hover:text-orange-500"
              >
                ← Back to Cart
              </Link>
            </aside>
          </form>
        </div>
      </main>
    </>
  );
}
