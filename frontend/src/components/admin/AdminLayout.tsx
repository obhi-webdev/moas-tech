"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: "▦",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: "□",
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: "▤",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: "◎",
  },
  {
    name: "Banners",
    href: "/admin/banners",
    icon: "▧",
  },
];

export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [adminName, setAdminName] = useState("Admin");

  useEffect(() => {
    const savedUser = localStorage.getItem(
      "vc-tech-admin-user",
    );

    if (!savedUser) return;

    try {
      const user = JSON.parse(savedUser);

      if (user?.name) {
        setAdminName(user.name);
      }
    } catch {
      // Ignore invalid saved user
    }
  }, []);

  function logout() {
    localStorage.removeItem("vc-tech-admin-token");
    localStorage.removeItem("vc-tech-admin-user");

    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] lg:flex">

      {/* Sidebar */}

      <aside className="border-b border-slate-200 bg-[#071724] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:border-b-0">

        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <Link
            href="/admin/dashboard"
            className="text-xl font-black"
          >
            <span className="text-white">VC</span>{" "}
            <span className="text-orange-500">Tech</span>

            <span className="ml-2 text-xs font-medium text-slate-400">
              Admin
            </span>
          </Link>
        </div>

        <nav className="flex gap-2 overflow-x-auto p-3 lg:block lg:space-y-1 lg:p-4">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-sm">
                  {item.icon}
                </span>

                {item.name}
              </Link>
            );
          })}

          <Link
            href="/"
            target="_blank"
            className="flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
              ↗
            </span>

            View Store
          </Link>
        </nav>
      </aside>

      {/* Content */}

      <div className="min-w-0 flex-1 lg:ml-64">

        {/* Header */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">

            <div>
              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-1 hidden text-sm text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-slate-800">
                  {adminName}
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                {adminName.charAt(0).toUpperCase()}
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
