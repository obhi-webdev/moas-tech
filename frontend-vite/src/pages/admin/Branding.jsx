import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";
import { API_URL } from "../../lib/api";

export default function Branding() {
  const [settings, setSettings] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [address, setAddress] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const data = await adminRequest("/settings");
      const value = data.settings || data;
      setSettings(value);
      setPreview(value.logo || "");
      setAddress(value.address || "");
      setSiteTitle(value.siteTitle || value.siteName || "VC Tech");
      setFaviconPreview(value.favicon || "");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (getAdminToken()) load();
  }, []);

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type)) {
      setError("Only PNG, JPG or WEBP images are allowed.");
      return;
    }

    if (selected.size > 3 * 1024 * 1024) {
      setError("Maximum logo size is 3 MB.");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError("");
    setMessage("");
  }

  async function saveLogo() {
    if (!file) {
      setError("Please choose a logo first.");
      return;
    }

    setBusy("logo");
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/uploads/logo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: formData,
      });

      const uploaded = await response.json();

      if (!response.ok) {
        throw new Error(uploaded.message || "Logo upload failed.");
      }

      await adminRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          logo: uploaded.image,
          logoFileId: uploaded.fileId,
        }),
      });

      setFile(null);
      setMessage("Website logo saved successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function removeLogo() {
    if (!window.confirm("Remove the current website logo?")) return;

    setBusy("remove");
    setError("");
    setMessage("");

    try {
      await adminRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          logo: "",
          logoFileId: "",
        }),
      });

      setFile(null);
      setMessage("Website logo removed.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  function chooseFavicon(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type)) {
      setError("Only PNG, JPG or WebP favicon images are allowed.");
      return;
    }

    if (selected.size > 1024 * 1024) {
      setError("Favicon must be smaller than 1 MB.");
      return;
    }

    setFaviconFile(selected);
    setFaviconPreview(URL.createObjectURL(selected));
    setError("");
    setMessage("");
  }

  async function saveSiteTitle(event) {
    event.preventDefault();

    const title = siteTitle.trim();
    if (!title || title.length > 150) {
      setError("Website title must contain 1 to 150 characters.");
      return;
    }

    setBusy("title");
    setError("");
    setMessage("");

    try {
      await adminRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({ siteTitle: title }),
      });

      document.title = title;
      setMessage("Website title updated successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function saveFavicon() {
    if (!faviconFile) {
      setError("Please choose a favicon first.");
      return;
    }

    setBusy("favicon");
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("image", faviconFile);

      const response = await fetch(`${API_URL}/uploads/favicon`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: formData,
      });

      const uploaded = await response.json();

      if (!response.ok) {
        throw new Error(uploaded.message || "Favicon upload failed.");
      }

      await adminRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          favicon: uploaded.image,
          faviconFileId: uploaded.fileId,
        }),
      });

      let link = document.querySelector('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = uploaded.image;

      setFaviconFile(null);
      setMessage("Website favicon updated successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function removeFavicon() {
    if (!window.confirm("Remove the current website favicon?")) return;

    setBusy("favicon-remove");
    setError("");
    setMessage("");

    try {
      await adminRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({
          favicon: "",
          faviconFileId: "",
        }),
      });

      const link = document.querySelector('link[rel="icon"]');
      if (link) link.href = "/favicon.svg";

      setFaviconFile(null);
      setMessage("Website favicon removed.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function saveAddress(event) {
    event.preventDefault();
    setBusy("address");
    setError("");
    setMessage("");

    try {
      await adminRequest("/settings", {
        method: "PATCH",
        body: JSON.stringify({ address: address.trim() }),
      });

      setMessage("Business location updated successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminLayout
      title="Website Branding"
      subtitle="Manage the logo used across your VC Tech website."
    >
      <div className="mx-auto max-w-4xl space-y-6 text-slate-900">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="text-xl font-bold">Website Logo</h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload the main logo shown in the website header and footer.
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <p className="mb-3 text-sm font-bold">Logo Preview</p>

              <div className="flex min-h-32 items-center justify-center rounded-xl bg-[#071724] p-6">
                {preview ? (
                  <img
                    src={preview}
                    alt="Website logo preview"
                    className="max-h-24 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-white">
                      <span className="text-orange-500">VC</span> TECH
                    </div>
                    <p className="mt-2 text-xs tracking-[0.3em] text-slate-400">
                      TECHNOLOGY STORE
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                Upload New Logo
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={chooseFile}
                className="block w-full rounded-lg border border-slate-300 p-3"
              />
              <p className="mt-2 text-xs text-slate-500">
                PNG, JPG or WEBP. Maximum 3 MB.
              </p>
            </div>

            <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
              <button
                onClick={removeLogo}
                disabled={Boolean(busy) || !settings.logo}
                className="rounded-lg border border-red-200 px-5 py-3 font-semibold text-red-600 disabled:opacity-40"
              >
                Remove Current Logo
              </button>

              <button
                onClick={saveLogo}
                disabled={Boolean(busy) || !file}
                className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-40"
              >
                {busy === "logo" ? "Uploading..." : "Save Logo"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Browser Tab Title</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set the title shown in your website browser tab.
          </p>

          <form onSubmit={saveSiteTitle} className="mt-5 space-y-4">
            <input
              type="text"
              maxLength={150}
              value={siteTitle}
              onChange={event => setSiteTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="VC Tech | Gadgets & Electronics"
            />

            <button
              type="submit"
              disabled={Boolean(busy)}
              className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-40"
            >
              {busy === "title" ? "Saving..." : "Save Website Title"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Website Favicon</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload the small icon shown in browser tabs.
            Recommended size: 512 × 512 pixels.
          </p>

          <div className="mt-5 flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
            {faviconPreview ? (
              <img
                src={faviconPreview}
                alt="Favicon preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-xs text-slate-400">No favicon</span>
            )}
          </div>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={chooseFavicon}
            className="mt-5 block w-full rounded-lg border border-slate-300 p-3"
          />

          <p className="mt-2 text-xs text-slate-500">
            PNG, JPG or WebP. Maximum 1 MB.
          </p>

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={removeFavicon}
              disabled={Boolean(busy) || !settings.favicon}
              className="rounded-lg border border-red-200 px-5 py-3 font-semibold text-red-600 disabled:opacity-40"
            >
              Remove Favicon
            </button>

            <button
              type="button"
              onClick={saveFavicon}
              disabled={Boolean(busy) || !faviconFile}
              className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-40"
            >
              {busy === "favicon" ? "Uploading..." : "Save Favicon"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Business Location</h2>
          <p className="mt-1 text-sm text-slate-500">
            This location is shown across the website.
          </p>

          <form onSubmit={saveAddress} className="mt-5 space-y-4">
            <textarea
              rows={4}
              value={address}
              onChange={event => setAddress(event.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="Enter business address"
            />

            <button
              disabled={Boolean(busy)}
              className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-40"
            >
              {busy === "address" ? "Saving..." : "Save Location"}
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
