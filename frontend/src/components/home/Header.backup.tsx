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

  const { cartCount } = useCart();

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch(`${API_URL}/categories`);

        if (!response.ok) {
          return;
        }

        const data: Category[] = await response.json();

        setCategories(
          Array.isArray(data)
            ? data.slice(0, 5)
            : [],
        );
      } catch (error) {
        console.error("Header category loading error:", error);
      }
    }

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    window.location.href = `/shop?search=${encodeURIComponent(value)}`;
  };

  const whatsappNumber = whatsapp.replace(/\D/g, "");

  return (
    <>
      <div className="bg-blue-700 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-sm">
          <p>Welcome to MOAS Tech</p>

          <div className="flex gap-4">
            <span>{phone}</span>
            <span>Mymensingh, Bangladesh</span>
          </div>
        </div>
      </div>

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-5">
          <Link href="/" className="shrink-0 text-2xl font-bold tracking-tight">
            <span className="text-blue-700">MOAS</span>{" "}
            <span className="text-orange-500">Tech</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search laptop, monitor, keyboard..."
              className="w-full rounded-l-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600"
            />

            <button
              type="submit"
              className="rounded-r-lg bg-blue-700 px-6 font-medium text-white transition hover:bg-blue-800"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium transition hover:bg-gray-50"
            >
              Cart
              {cartCount > 0 && (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 sm:block"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-4 md:hidden">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-l-lg border border-gray-300 px-4 py-3 text-sm outline-none"
            />

            <button
              type="submit"
              className="rounded-r-lg bg-blue-700 px-5 text-sm font-medium text-white"
            >
              Search
            </button>
          </form>
        </div>

        <nav className="border-t border-gray-100">
          <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-4 py-3 text-sm font-medium">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="whitespace-nowrap transition hover:text-blue-700"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/shop?featured=true">Featured</Link>
            <Link href="/shop?offer=true">Offers</Link>
            <Link href="/about">About Us</Link>
          </div>
        </nav>
      </header>
    </>
  );
}
