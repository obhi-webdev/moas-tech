import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#f1f3f6]">
      <div className="mx-auto max-w-7xl px-2 pb-5 pt-4 sm:px-4 sm:pt-5">

        <div className="grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_320px]">

          {/* MAIN BANNER */}
          <Link
            href="/shop"
            className="group relative block aspect-[2659/984] overflow-hidden rounded-lg bg-white lg:aspect-auto lg:min-h-[430px] lg:h-full"
          >
            <Image
              src="/hero-banner.png"
              alt="VC Tech"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-contain object-center transition-transform duration-500 lg:object-cover lg:group-hover:scale-[1.02]"
            />

            {/* ORDER NOW BUTTON */}
            <span className="absolute bottom-3 left-3 z-20 inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md transition-all duration-300 hover:bg-orange-600 md:bottom-6 md:left-6 md:px-6 md:py-3 md:text-sm lg:bottom-10 lg:left-10 lg:px-8 lg:py-4 lg:text-base">
              অর্ডার করুন →
            </span>
          </Link>

          {/* RIGHT SIDE */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">

            {/* SIDE BANNER 1 */}
            <Link
              href="/shop?offer=true"
              className="group relative h-[135px] overflow-hidden rounded-lg bg-slate-100 sm:h-[180px] lg:h-auto lg:min-h-0"
            >
              <Image
                src="/side-banner-1.jpg"
                alt="VC Tech Special Offer"
                fill
                sizes="(max-width: 1024px) 50vw, 320px"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>

            {/* SIDE BANNER 2 */}
            <Link
              href="/orders/track"
              className="group relative h-[135px] overflow-hidden rounded-lg bg-slate-100 sm:h-[180px] lg:h-auto lg:min-h-0"
            >
              <Image
                src="/side-banner-2.jpg"
                alt="VC Tech Order Support"
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
            VC Tech online store is open — order your favourite technology
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
