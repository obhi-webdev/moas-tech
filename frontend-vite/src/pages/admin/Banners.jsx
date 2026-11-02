import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";
import { API_URL } from "../../lib/api";

const defaults = [
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

const titles = {
  main: "Main Hero Banner",
  "side-one": "Side Banner 1",
  "side-two": "Side Banner 2",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-orange-500 focus:outline-none";

export default function Banners() {
  const [banners, setBanners] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result = await adminRequest("/banners/admin/all");
      const saved = Array.isArray(result) ? result : result.data || [];

      setBanners(defaults.map(item => {
        const existing = saved.find(b => b.position === item.position);
        return existing ? { ...item, ...existing } : item;
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (getAdminToken()) load();
  }, []);

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  function update(position, changes) {
    setBanners(current =>
      current.map(b =>
        b.position === position ? { ...b, ...changes } : b
      )
    );
  }

  async function uploadImage(event, position) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum image size is 5MB.");
      event.target.value = "";
      return;
    }

    setUploading(position);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_URL}/uploads/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed");
      }

      if (!data.image) {
        throw new Error("Image URL was not returned");
      }

      update(position, {
        image: data.image,
        imageFileId: data.fileId || "",
      });

      setMessage(
        `${titles[position]} uploaded. Click Save Banner to publish.`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading("");
      event.target.value = "";
    }
  }

  async function save(event, banner) {
    event.preventDefault();
    setSaving(banner.position);
    setError("");
    setMessage("");

    try {
      const payload = {
        position: banner.position,
        image: banner.image,
        imageFileId: banner.imageFileId || "",
        link: banner.link || "/shop",
        alt: banner.alt || titles[banner.position],
        isActive: Boolean(banner.isActive),
      };

      const result = await adminRequest(
        banner._id ? `/banners/${banner._id}` : "/banners",
        {
          method: banner._id ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );

      update(banner.position, result);
      setMessage(`${titles[banner.position]} saved successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving("");
    }
  }

  return (
    <AdminLayout
      title="Homepage Banners"
      subtitle="Upload and manage homepage hero banners."
    >
      <div className="mx-auto max-w-5xl space-y-6 text-slate-900">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-8">Loading banners...</div>
        ) : (
          banners.map(banner => (
            <form
              key={banner.position}
              onSubmit={event => save(event, banner)}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {titles[banner.position]}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Upload an image and choose where users go when they click it.
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  banner.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {banner.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[1.7fr_1fr]">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Banner Image
                    </label>

                    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-orange-400">
                      <span className="text-2xl text-slate-400">↑</span>
                      <span className="mt-2 text-sm font-bold text-slate-700">
                        {uploading === banner.position
                          ? "Uploading..."
                          : "Change Banner Image"}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        JPG, PNG or WEBP · Maximum 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={Boolean(uploading)}
                        onChange={e => uploadImage(e, banner.position)}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Click URL / Destination Link
                    </label>
                    <input
                      className={inputClass}
                      value={banner.link}
                      onChange={e => update(banner.position, { link: e.target.value })}
                      placeholder="/shop"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Example: /shop, /category/laptop or a full https:// URL.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Alt Text
                    </label>
                    <input
                      className={inputClass}
                      value={banner.alt}
                      onChange={e => update(banner.position, { alt: e.target.value })}
                      placeholder="Describe the banner"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={banner.isActive}
                      onChange={e => update(banner.position, { isActive: e.target.checked })}
                      className="h-5 w-5 accent-orange-500"
                    />
                    <span>
                      <strong className="block text-sm">Show on homepage</strong>
                      <span className="text-xs text-slate-500">
                        Turn this off to temporarily hide the banner.
                      </span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={saving === banner.position || uploading === banner.position}
                    className="rounded-xl bg-orange-500 px-7 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                  >
                    {saving === banner.position ? "Saving..." : "Save Banner"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-slate-700">Preview</h3>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.alt}
                          className="aspect-video w-full object-contain"
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Click Destination
                    </p>
                    <p className="mt-2 break-all font-semibold text-slate-700">
                      {banner.link || "/shop"}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
