"use client";

import { ChangeEvent, useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

interface Settings {
  _id?: string;
  siteName?: string;
  logo?: string;
  logoFileId?: string;
  address?: string;
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/settings`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load settings");
      }

      const data: Settings = await response.json();

      setSettings(data);
      setPreview(data.logo || "");
      setAddress(data.address || "");
      setAddress(data.address || "");
    } catch (err) {
      console.error(err);
      setError("Could not load website branding.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Logo image must be smaller than 3 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  }

  async function handleSave() {
    if (!selectedFile) {
      setError("Please choose a new logo first.");
      return;
    }

    const token = localStorage.getItem(
      "vc-tech-admin-token",
    );

    if (!token) {
      setError("Admin login required.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    let uploadedFileId = "";

    try {
      // 1. Upload new logo first
      const formData = new FormData();
      formData.append("image", selectedFile);

      const uploadResponse = await fetch(
        `${API_URL}/uploads/logo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadData?.message || "Logo upload failed",
        );
      }

      uploadedFileId = uploadData.fileId || "";

      // 2. Save uploaded logo to Settings
      const settingsResponse = await fetch(
        `${API_URL}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            logo: uploadData.image,
            logoFileId: uploadedFileId,
          }),
        },
      );

      const settingsData =
        await settingsResponse.json();

      if (!settingsResponse.ok) {
        throw new Error(
          settingsData?.message ||
            "Could not save logo settings",
        );
      }

      const updated =
        settingsData.settings || settingsData;

      setSettings(updated);
      setPreview(updated.logo || uploadData.image);
      setSelectedFile(null);

      setMessage(
        "Website logo updated successfully.",
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Logo update failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveLogo() {
    if (!settings.logo) {
      setError("There is no uploaded logo to remove.");
      return;
    }

    const confirmed = window.confirm(
      "Remove the current logo and restore the default VC TECH logo?",
    );

    if (!confirmed) return;

    const token = localStorage.getItem(
      "vc-tech-admin-token",
    );

    if (!token) {
      setError("Admin login required.");
      return;
    }

    setRemoving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            logo: "",
            logoFileId: "",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Could not remove logo",
        );
      }

      const updated = data.settings || data;

      setSettings(updated);
      setPreview("");
      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "logo",
        ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage(
        "Custom logo removed. Default VC TECH logo restored.",
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Logo removal failed.",
      );
    } finally {
      setRemoving(false);
    }
  }

  async function handleSaveAddress() {
    const cleanAddress = address.trim();

    if (!cleanAddress) {
      setError("Please enter a business location.");
      return;
    }

    const token = localStorage.getItem(
      "vc-tech-admin-token",
    );

    if (!token) {
      setError("Admin login required.");
      return;
    }

    setSavingAddress(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            address: cleanAddress,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not update business location",
        );
      }

      const updated = data.settings || data;

      setSettings(updated);
      setAddress(updated.address || cleanAddress);

      setMessage(
        "Business location updated successfully.",
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Location update failed.",
      );
    } finally {
      setSavingAddress(false);
    }
  }

  return (
    <AdminLayout
      title="Website Branding"
      subtitle="Manage the logo used across your VC Tech website."
    >
      <div className="mx-auto max-w-4xl p-4 md:p-6 lg:p-8">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Loading branding settings...
          </div>
        ) : (
          <>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Website Logo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload the main logo shown in the website
                header and footer.
              </p>
            </div>

            <div className="space-y-7 p-6">
              <div>
                <p className="mb-3 text-sm font-bold text-slate-700">
                  Logo Preview
                </p>

                <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#071724] p-6">
                  {preview ? (
                    <img
                      src={preview}
                      alt="VC Tech logo preview"
                      className="max-h-24 max-w-[280px] object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-black tracking-tight">
                        <span className="text-orange-500">
                          VC
                        </span>
                        <span className="text-white">
                          {" "}
                          TECH
                        </span>
                      </div>

                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                        Technology Store
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="logo"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Upload New Logo
                </label>

                <input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-orange-600"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  PNG, JPG or WEBP • Maximum 3 MB •
                  Transparent PNG/WEBP recommended.
                </p>
              </div>

              {selectedFile && (
                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Selected:{" "}
                  <span className="font-semibold text-slate-800">
                    {selectedFile.name}
                  </span>
                </div>
              )}

              {message && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {message}
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  disabled={!settings.logo || removing || saving}
                  className="rounded-lg border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {removing
                    ? "Removing..."
                    : "Remove Current Logo"}
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedFile || saving || removing}
                  className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Uploading & Saving..."
                    : "Save Logo"}
                </button>
              </div>
            </div>
          </div>

          {/* BUSINESS LOCATION */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Business Location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This location is shown across the website.
              </p>
            </div>

            <div className="p-6">
              <label
                htmlFor="business-location"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Location
              </label>

              <input
                id="business-location"
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Example: Mymensingh, Bangladesh"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />

              <p className="mt-2 text-xs text-slate-500">
                Example: Uttara, Dhaka, Bangladesh
              </p>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={
                    savingAddress ||
                    !address.trim()
                  }
                  className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingAddress
                    ? "Saving..."
                    : "Save Location"}
                </button>
              </div>
            </div>
          </div>

          {/* BUSINESS LOCATION */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                Business Location
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                This location is shown across the website.
              </p>
            </div>

            <div className="p-6">
              <label
                htmlFor="business-location"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                Location
              </label>

              <input
                id="business-location"
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Example: Mymensingh, Bangladesh"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              />

              <p className="mt-2 text-xs text-slate-500">
                Example: Uttara, Dhaka, Bangladesh
              </p>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  disabled={
                    savingAddress ||
                    !address.trim()
                  }
                  className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingAddress
                    ? "Saving..."
                    : "Save Location"}
                </button>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
