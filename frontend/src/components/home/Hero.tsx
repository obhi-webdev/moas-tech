import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-5">

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_320px]">

          {/* MAIN BANNER */}

          <div className="relative min-h-[350px] overflow-hidden rounded-lg bg-[#061b31] text-white md:min-h-[420px]">

            {/* Background Decoration */}

            <div className="absolute inset-0 bg-gradient-to-r from-[#061725] via-[#092d54] to-[#075aaa]" />

            <div className="hero-float-one absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-400/20" />

            <div className="hero-float-two absolute -bottom-36 right-[12%] h-80 w-80 rounded-full bg-orange-500/20" />

            <div className="absolute right-[8%] top-[14%] hidden h-56 w-56 rotate-12 rounded-[45px] border border-white/10 bg-white/[0.04] md:block" />

            {/* Content */}

            <div className="relative z-10 flex min-h-[350px] items-center px-7 py-10 md:min-h-[420px] md:px-12 lg:px-14">

              <div className="max-w-xl">

                <div className="hero-enter hero-delay-1 mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-orange-300">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  MOAS Tech Online Store
                </div>

                <h1 className="hero-enter hero-delay-2 text-[34px] font-black leading-[1.12] tracking-tight md:text-5xl lg:text-[54px]">
                  Technology You Need.
                  <span className="mt-1 block text-orange-400">
                    Price You&apos;ll Love.
                  </span>
                </h1>

                <p className="hero-enter hero-delay-3 mt-5 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
                  Explore laptops, computer accessories, gadgets and everyday
                  tech essentials with reliable service across Bangladesh.
                </p>

                <div className="hero-enter hero-delay-4 mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="rounded-md bg-orange-500 px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-950/20 active:translate-y-0"
                  >
                    Shop Now
                  </Link>

                  <Link
                    href="/shop?offer=true"
                    className="rounded-md border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/15 active:translate-y-0"
                  >
                    View Offers
                  </Link>
                </div>

                <div className="hero-enter hero-delay-5 mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs font-medium text-slate-300">
                  <span>✓ Genuine Products</span>
                  <span>✓ Nationwide Delivery</span>
                  <span>✓ Customer Support</span>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">

            {/* OFFER */}

            <Link
              href="/shop?offer=true"
              className="group relative min-h-[165px] overflow-hidden rounded-lg bg-gradient-to-br from-[#075eb4] to-[#082c59] p-6 text-white transition-all duration-300 lg:min-h-0 lg:hover:-translate-y-1 lg:hover:shadow-xl"
            >
              <div className="absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-cyan-300/15 transition duration-300 group-hover:scale-110" />

              <div className="relative z-10">
                <div className="mb-3 inline-flex rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-100">
                  Special Deal
                </div>

                <h2 className="text-xl font-black leading-tight md:text-2xl">
                  Latest Tech
                  <br />
                  Offers
                </h2>

                <p className="mt-3 text-xs leading-5 text-blue-100">
                  Save more on selected products.
                </p>

                <p className="mt-5 text-xs font-bold text-orange-300">
                  Shop Offers →
                </p>
              </div>
            </Link>

            {/* ORDER TRACKING */}

            <Link
              href="/orders/track"
              className="group relative min-h-[165px] overflow-hidden rounded-lg bg-gradient-to-br from-[#ff5a1f] to-[#d52b1e] p-6 text-white transition-all duration-300 lg:min-h-0 lg:hover:-translate-y-1 lg:hover:shadow-xl"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-yellow-200/15 transition duration-300 group-hover:scale-110" />

              <div className="relative z-10">
                <div className="mb-3 inline-flex rounded-md bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  Order Support
                </div>

                <h2 className="text-xl font-black leading-tight md:text-2xl">
                  Track Your
                  <br />
                  Order
                </h2>

                <p className="mt-3 text-xs leading-5 text-orange-50">
                  Check your latest order status.
                </p>

                <p className="mt-5 text-xs font-bold">
                  Track Now →
                </p>
              </div>
            </Link>

          </div>
        </div>

        {/* NOTICE */}

        <div className="mt-4 flex min-h-12 items-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">

          <div className="flex self-stretch items-center bg-orange-500 px-5 text-xs font-black uppercase tracking-wider text-white">
            Notice
          </div>

          <p className="truncate px-5 text-xs font-medium text-slate-600 md:text-sm">
            MOAS Tech online store is open — order your favourite technology
            products from anywhere in Bangladesh.
          </p>

        </div>

        {/* SERVICE CARDS */}

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <Link
            href="/shop"
            className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md md:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl">
              💻
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Browse Products
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Find Your Tech
              </p>
            </div>
          </Link>

          <Link
            href="/shop?offer=true"
            className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md md:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-lg font-black text-orange-500">
              %
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Special Offers
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Save More
              </p>
            </div>
          </Link>

          <Link
            href="/orders/track"
            className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md md:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl">
              📦
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Track Order
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Check Order Status
              </p>
            </div>
          </Link>

          <a
            href="https://wa.me/8801614106550"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md md:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xl">
              ☎
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Customer Support
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Chat on WhatsApp
              </p>
            </div>
          </a>

        </div>
      </div>
    </section>
  );
}
