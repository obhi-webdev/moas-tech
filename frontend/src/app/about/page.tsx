import Link from "next/link";

import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function AboutPage() {
  return (
    <>
      <Header
        phone="01614106550"
        whatsapp="01614106550"
      />

      <main className="min-h-screen bg-slate-50">

        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
            <p className="text-sm font-bold uppercase tracking-wider text-orange-500">
              About MOAS Tech
            </p>

            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Technology Products You Can Shop With Confidence
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              MOAS Tech provides laptops, computers, accessories and
              technology products with a simple and convenient online
              shopping experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-xl bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                Shop Products
              </Link>

              <a
                href="https://wa.me/8801614106550"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-7 md:p-9">
              <p className="text-sm font-bold text-blue-700">
                WHO WE ARE
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Welcome to MOAS Tech
              </h2>

              <p className="mt-5 leading-7 text-slate-600">
                We aim to make technology shopping easier by bringing
                useful products into one convenient platform. Customers
                can explore products, compare information and place
                orders directly through our website.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                Our product range includes laptops, computer products,
                accessories and other technology essentials.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-3xl">
                  💻
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Technology Products
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Explore laptops, computers and useful accessories.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-3xl">
                  🛒
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Easy Ordering
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add products to cart and complete your order online.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-3xl">
                  📦
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Nationwide Service
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Convenient ordering for customers across Bangladesh.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-3xl">
                  💬
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Customer Support
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Contact our team directly when you need assistance.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="rounded-3xl bg-blue-700 px-6 py-10 text-center text-white md:px-10 md:py-14">
            <h2 className="text-3xl font-bold">
              Need Help Choosing a Product?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              Contact MOAS Tech and talk with our team about the product
              you are looking for.
            </p>

            <a
              href="https://wa.me/8801614106550"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex rounded-xl bg-white px-7 py-3.5 font-bold text-blue-700 transition hover:bg-slate-100"
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
