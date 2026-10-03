"use client";

import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

export default function AddProductPage() {
  const router = useRouter();

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

  const [specifications, setSpecifications] =
    useState<Specification[]>([
      {
        key: "",
        value: "",
      },
    ]);

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOffer, setIsOffer] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(
      "moas-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    async function loadCategories() {
      try {
        const response = await fetch(
          `${API_URL}/categories/admin/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "moas-tech-admin-token",
          );

          localStorage.removeItem(
            "moas-tech-admin-user",
          );

          router.replace("/admin/login");
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Categories could not be loaded.",
          );
        }

        setCategories(
          Array.isArray(data)
            ? data
            : data.categories || [],
        );
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Categories could not be loaded.",
        );
      }
    }

    loadCategories();
  }, [router]);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);

    setSlug(createSlug(value));
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);

    if (selectedFiles.length === 0) return;

    const token = localStorage.getItem(
      "moas-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxFileSize = 5 * 1024 * 1024;
    const remainingSlots = Math.max(0, 8 - images.length);

    if (remainingSlots === 0) {
      setError("Maximum 8 product images are allowed.");
      input.value = "";
      return;
    }

    const files = selectedFiles.slice(0, remainingSlots);

    const invalidType = files.find(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidType) {
      setError(
        `${invalidType.name}: Only JPG, PNG and WEBP images are allowed.`,
      );
      input.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > maxFileSize,
    );

    if (oversizedFile) {
      setError(
        `${oversizedFile.name}: Image size cannot be larger than 5MB.`,
      );
      input.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

      const uploadedImages: string[] = [];

      for (const file of files) {
        const formData = new FormData();

        formData.append("image", file);

        const response = await fetch(
          `${API_URL}/uploads/product`,
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
            "moas-tech-admin-token",
          );
          localStorage.removeItem(
            "moas-tech-admin-user",
          );

          router.replace("/admin/login");
          return;
        }

        if (!response.ok) {
          const message = Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

          throw new Error(
            message ||
              `Failed to upload ${file.name}.`,
          );
        }

        const uploadedUrl =
          data?.image ||
          data?.url ||
          data?.imageUrl ||
          data?.path ||
          data?.file?.url;

        if (
          !uploadedUrl ||
          typeof uploadedUrl !== "string"
        ) {
          throw new Error(
            `Image URL was not returned for ${file.name}.`,
          );
        }

        const finalUrl = uploadedUrl.startsWith("/")
          ? `${BACKEND_URL}${uploadedUrl}`
          : uploadedUrl;

        uploadedImages.push(finalUrl);
      }

      setImages((current) => [
        ...current,
        ...uploadedImages.filter(
          (url) => !current.includes(url),
        ),
      ]);

      if (selectedFiles.length > remainingSlots) {
        setError(
          `Maximum 8 images are allowed. Only ${remainingSlots} image(s) were uploaded.`,
        );
      }
    } catch (error) {
      console.error("Image upload error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Image upload failed.",
      );
    } finally {
      input.value = "";
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, i) => i !== index),
    );
  }

  function setMainImage(index: number) {
    setImages((current) => {
      if (index <= 0 || index >= current.length) {
        return current;
      }

      const next = [...current];
      const [selected] = next.splice(index, 1);

      next.unshift(selected);

      return next;
    });
  }

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
      current.map((specification, i) =>
        i === index
          ? {
              ...specification,
              [field]: value,
            }
          : specification,
      ),
    );
  }

  function removeSpecification(index: number) {
    setSpecifications((current) =>
      current.filter((_, i) => i !== index),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const token = localStorage.getItem(
      "moas-tech-admin-token",
    );

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (!regularPrice) {
      setError("Regular price is required.");
      return;
    }

    if (!stock) {
      setError("Stock is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const cleanSpecifications =
        specifications.filter(
          (specification) =>
            specification.key.trim() &&
            specification.value.trim(),
        );

      const payload = {
        name: name.trim(),
        sku: sku.trim(),

        category,

        brand: brand.trim(),

        images,

        regularPrice: Number(regularPrice),

        salePrice: salePrice
          ? Number(salePrice)
          : 0,

        stock: Number(stock),

        shortDescription:
          shortDescription.trim(),

        description: description.trim(),

        specifications:
          cleanSpecifications,

        isActive,
        isFeatured,
        isNewArrival,
        isOffer,
      };

      const response = await fetch(
        `${API_URL}/products`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;

        throw new Error(
          message || "Product could not be created.",
        );
      }

      router.push("/admin/products");
    } catch (error) {
      console.error("Product create error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Product could not be created.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout
      title="Add Product"
      subtitle="Add a new product to VS Tech."
    >
      <div className="mx-auto max-w-5xl">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic Information */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold text-slate-900">
              Basic Information
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Name *
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="HP 15 Laptop"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Slug *
                </label>

                <input
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="hp-15-laptop"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  SKU *
                </label>

                <input
                  value={sku}
                  onChange={(event) =>
                    setSku(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="HP-15-001"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Brand
                </label>

                <input
                  value={brand}
                  onChange={(event) =>
                    setBrand(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="HP"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category *
                </label>

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (categoryItem) => (
                      <option
                        key={
                          categoryItem._id
                        }
                        value={
                          categoryItem._id
                        }
                      >
                        {
                          categoryItem.name
                        }
                      </option>
                    ),
                  )}

                </select>
              </div>

            </div>
          </section>

          {/* Price & Stock */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
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
                  onChange={(event) =>
                    setRegularPrice(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="65000"
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
                  onChange={(event) =>
                    setSalePrice(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="62000"
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
                  onChange={(event) =>
                    setStock(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="10"
                />
              </div>

            </div>
          </section>

          {/* Images */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Product Images
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload product images directly from your Mac.
            </p>

            <div className="mt-5">

              <label className="inline-flex cursor-pointer rounded-xl bg-blue-50 px-5 py-3 font-bold text-blue-700 hover:bg-blue-100">

                {uploading
                  ? "Uploading..."
                  : "+ Upload Images"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleImageUpload
                  }
                  disabled={uploading}
                  className="hidden"
                />

              </label>

            </div>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

                {images.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative rounded-xl border border-slate-200 bg-slate-50 p-2"
                    >

                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="h-40 w-full object-contain"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute right-2 top-2 rounded-lg bg-red-600 px-2 py-1 text-xs font-bold text-white"
                      >
                        Remove
                      </button>

                      {index === 0 ? (
                        <span className="absolute bottom-2 left-2 rounded-md bg-slate-900 px-2 py-1 text-xs font-bold text-white">
                          Main
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setMainImage(index)
                          }
                          className="absolute bottom-2 left-2 rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow transition hover:bg-orange-500 hover:text-white"
                        >
                          Set as Main
                        </button>
                      )}

                    </div>
                  ),
                )}

              </div>
            )}

          </section>

          {/* Description */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Description
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Short Description
                </label>

                <textarea
                  value={shortDescription}
                  onChange={(event) =>
                    setShortDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={6}
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

            </div>
          </section>

          {/* Specifications */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                Specifications
              </h2>

              <button
                type="button"
                onClick={addSpecification}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"
              >
                + Add
              </button>

            </div>

            <div className="mt-5 space-y-3">

              {specifications.map(
                (specification, index) => (
                  <div
                    key={index}
                    className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                  >

                    <input
                      value={
                        specification.key
                      }
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          "key",
                          event.target.value,
                        )
                      }
                      placeholder="Processor"
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />

                    <input
                      value={
                        specification.value
                      }
                      onChange={(event) =>
                        updateSpecification(
                          index,
                          "value",
                          event.target.value,
                        )
                      }
                      placeholder="Intel Core i5"
                      className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeSpecification(
                          index,
                        )
                      }
                      className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
                    >
                      Remove
                    </button>

                  </div>
                ),
              )}

            </div>
          </section>

          {/* Options */}

          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Product Options
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(
                      event.target.checked,
                    )
                  }
                />

                <span className="font-semibold">
                  Active Product
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(event) =>
                    setIsFeatured(
                      event.target.checked,
                    )
                  }
                />

                <span className="font-semibold">
                  Featured
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(event) =>
                    setIsNewArrival(
                      event.target.checked,
                    )
                  }
                />

                <span className="font-semibold">
                  New Arrival
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={isOffer}
                  onChange={(event) =>
                    setIsOffer(
                      event.target.checked,
                    )
                  }
                />

                <span className="font-semibold">
                  Offer Product
                </span>
              </label>

            </div>
          </section>

          {/* Save */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Link
              href="/admin/products"
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                submitting || uploading
              }
              className="rounded-lg bg-orange-500 px-8 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving Product..."
                : "Save Product"}
            </button>

          </div>

        </form>
      </div>
    </AdminLayout>
  );
}
