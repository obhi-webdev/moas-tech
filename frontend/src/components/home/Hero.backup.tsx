import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
        {/* Left Content */}
        <div>
          <div className="mb-5 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
            Trusted Computer & Gadget Store
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Upgrade Your
            <span className="block text-blue-700">Digital Experience</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 md:text-lg">
            Shop laptops, computer accessories, gadgets and essential tech
            products from MOAS Tech.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Shop Now
            </Link>

            <Link
              href="/shop?offer=true"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-100"
            >
              View Offers
            </Link>
          </div>

          {/* Features */}
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-6">
            <div>
              <p className="font-bold text-slate-900">Genuine</p>
              <p className="mt-1 text-xs text-slate-500">Products</p>
            </div>

            <div>
              <p className="font-bold text-slate-900">Fast</p>
              <p className="mt-1 text-xs text-slate-500">Delivery</p>
            </div>

            <div>
              <p className="font-bold text-slate-900">Support</p>
              <p className="mt-1 text-xs text-slate-500">After Sales</p>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-blue-950 p-8 text-white md:p-12">
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100">MOAS TECH</p>

              <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                Everything Tech.
                <br />
                One Destination.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-blue-100">
                Laptop, desktop, accessories and the latest gadgets at
                competitive prices.
              </p>

              <div className="mt-8 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold">
                Explore Collection →
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-20 h-44 w-44 rounded-full bg-orange-400/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
