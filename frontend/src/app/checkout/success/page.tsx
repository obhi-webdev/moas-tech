"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import Header from "@/components/home/Header";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <>
      <Header
        phone="01737092358"
        whatsapp="01737092358"
      />

      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center md:p-12">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Order Placed Successfully!
            </h1>

            <p className="mt-3 text-slate-600">
              Thank you for ordering from VS Tech.
            </p>

            {orderNumber && (
              <div className="mt-7 rounded-xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">
                  Your Order Number
                </p>

                <p className="mt-1 text-xl font-bold text-blue-700">
                  {orderNumber}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Save this number to track your order.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              {orderNumber && (
                <Link
                  href={`/orders/track?order=${encodeURIComponent(
                    orderNumber,
                  )}`}
                  className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
                >
                  Track Order
                </Link>
              )}

              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700"
              >
                Back to Home
              </Link>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}


export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
