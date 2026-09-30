"use client";

import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface Specification {
  key: string;
  value: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category?: Category | string;
  brand?: string;
  images?: string[];
  regularPrice: number;
  salePrice?: number;
  stock: number;
  shortDescription?: string;
  description?: string;
  specifications?: Specification[];
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isOffer: boolean;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");

  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");

  const [shortDescription, setShortDescription] = useState("");

  const [description, setDescription] = useState("");

  const [images, setImages] = useState<string[]>([]);

  const [specifications, setSpecifications] = useState<Specification[]>([]);

  const [isActive, setIsActive] = useState(true);

  const [isFeatured, setIsFeatured] = useState(false);

  const [isNewArrival, setIsNewArrival] = useState(false);

  const [isOffer, setIsOffer] = useState(false);

  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ============================================
  // LOAD PRODUCT + CATEGORIES
  // ============================================

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("moas-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [productResponse, categoryResponse] = await Promise.all([
          fetch(`${API_URL}/products/admin/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/categories/admin/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (productResponse.status === 401 || categoryResponse.status === 401) {
          localStorage.removeItem("moas-tech-admin-token");

          localStorage.removeItem("moas-tech-admin-user");

          router.replace("/admin/login");
          return;
        }

        const productData = await productResponse.json();

        const categoryData = await categoryResponse.json();

        if (!productResponse.ok) {
          const message = Array.isArray(productData?.message)
            ? productData.message.join(", ")
            : productData?.message;

          throw new Error(message || "Product could not be loaded.");
        }

        if (!categoryResponse.ok) {
          const message = Array.isArray(categoryData?.message)
            ? categoryData.message.join(", ")
            : categoryData?.message;

          throw new Error(message || "Categories could not be loaded.");
        }

        const product: Product = productData;

        setCategories(
          Array.isArray(categoryData)
            ? categoryData
            : categoryData.categories || [],
        );

        setName(product.name || "");
        setSlug(product.slug || "");
        setSku(product.sku || "");
        setBrand(product.brand || "");

        if (typeof product.category === "object" && product.category) {
          setCategory(product.category._id);
        } else {
          setCategory(product.category || "");
        }

        setRegularPrice(String(product.regularPrice ?? ""));

        setSalePrice(
          product.salePrice !== undefined && product.salePrice !== null
            ? String(product.salePrice)
            : "",
        );

        setStock(String(product.stock ?? 0));

        setShortDescription(product.shortDescription || "");

        setDescription(product.description || "");

        setImages(Array.isArray(product.images) ? product.images : []);

        setSpecifications(
          product.specifications?.length
            ? product.specifications
            : [
                {
                  key: "",
                  value: "",
                },
              ],
        );

        setIsActive(product.isActive ?? true);

        setIsFeatured(product.isFeatured ?? false);

        setIsNewArrival(product.isNewArrival ?? false);

        setIsOffer(product.isOffer ?? false);
      } catch (error) {
        console.error("Edit product loading error:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Product could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router]);

  // ============================================
  // IMAGE UPLOAD
  // ============================================

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const token = localStorage.getItem("moas-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // =========================================
    // CLIENT-SIDE FILE VALIDATION
    // =========================================

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");

      input.value = "";
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      setError("Image size cannot be larger than 5MB.");

      input.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      // =======================================
      // CREATE MULTIPART FORM DATA
      // =======================================

      const formData = new FormData();

      /*
       * IMPORTANT:
       *
       * Backend:
       * FileInterceptor("image")
       *
       * তাই field name অবশ্যই "image" হবে।
       */
      formData.append("image", file);

      // =======================================
      // UPLOAD IMAGE
      // =======================================

      const response = await fetch(`${API_URL}/uploads/product`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        /*
         * Content-Type manually set করবেন না।
         *
         * Browser নিজে multipart/form-data
         * boundary তৈরি করবে।
         */
        body: formData,
      });

      // =======================================
      // PARSE RESPONSE
      // =======================================

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      // =======================================
      // AUTH EXPIRED
      // =======================================

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("moas-tech-admin-token");

        localStorage.removeItem("moas-tech-admin-user");

        router.replace("/admin/login");
        return;
      }

      // =======================================
      // UPLOAD ERROR
      // =======================================

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Image upload failed.");
      }

      // =======================================
      // GET RETURNED IMAGE PATH
      // =======================================

      /*
       * আপনার backend বর্তমানে return করছে:
       *
       * {
       *   message: "Image uploaded successfully",
       *   image: "/uploads/products/filename.webp"
       * }
       */

      const uploadedUrl =
        data?.image ||
        data?.url ||
        data?.imageUrl ||
        data?.path ||
        data?.file?.url;

      if (!uploadedUrl || typeof uploadedUrl !== "string") {
        throw new Error("Image URL was not returned by the server.");
      }

      // =======================================
      // BUILD FULL IMAGE URL
      // =======================================

      const finalUrl = uploadedUrl.startsWith("/")
        ? `${BACKEND_URL}${uploadedUrl}`
        : uploadedUrl;

      // =======================================
      // ADD IMAGE TO PRODUCT
      // =======================================

      setImages((current) => {
        /*
         * Prevent accidental duplicate URL.
         */
        if (current.includes(finalUrl)) {
          return current;
        }

        return [...current, finalUrl];
      });

      // Allow selecting same file again later.
      input.value = "";
    } catch (error) {
      console.error("Image upload error:", error);

      setError(error instanceof Error ? error.message : "Image upload failed.");

      input.value = "";
    } finally {
      setUploading(false);
    }
  }

  // ============================================
  // REMOVE IMAGE
  // ============================================

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  // ============================================
  // SPECIFICATIONS
  // ============================================

  function addSpecification() {
    setSpecifications((current) => [
      ...current,
      {
        key: "",
        value: "",
      },
    ]);
  }

  function updateSpecification(
    index: number,
    field: "key" | "value",
    value: string,
  ) {
    setSpecifications((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function removeSpecification(index: number) {
    setSpecifications((current) => current.filter((_, i) => i !== index));
  }

  // ============================================
  // UPDATE PRODUCT
  // ============================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("moas-tech-admin-token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // =====================
    // VALIDATION
    // =====================

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!category) {
      setError("Category is required.");
      return;
    }

    if (regularPrice === "") {
      setError("Regular price is required.");
      return;
    }

    if (Number(regularPrice) < 0) {
      setError("Regular price cannot be negative.");
      return;
    }

    if (salePrice !== "" && Number(salePrice) < 0) {
      setError("Sale price cannot be negative.");
      return;
    }

    if (salePrice !== "" && Number(salePrice) > Number(regularPrice)) {
      setError("Sale price cannot be greater than regular price.");
      return;
    }

    if (stock === "") {
      setError("Stock is required.");
      return;
    }

    if (Number(stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const cleanSpecifications = specifications
        .map((item) => ({
          key: item.key.trim(),
          value: item.value.trim(),
        }))
        .filter((item) => item.key.length > 0 && item.value.length > 0);

      /*
       * IMPORTANT
       *
       * slug এখানে পাঠানো হচ্ছে না।
       *
       * Backend UpdateProductDto
       * slug accept করছে না।
       */

      const payload = {
        name: name.trim(),

        sku: sku.trim(),

        category,

        brand: brand.trim(),

        images,

        regularPrice: Number(regularPrice),

        salePrice: salePrice.trim() === "" ? 0 : Number(salePrice),

        stock: Number(stock),

        shortDescription: shortDescription.trim(),

        description: description.trim(),

        specifications: cleanSpecifications,

        isActive,

        isFeatured,

        isNewArrival,

        isOffer,
      };

      console.log("Updating product:", payload);

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: "PATCH",

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
        localStorage.removeItem("moas-tech-admin-token");

        localStorage.removeItem("moas-tech-admin-user");

        router.replace("/admin/login");

        return;
      }

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        throw new Error(message || "Product could not be updated.");
      }

      console.log("Product updated:", data);

      router.push("/admin/products");

      router.refresh();
    } catch (error) {
      console.error("Product update error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Product could not be updated.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">Loading product...</p>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AdminLayout
      title="Edit Product"
      subtitle="Update product information and inventory."
    >
      <div className="mx-auto max-w-5xl">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ================================= */}
          {/* BASIC INFORMATION */}
          {/* ================================= */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* PRODUCT NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Name *
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="HP 15 Laptop"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug
                </label>

                <input
                  value={slug}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Slug cannot be changed after product creation.
                </p>
              </div>

              {/* SKU */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  SKU *
                </label>

                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="HP-15-001"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              {/* BRAND */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Brand
                </label>

                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="HP"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              {/* CATEGORY */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category *
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500"
                >
                  <option value="">Select Category</option>

                  {categories.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ================================= */}
          {/* PRICE & INVENTORY */}
          {/* ================================= */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Price & Inventory
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Regular Price *
                </label>

                <input
                  type="number"
                  min="0"
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  placeholder="65000"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Sale Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="62000"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Stock *
                </label>

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </section>

          {/* ================================= */}
          {/* IMAGES */}
          {/* ================================= */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Product Images</h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload images directly from your Mac.
            </p>

            <div className="mt-5">
              <label
                className={`inline-flex rounded-xl px-5 py-3 font-bold ${
                  uploading
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "cursor-pointer bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                {uploading ? "Uploading..." : "+ Upload Image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2"
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="h-40 w-full rounded-lg object-contain"
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-3 top-3 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white"
                    >
                      Remove
                    </button>

                    {index === 0 && (
                      <span className="absolute bottom-3 left-3 rounded-md bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ================================= */}
          {/* DESCRIPTION */}
          {/* ================================= */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Description</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Short Description
              </label>

              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                placeholder="Short product description"
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Full product description"
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </section>

          {/* ================================= */}
          {/* SPECIFICATIONS */}
          {/* ================================= */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Specifications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add product technical specifications.
                </p>
              </div>

              <button
                type="button"
                onClick={addSpecification}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                + Add
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {specifications.map((specification, index) => (
                <div
                  key={index}
                  className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    value={specification.key}
                    onChange={(e) =>
                      updateSpecification(index, "key", e.target.value)
                    }
                    placeholder="Processor"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <input
                    value={specification.value}
                    onChange={(e) =>
                      updateSpecification(index, "value", e.target.value)
                    }
                    placeholder="Intel Core i5"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="rounded-xl bg-red-50 px-4 py-3 font-bold text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {specifications.length === 0 && (
                <button
                  type="button"
                  onClick={addSpecification}
                  className="w-full rounded-xl border border-dashed border-slate-300 p-5 text-sm font-semibold text-slate-500"
                >
                  + Add first specification
                </button>
              )}
            </div>
          </section>

          {/* ================================= */}
          {/* OPTIONS */}
          {/* ================================= */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">
              Product Options
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />

                <div>
                  <p className="font-semibold text-slate-900">Active</p>

                  <p className="text-xs text-slate-500">
                    Product is visible in store.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4"
                />

                <div>
                  <p className="font-semibold text-slate-900">Featured</p>

                  <p className="text-xs text-slate-500">
                    Show as a featured product.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="h-4 w-4"
                />

                <div>
                  <p className="font-semibold text-slate-900">New Arrival</p>

                  <p className="text-xs text-slate-500">
                    Mark product as new arrival.
                  </p>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isOffer}
                  onChange={(e) => setIsOffer(e.target.checked)}
                  className="h-4 w-4"
                />

                <div>
                  <p className="font-semibold text-slate-900">Offer</p>

                  <p className="text-xs text-slate-500">
                    Include this product in offers.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* ================================= */}
          {/* ACTIONS */}
          {/* ================================= */}

          <div className="flex flex-col-reverse gap-3 pb-10 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-lg bg-orange-500 px-8 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
