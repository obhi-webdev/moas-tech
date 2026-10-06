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
    alt: "VC Tech Main Banner",
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
  switch (position) {
    case "main":
      return "Main Hero Banner";

    case "side-one":
      return "Side Banner 1";

    default:
      return "Side Banner 2";
  }
}

export default function AdminBannersPage() {
  const router = useRouter();

  const [banners, setBanners] =
    useState<Banner[]>(defaultBanners);

  const [loading, setLoading] = useState(true);

  const [uploadingPosition, setUploadingPosition] =
    useState<BannerPosition | null>(null);

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

        let data: any = null;

        try {
          data = await response.json();
        } catch {
          data = null;
        }

        if (
          response.status === 401 ||
          response.status === 403
        ) {
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
                (item: Banner) =>
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

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>,
    position: BannerPosition,
  ) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed.",
      );

      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size cannot be larger than 5MB.",
      );

      input.value = "";
      return;
    }

    const token = localStorage.getItem(
      "vc-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    try {
      setUploadingPosition(position);
      setMessage("");
      setError("");

      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch(
        `${API_URL}/uploads/banner`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        },
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
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
            "Banner image upload failed.",
        );
      }

      const uploadedUrl =
        data?.image ||
        data?.url ||
        data?.imageUrl ||
        data?.path ||
        data?.file?.url;

      if (!uploadedUrl) {
        throw new Error(
          "Upload succeeded but image URL was not returned.",
        );
      }

      updateBanner(
        position,
        "image",
        uploadedUrl,
      );

      setMessage(
        `${bannerTitle(
          position,
        )} image uploaded. Click Save Banner to publish it.`,
      );
    } catch (err) {
      console.error(
        "Banner image upload error:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Banner image upload failed.",
      );
    } finally {
      setUploadingPosition(null);
      input.value = "";
    }
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
      setError(
        "Please upload a banner image first.",
      );
      return;
    }

    try {
      setSavingPosition(banner.position);
      setMessage("");
      setError("");

      const payload = {
        position: banner.position,
        image: banner.image.trim(),
        link: banner.link.trim() || "/",
        alt:
          banner.alt.trim() ||
          bannerTitle(banner.position),
        isActive: banner.isActive,
      };

      const endpoint = banner._id
        ? `${API_URL}/banners/${banner._id}`
        : `${API_URL}/banners`;

      const response = await fetch(endpoint, {
        method: banner._id
          ? "PATCH"
          : "POST",

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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
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
      console.error(
        "Banner save error:",
        err,
      );

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
      subtitle="Upload and manage homepage hero banners."
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
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading banners...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {banners.map((banner) => {
              const uploading =
                uploadingPosition ===
                banner.position;

              const saving =
                savingPosition ===
                banner.position;

              return (
                <form
                  key={banner.position}
                  onSubmit={(event) =>
                    saveBanner(
                      event,
                      banner,
                    )
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
                          Upload an image and
                          choose where users go
                          when they click it.
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          banner.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {banner.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>
                  </div>

                  <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_380px] md:p-6">

                    <div className="space-y-5">

                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Banner Image
                        </label>

                        <label
                          className={`flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition ${
                            uploading
                              ? "cursor-wait border-orange-300 bg-orange-50"
                              : "border-slate-300 bg-slate-50 hover:border-orange-400 hover:bg-orange-50/50"
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploading}
                            onChange={(event) =>
                              uploadImage(
                                event,
                                banner.position,
                              )
                            }
                            className="hidden"
                          />

                          <span className="text-2xl">
                            {uploading
                              ? "◌"
                              : "↑"}
                          </span>

                          <span className="mt-2 text-sm font-bold text-slate-700">
                            {uploading
                              ? "Uploading image..."
                              : banner.image
                                ? "Change Banner Image"
                                : "Choose Banner Image"}
                          </span>

                          <span className="mt-1 text-xs text-slate-500">
                            JPG, PNG or WEBP •
                            Maximum 5MB
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Click URL /
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
                          placeholder="/category/laptop"
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          Example:
                          {" "}
                          /shop,
                          {" "}
                          /category/laptop,
                          {" "}
                          /product/product-slug
                          {" "}
                          or a full https:// URL.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Alt Text
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
                          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
                        <input
                          type="checkbox"
                          checked={
                            banner.isActive
                          }
                          onChange={(event) =>
                            updateBanner(
                              banner.position,
                              "isActive",
                              event.target.checked,
                            )
                          }
                          className="h-5 w-5 accent-orange-500"
                        />

                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Show on homepage
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            Turn this off to
                            temporarily hide the
                            banner.
                          </p>
                        </div>
                      </label>

                      <button
                        type="submit"
                        disabled={
                          saving ||
                          uploading
                        }
                        className="inline-flex min-w-36 items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving
                          ? "Saving..."
                          : "Save Banner"}
                      </button>

                    </div>

                    <div>
                      <p className="mb-2 text-sm font-bold text-slate-700">
                        Preview
                      </p>

                      <div
                        className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${
                          banner.position ===
                          "main"
                            ? "aspect-[2659/984]"
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
                          <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                            No image selected
                          </div>
                        )}
                      </div>

                      <div className="mt-4 rounded-lg bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Click Destination
                        </p>

                        <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                          {banner.link || "/"}
                        </p>
                      </div>
                    </div>

                  </div>
                </form>
              );
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
