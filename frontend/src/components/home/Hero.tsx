import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-5">

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_320px]">

          {/* MAIN BANNER */}
          <Link
            href="/shop"
            className="group relative block min-h-[430px] overflow-hidden rounded-lg bg-white lg:h-full"
          >
            <Image
              src="/hero-banner.png"
              alt="VS Tech"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            />

            {/* ORDER NOW BUTTON */}
            <span className="absolute bottom-8 left-8 z-20 inline-flex items-center justify-center rounded-lg bg-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-orange-600 hover:-translate-y-0.5 md:bottom-10 md:left-10 md:px-8 md:py-4 md:text-base">
              অর্ডার করুন →
            </span>
          </Link>

          {/* RIGHT SIDE */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">

            {/* SIDE BANNER 1 */}
            <Link
              href="/shop?offer=true"
              className="group relative min-h-[165px] overflow-hidden rounded-lg bg-slate-100 lg:min-h-0"
            >
              <Image
                src="/side-banner-1.jpg"
                alt="VS Tech Special Offer"
                fill
                sizes="(max-width: 1024px) 50vw, 320px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>

            {/* SIDE BANNER 2 */}
            <Link
              href="/orders/track"
              className="group relative min-h-[165px] overflow-hidden rounded-lg bg-slate-100 lg:min-h-0"
            >
              <Image
                src="/side-banner-2.jpg"
                alt="VS Tech Order Support"
                fill
                sizes="(max-width: 1024px) 50vw, 320px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>

          </div>
        </div>

        {/* NOTICE */}

        <div className="mt-4 flex min-h-12 items-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">

          <div className="flex self-stretch items-center bg-orange-500 px-5 text-xs font-black uppercase tracking-wider text-white">
            Notice
          </div>

          <p className="truncate px-5 text-xs font-medium text-slate-600 md:text-sm">
            VS Tech online store is open — order your favourite technology
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
            href="https://wa.me/8801737092358"
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
