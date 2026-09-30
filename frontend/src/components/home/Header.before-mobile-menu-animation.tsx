"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  phone?: string;
  whatsapp?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

export default function Header({
  phone = "01614106550",
  whatsapp = "01614106550",
}: HeaderProps) {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { cartCount } = useCart();

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) return;

        const data: Category[] = await response.json();

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Header category loading error:", error);
      }
    }

    loadCategories();
  }, []);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    window.location.href =
      `/shop?search=${encodeURIComponent(value)}`;
  }

  const whatsappNumber = whatsapp.replace(/\D/g, "");

  return (
    <>
      <header className="relative z-50 bg-[#071724] text-white">
        {/* MAIN HEADER */}
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4">
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 transition-all duration-300 hover:border-orange-500/40 hover:bg-white/5 active:scale-95 lg:hidden"
            aria-label="Toggle menu"
          >
            <span className="text-xl">☰</span>
          </button>

          {/* LOGO */}
          <Link
            href="/"
            className="group/logo min-w-fit shrink-0 leading-none transition-transform duration-300 md:hover:scale-[1.02]"
          >
            <div className="text-2xl font-black tracking-tight md:text-3xl">
              <span className="text-orange-500">MOAS</span>
              <span className="text-white"> TECH</span>
            </div>

            <div className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-400 sm:block">
              Technology Store
            </div>
          </Link>

          {/* DESKTOP SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden min-w-0 flex-1 md:flex"
          >
            <div className="flex w-full overflow-hidden rounded-md bg-white ring-1 ring-transparent transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/70 focus-within:shadow-lg focus-within:shadow-black/10">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="min-w-0 flex-1 bg-white px-5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                aria-label="Search"
                className="flex w-14 items-center justify-center text-xl text-slate-900 transition-all duration-300 hover:bg-orange-500 hover:text-white active:scale-95"
              >
                ⌕
              </button>
            </div>
          </form>

          {/* HEADER ACTIONS */}
          <div className="ml-auto flex shrink-0 items-center gap-2 xl:gap-5">
            <Link
              href="/shop?offer=true"
              className="group/action hidden items-center gap-3 transition-all duration-300 lg:flex lg:hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-xl text-orange-500 transition-all duration-300 group-hover/action:bg-orange-500 group-hover/action:text-white group-hover/action:scale-105">
                🎁
              </div>

              <div>
                <p className="text-sm font-bold">Offers</p>
                <p className="text-[11px] text-slate-400">
                  Latest Offers
                </p>
              </div>
            </Link>

            <Link
              href="/orders/track"
              className="group/action hidden items-center gap-3 transition-all duration-300 xl:flex xl:hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-lg text-orange-500 transition-all duration-300 group-hover/action:bg-orange-500 group-hover/action:text-white group-hover/action:scale-105">
                ⚡
              </div>

              <div>
                <p className="text-sm font-bold">Track Order</p>
                <p className="text-[11px] text-slate-400">
                  Order Status
                </p>
              </div>
            </Link>

            <Link
              href="/admin/login"
              className="group/action hidden items-center gap-3 transition-all duration-300 lg:flex lg:hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-lg text-orange-500 transition-all duration-300 group-hover/action:bg-orange-500 group-hover/action:text-white group-hover/action:scale-105">
                👤
              </div>

              <div>
                <p className="text-sm font-bold">Account</p>
                <p className="text-[11px] text-slate-400">
                  Admin Login
                </p>
              </div>
            </Link>

            <Link
              href="/cart"
              className="relative flex h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 active:scale-[0.97]"
            >
              Cart

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* MOBILE SEARCH */}
        <div className="px-4 pb-4 md:hidden">
          <form
            onSubmit={handleSearch}
            className="flex overflow-hidden rounded-md bg-white ring-1 ring-transparent transition-all duration-300 focus-within:ring-2 focus-within:ring-orange-500/70"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search laptop, accessories, gadgets..."
              className="min-w-0 flex-1 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />

            <button
              type="submit"
              className="bg-orange-500 px-5 text-sm font-bold text-white transition-all duration-300 hover:bg-orange-600 active:scale-[0.97]"
            >
              Search
            </button>
          </form>
        </div>
      </header>

      {/* DESKTOP CATEGORY NAVIGATION */}
      <nav className="sticky top-0 z-40 hidden border-b border-slate-200 bg-white shadow-sm lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-3 text-[13px] font-semibold text-slate-800">
          <Link
            href="/"
            className="relative shrink-0 py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:text-orange-500 hover:after:w-full"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="relative shrink-0 py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:text-orange-500 hover:after:w-full"
          >
            All Products
          </Link>

          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/category/${category.slug}`}
              className="relative shrink-0 whitespace-nowrap py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:text-orange-500 hover:after:w-full"
            >
              {category.name}
            </Link>
          ))}

          <Link
            href="/shop?featured=true"
            className="relative shrink-0 whitespace-nowrap py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:text-orange-500 hover:after:w-full"
          >
            Featured
          </Link>

          <Link
            href="/shop?offer=true"
            className="shrink-0 whitespace-nowrap font-bold text-orange-500"
          >
            Offers
          </Link>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="relative z-50 border-b border-slate-200 bg-white shadow-lg lg:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-4 py-4 text-sm font-semibold text-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
            >
              All Products
            </Link>

            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
              >
                {category.name}
              </Link>
            ))}

            <Link
              href="/shop?featured=true"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
            >
              Featured
            </Link>

            <Link
              href="/shop?offer=true"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
            >
              Offers
            </Link>

            <Link
              href="/orders/track"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
            >
              Track Order
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
            >
              About Us
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-green-50 px-4 py-3 text-green-700"
            >
              WhatsApp
            </a>
          </div>

          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            {phone} · Mymensingh, Bangladesh
          </div>
        </div>
      )}
    </>
  );
}
