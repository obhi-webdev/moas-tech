"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

type BannerPosition =
  | "main"
  | "side-one"
  | "side-two";

interface Banner {
  _id?: string;
  position: BannerPosition;
  image: string;
  link: string;
  alt: string;
  isActive: boolean;
}

const defaultBanners: Banner[] = [
  {
    position: "main",
    image: "/hero-banner.png",
    link: "/shop",
    alt: "VC Tech",
    isActive: true,
  },
  {
    position: "side-one",
    image: "/side-banner-1.jpg",
    link: "/shop?offer=true",
    alt: "VC Tech Special Offer",
    isActive: true,
  },
  {
    position: "side-two",
    image: "/side-banner-2.jpg",
    link: "/orders/track",
    alt: "VC Tech Order Support",
    isActive: true,
  },
];

function bannerTitle(position: BannerPosition) {
  if (position === "main") {
    return "Main Hero Banner";
  }

  if (position === "side-one") {
    return "Side Banner 1";
  }

  return "Side Banner 2";
}

export default function AdminBannersPage() {
  const router = useRouter();

  const [banners, setBanners] =
    useState<Banner[]>(defaultBanners);

  const [loading, setLoading] = useState(true);

  const [savingPosition, setSavingPosition] =
    useState<BannerPosition | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBanners() {
      const token = localStorage.getItem(
        "vc-tech-admin-token",
      );

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/banners/admin/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        let data: Banner[] | any = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (response.status === 401) {
          localStorage.removeItem(
            "vc-tech-admin-token",
          );

          localStorage.removeItem(
            "vc-tech-admin-user",
          );

          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Banners could not be loaded.",
          );
        }

        if (Array.isArray(data)) {
          setBanners(
            defaultBanners.map((fallback) => {
              const saved = data.find(
                (item) =>
                  item.position ===
                  fallback.position,
              );

              return saved
                ? {
                    ...fallback,
                    ...saved,
                  }
                : fallback;
            }),
          );
        }
      } catch (err) {
        console.error(
          "Banner loading error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Banners could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadBanners();
  }, [router]);

  function updateBanner(
    position: BannerPosition,
    field: keyof Banner,
    value: string | boolean,
  ) {
    setBanners((current) =>
      current.map((banner) =>
        banner.position === position
          ? {
              ...banner,
              [field]: value,
            }
          : banner,
      ),
    );
  }

  async function saveBanner(
    event: FormEvent<HTMLFormElement>,
    banner: Banner,
  ) {
    event.preventDefault();

    const token = localStorage.getItem(
      "vc-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!banner.image.trim()) {
      setError("Banner image is required.");
      return;
    }

    try {
      setSavingPosition(banner.position);
      setMessage("");
      setError("");

      const payload = {
        position: banner.position,
        image: banner.image.trim(),
        link: banner.link.trim() || "/shop",
        alt: banner.alt.trim(),
        isActive: banner.isActive,
      };

      const endpoint = banner._id
        ? `${API_URL}/banners/${banner._id}`
        : `${API_URL}/banners`;

      const method = banner._id
        ? "PATCH"
        : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (response.status === 401) {
        localStorage.removeItem(
          "vc-tech-admin-token",
        );

        localStorage.removeItem(
          "vc-tech-admin-user",
        );

        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        const responseMessage =
          Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

        throw new Error(
          responseMessage ||
            "Banner could not be saved.",
        );
      }

      setBanners((current) =>
        current.map((item) =>
          item.position === banner.position
            ? {
                ...item,
                ...data,
              }
            : item,
        ),
      );

      setMessage(
        `${bannerTitle(
          banner.position,
        )} saved successfully.`,
      );
    } catch (err) {
      console.error("Banner save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Banner could not be saved.",
      );
    } finally {
      setSavingPosition(null);
    }
  }

  return (
    <AdminLayout
      title="Homepage Banners"
      subtitle="Manage the main hero and side banners displayed on the VC Tech homepage."
    >
      <div className="mx-auto max-w-6xl">

        {message && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

            <p className="mt-4 font-semibold text-slate-600">
              Loading banners...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {banners.map((banner) => (
              <form
                key={banner.position}
                onSubmit={(event) =>
                  saveBanner(event, banner)
                }
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {bannerTitle(
                          banner.position,
                        )}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {banner.position === "main"
                          ? "Large banner on the left side of the homepage hero."
                          : "Small banner displayed on the right side of the hero."}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                      {banner.position}
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_320px] md:p-6">

                  <div className="space-y-5">

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Image URL *
                      </label>

                      <input
                        type="text"
                        value={banner.image}
                        onChange={(
                          event: ChangeEvent<HTMLInputElement>,
                        ) =>
                          updateBanner(
                            banner.position,
                            "image",
                            event.target.value,
                          )
                        }
                        placeholder="https://example.com/banner.jpg"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Destination Link
                      </label>

                      <input
                        type="text"
                        value={banner.link}
                        onChange={(event) =>
                          updateBanner(
                            banner.position,
                            "link",
                            event.target.value,
                          )
                        }
                        placeholder="/shop"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />

                      <p className="mt-2 text-xs text-slate-500">
                        Example: /shop,
                        /shop?offer=true or a full URL.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Image Alt Text
                      </label>

                      <input
                        type="text"
                        value={banner.alt}
                        onChange={(event) =>
                          updateBanner(
                            banner.position,
                            "alt",
                            event.target.value,
                          )
                        }
                        placeholder="VC Tech promotional banner"
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={banner.isActive}
                        onChange={(event) =>
                          updateBanner(
                            banner.position,
                            "isActive",
                            event.target.checked,
                          )
                        }
                        className="h-5 w-5 accent-orange-500"
                      />

                      <span className="text-sm font-semibold text-slate-700">
                        Show this banner on homepage
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={
                        savingPosition ===
                        banner.position
                      }
                      className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingPosition ===
                      banner.position
                        ? "Saving..."
                        : "Save Banner"}
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Preview
                    </p>

                    <div
                      className={`relative flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 ${
                        banner.position === "main"
                          ? "aspect-[16/7]"
                          : "aspect-[16/9]"
                      }`}
                    >
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={
                            banner.alt ||
                            bannerTitle(
                              banner.position,
                            )
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Changes appear on the
                      homepage after this banner
                      is connected to the Hero
                      component.
                    </p>
                  </div>

                </div>
              </form>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
