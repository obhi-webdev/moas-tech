"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteLogo from "@/components/home/SiteLogo";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

export default function Footer() {
  const [address, setAddress] = useState(
    "Mymensingh, Bangladesh",
  );

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(
          `${API_URL}/settings`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) return;

        const data = await response.json();

        if (data?.address) {
          setAddress(data.address);
        }
      } catch (error) {
        console.error(
          "Footer settings loading error:",
          error,
        );
      }
    }

    loadSettings();
  }, []);

  const phone = "+8809696492358";
  const whatsapp = "8809696492358";

  return (
    <footer className="bg-[#071724] text-slate-300">
      {/* MAIN FOOTER */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.8fr_1.1fr]">

          {/* SUPPORT */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Support
            </h3>

            <a
              href={`tel:${phone}`}
              className="mt-6 flex items-center gap-4 rounded-full border border-slate-700 px-5 py-3 transition hover:border-orange-500"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-xl text-orange-500">
                ☎
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Call Us
                </p>

                <p className="mt-1 text-sm font-bold text-orange-400">
                  {phone}
                </p>
              </div>
            </a>

            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-4 rounded-full border border-slate-700 px-5 py-3 transition hover:border-green-500"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-xl">
                💬
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  WhatsApp
                </p>

                <p className="mt-1 text-sm font-bold text-green-400">
                  Chat With Us
                </p>
              </div>
            </a>
          </div>

          {/* ABOUT / LINKS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              About Us
            </h3>

            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm sm:grid-cols-3">
              <Link
                href="/about"
                className="transition hover:text-orange-400"
              >
                About VC Tech
              </Link>

              <Link
                href="/shop"
                className="transition hover:text-orange-400"
              >
                All Products
              </Link>

              <Link
                href="/shop?featured=true"
                className="transition hover:text-orange-400"
              >
                Featured Products
              </Link>

              <Link
                href="/shop?offer=true"
                className="transition hover:text-orange-400"
              >
                Special Offers
              </Link>

              <Link
                href="/orders/track"
                className="transition hover:text-orange-400"
              >
                Track Order
              </Link>

              <Link
                href="/cart"
                className="transition hover:text-orange-400"
              >
                Shopping Cart
              </Link>

              <Link
                href="/checkout"
                className="transition hover:text-orange-400"
              >
                Checkout
              </Link>

              <Link
                href="/admin/login"
                className="transition hover:text-orange-400"
              >
                Admin Login
              </Link>

              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-orange-400"
              >
                Contact Us
              </a>
            </div>
          </div>

          {/* BRAND / ADDRESS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Stay Connected
            </h3>

            <Link
              href="/"
              className="mt-6 inline-block"
            >
              <SiteLogo location="footer" />
            </Link>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Your destination for laptops, computer
              accessories, gadgets and essential technology
              products.
            </p>

            <div className="mt-5 text-sm">
              <p className="font-semibold text-white">
                {address}
              </p>

              <p className="mt-2 text-slate-400">
                Phone: {phone}
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-md bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* PAYMENT / SERVICE BAR */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Shopping With VC Tech
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded bg-white/5 px-3 py-1.5 text-xs">
                Cash on Delivery
              </span>

              <span className="rounded bg-white/5 px-3 py-1.5 text-xs">
                Nationwide Delivery
              </span>

              <span className="rounded bg-white/5 px-3 py-1.5 text-xs">
                Order Tracking
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="text-sm font-bold text-orange-400 transition hover:text-orange-300"
          >
            Start Shopping →
          </Link>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-slate-800 bg-[#05121c]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} VC Tech. All
            rights reserved.
          </p>

          <p>
            Powered by VC Tech
          </p>
        </div>
      </div>
    </footer>
  );
}