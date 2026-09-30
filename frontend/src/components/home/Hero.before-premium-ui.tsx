import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 py-7">

        {/* HERO GRID */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.8fr)]">

          {/* MAIN BANNER */}
          <div className="relative min-h-[330px] overflow-hidden rounded-xl bg-gradient-to-br from-[#071b35] via-[#0c3168] to-[#075eb4] px-7 py-9 text-white md:min-h-[410px] md:px-12 md:py-12">

            {/* Decorative Background */}
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-400/20" />
            <div className="absolute bottom-[-100px] right-[20%] h-64 w-64 rounded-full bg-orange-400/20" />
            <div className="absolute right-8 top-10 h-24 w-24 rotate-12 rounded-3xl border border-white/10 bg-white/5" />

            <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center">
              <span className="mb-4 w-fit rounded-full bg-orange-500 px-4 py-2 text-xs font-bold uppercase tracking-wider">
                MOAS Tech Special Deal
              </span>

              <h1 className="text-3xl font-black leading-tight md:text-5xl">
                Upgrade Your
                <span className="block text-orange-400">
                  Tech Experience
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-blue-100 md:text-base">
                Laptop, computer accessories, gadgets and essential
                technology products at competitive prices.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="rounded-md bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Shop Now
                </Link>

                <Link
                  href="/shop?offer=true"
                  className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  View Offers
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-xs font-medium text-blue-100">
                <span>✓ Genuine Products</span>
                <span>✓ Nationwide Delivery</span>
                <span>✓ Customer Support</span>
              </div>
            </div>
          </div>

          {/* RIGHT PROMOS */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">

            {/* OFFER CARD */}
            <Link
              href="/shop?offer=true"
              className="group relative min-h-[160px] overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white lg:min-h-0"
            >
              <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-cyan-400/20 transition group-hover:scale-110" />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Special Offers
                </p>

                <h2 className="mt-3 text-xl font-black md:text-2xl">
                  Best Tech Deals
                </h2>

                <p className="mt-2 max-w-[220px] text-xs leading-5 text-blue-100">
                  Explore our latest offers and save more on selected products.
                </p>

                <p className="mt-5 text-sm font-bold text-orange-400">
                  Explore Offers →
                </p>
              </div>
            </Link>

            {/* SUPPORT CARD */}
            <Link
              href="/orders/track"
              className="group relative min-h-[160px] overflow-hidden rounded-xl bg-gradient-to-br from-[#f04a24] to-[#b51e25] p-6 text-white lg:min-h-0"
            >
              <div className="absolute -right-10 top-[-30px] h-40 w-40 rounded-full bg-orange-300/20 transition group-hover:scale-110" />

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-100">
                  Easy Shopping
                </p>

                <h2 className="mt-3 text-xl font-black md:text-2xl">
                  Track Your Order
                </h2>

                <p className="mt-2 max-w-[220px] text-xs leading-5 text-orange-100">
                  Check your order status anytime using your order information.
                </p>

                <p className="mt-5 text-sm font-bold">
                  Track Now →
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ANNOUNCEMENT */}
        <div className="mt-5 flex items-center overflow-hidden rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm">
          <span className="mr-4 shrink-0 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Notice
          </span>

          <p className="truncate text-xs font-medium text-slate-600 md:text-sm">
            MOAS Tech online store is open — order your favourite tech products from anywhere in Bangladesh.
          </p>
        </div>

        {/* QUICK ACTION CARDS */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">

          <Link
            href="/shop"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xl text-white">
              💻
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Browse Products
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Find Your Tech
              </p>
            </div>
          </Link>

          <Link
            href="/shop?offer=true"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xl text-white">
              %
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Special Offers
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Save More
              </p>
            </div>
          </Link>

          <Link
            href="/orders/track"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xl text-white">
              📦
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Track Order
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Check Order Status
              </p>
            </div>
          </Link>

          <a
            href="https://wa.me/8801614106550"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xl text-white">
              ☎
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Customer Support
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Chat on WhatsApp
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
