"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import SiteLogo from "@/components/home/SiteLogo";

interface HeaderProps {
  phone?: string;
  whatsapp?: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function Header({
  phone = "+8809696492358",
  whatsapp = "+8809696492358",
}: HeaderProps) {
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState("Mymensingh, Bangladesh");
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);

  const { cartCount } = useCart();

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${API_URL}/settings`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.address) {
          setAddress(data.address);
        }
      } catch (error) {
        console.error("Header settings loading error:", error);
      }
    }

    loadSettings();
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${API_URL}/settings`, {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (data?.address) {
          setAddress(data.address);
        }
      } catch (error) {
        console.error("Header settings loading error:", error);
      }
    }

    loadSettings();
  }, []);

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

    window.location.href = `/shop?search=${encodeURIComponent(value)}`;
  }

  const whatsappNumber = whatsapp.replace(/\D/g, "");

  const mainCategories = categories.filter(
    (category) => !category.parentCategory,
  );

  function getSubcategories(parentId: string) {
    return categories.filter(
      (category) =>
        category.parentCategory?._id === parentId,
    );
  }

  return (
    <>
      <header className="relative z-[120] bg-[#071724] text-white lg:sticky lg:top-0">
        {/* MAIN HEADER */}
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-4">
          {/* MOBILE MENU */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 transition-all duration-300 hover:border-orange-500/40 hover:bg-white/5 active:scale-95 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className="relative block h-5 w-5">
              <span
                className={`absolute left-0 top-[3px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "translate-y-[6px] rotate-45" : ""
                }`}
              />

              <span
                className={`absolute left-0 top-[9px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen
                    ? "scale-x-0 opacity-0"
                    : "scale-x-100 opacity-100"
                }`}
              />

              <span
                className={`absolute left-0 top-[15px] h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileMenuOpen ? "-translate-y-[6px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>

          {/* LOGO */}
          <Link
            href="/"
            className="group/logo min-w-fit shrink-0 leading-none transition-transform duration-300 md:hover:scale-[1.02]"
          >
            <SiteLogo location="header" />
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
                <p className="text-[11px] text-slate-400">Latest Offers</p>
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
                <p className="text-[11px] text-slate-400">Order Status</p>
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
      <nav className="relative z-[100] hidden overflow-visible border-b border-slate-200 bg-white shadow-sm lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-visible px-4 py-3 text-[13px] font-semibold text-slate-800">
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

          {mainCategories.map((category) => {
            const subcategories = getSubcategories(category._id);

            return (
              <div
                key={category._id}
                className="group/category relative shrink-0"
              >
                <Link
                  href={`/category/${category.slug}`}
                  className="relative flex items-center gap-1 whitespace-nowrap py-1 transition-colors duration-300 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-500 after:transition-all after:duration-300 hover:text-orange-500 hover:after:w-full"
                >
                  {category.name}

                  {subcategories.length > 0 && (
                    <span className="text-[10px] transition-transform duration-200 group-hover/category:rotate-180">
                      ▼
                    </span>
                  )}
                </Link>

                {subcategories.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-[110] min-w-[210px] translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover/category:visible group-hover/category:translate-y-0 group-hover/category:opacity-100">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                      {subcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id}
                          href={`/category/${subcategory.slug}`}
                          className="block whitespace-nowrap px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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
      <div
        aria-hidden={!mobileMenuOpen}
        className={`relative z-50 overflow-hidden border-slate-200 bg-white transition-all duration-300 ease-out lg:hidden ${
          mobileMenuOpen
            ? "max-h-[700px] translate-y-0 border-b opacity-100 shadow-lg"
            : "pointer-events-none max-h-0 -translate-y-2 border-b-0 opacity-0 shadow-none"
        }`}
      >
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

          {mainCategories.map((category) => {
            const subcategories = getSubcategories(category._id);
            const isOpen = mobileCategoryOpen === category._id;

            if (subcategories.length === 0) {
              return (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-slate-50 px-4 py-3 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 active:scale-[0.98]"
                >
                  {category.name}
                </Link>
              );
            }

            return (
              <div
                key={category._id}
                className="col-span-2 overflow-hidden rounded-lg bg-slate-50"
              >
                <div className="flex items-center">
                  <Link
                    href={`/category/${category.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-w-0 flex-1 px-4 py-3 transition hover:text-orange-600"
                  >
                    {category.name}
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setMobileCategoryOpen(
                        isOpen ? null : category._id,
                      )
                    }
                    aria-label={`Toggle ${category.name} subcategories`}
                    className="flex h-full min-h-[44px] w-12 items-center justify-center border-l border-slate-200 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
                  >
                    <span
                      className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-200 bg-white px-3 py-1.5">
                    {subcategories.map((subcategory) => (
                      <Link
                        key={subcategory._id}
                        href={`/category/${subcategory.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] font-medium leading-5 text-slate-600 transition hover:bg-orange-50 hover:text-orange-600"
                      >
                        <span className="text-[10px] text-slate-400">└</span>
                        <span>{subcategory.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

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
          {phone} · {address}
        </div>
      </div>
    </>
  );
}
