import Link from "next/link";

export default function Footer() {
  const phone = "01614106550";
  const whatsappNumber = "8801614106550";

  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight"
            >
              <span className="text-blue-500">MOAS</span>{" "}
              <span className="text-orange-500">Tech</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Your trusted destination for laptops, computers,
              accessories and technology products.
            </p>

            <p className="mt-4 text-sm text-slate-400">
              Mymensingh, Bangladesh
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold text-white">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm">
              <Link
                href="/"
                className="transition hover:text-white"
              >
                Home
              </Link>

              <Link
                href="/shop"
                className="transition hover:text-white"
              >
                Shop
              </Link>

              <Link
                href="/shop?featured=true"
                className="transition hover:text-white"
              >
                Featured Products
              </Link>

              <Link
                href="/shop?offer=true"
                className="transition hover:text-white"
              >
                Special Offers
              </Link>

              <Link
                href="/about"
                className="transition hover:text-white"
              >
                About Us
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-base font-bold text-white">
              Customer Service
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm">
              <Link
                href="/cart"
                className="transition hover:text-white"
              >
                Shopping Cart
              </Link>

              <Link
                href="/checkout"
                className="transition hover:text-white"
              >
                Checkout
              </Link>

              <Link
                href="/orders/track"
                className="transition hover:text-white"
              >
                Track Order
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-bold text-white">
              Contact Us
            </h3>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">
                  Phone
                </p>

                <a
                  href={`tel:${phone}`}
                  className="mt-1 inline-block font-semibold text-white transition hover:text-blue-400"
                >
                  {phone}
                </a>
              </div>

              <div>
                <p className="text-slate-500">
                  Location
                </p>

                <p className="mt-1 text-white">
                  Mymensingh, Bangladesh
                </p>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} MOAS Tech. All rights reserved.
            </p>

            <p>
              Mymensingh, Bangladesh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
