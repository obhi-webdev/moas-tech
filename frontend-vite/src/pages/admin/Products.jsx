import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";
import { getCategories } from "../../lib/api";

const initial = {
  name: "",
  sku: "",
  category: "",
  brand: "",
  regularPrice: "",
  salePrice: "",
  stock: "0",
  images: "",
  shortDescription: "",
  description: "",
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isOffer: false,
};

const money = value =>
  new Intl.NumberFormat("en-BD").format(Number(value) || 0);

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initial);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        adminRequest("/products/admin/all"),
        getCategories(),
      ]);

      const productList = Array.isArray(p)
        ? p
        : p.products || p.data || [];

      const categoryList = Array.isArray(c)
        ? c
        : c.categories || c.data || [];

      setProducts(Array.isArray(productList) ? productList : []);
      setCategories(Array.isArray(categoryList) ? categoryList : []);
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

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm(previous => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function addProduct() {
    setForm(initial);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function edit(product) {
    setEditingId(product._id);
    setForm({
      ...initial,
      ...product,
      category: product.category?._id || product.category || "",
      regularPrice: String(product.regularPrice ?? ""),
      salePrice:
        product.salePrice == null ? "" : String(product.salePrice),
      stock: String(product.stock ?? 0),
      images: Array.isArray(product.images)
        ? product.images.join("\n")
        : "",
    });

    setShowForm(true);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const body = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category,
        brand: form.brand.trim(),
        regularPrice: Number(form.regularPrice),
        salePrice:
          form.salePrice === "" ? null : Number(form.salePrice),
        stock: Number(form.stock),
        images: form.images
          .split("\n")
          .map(image => image.trim())
          .filter(Boolean),
        shortDescription: form.shortDescription,
        description: form.description,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isOffer: form.isOffer,
      };

      await adminRequest(
        editingId ? `/products/${editingId}` : "/products",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(body),
        }
      );

      setShowForm(false);
      setEditingId(null);
      setForm(initial);
      setMessage("Product saved successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setDeletingId(product._id);
    setError("");
    setMessage("");

    try {
      await adminRequest(`/products/${product._id}`, {
        method: "DELETE",
      });

      setMessage("Product deleted successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  }

  const field = (label, name, type = "text") => (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <input
        className={inputClass}
        name={name}
        type={type}
        value={form[name]}
        onChange={change}
        required={["name", "sku", "regularPrice"].includes(name)}
        min={type === "number" ? 0 : undefined}
      />
    </label>
  );

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage products, pricing and inventory."
    >
      <div className="space-y-6 text-slate-900">
        <div className="flex justify-end">
          <button
            onClick={() => showForm ? setShowForm(false) : addProduct()}
            className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            {showForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={save}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {field("Product Name", "name")}
              {field("SKU", "sku")}

              <label className="block text-sm font-semibold">
                Category
                <select
                  className={inputClass}
                  name="category"
                  value={form.category}
                  onChange={change}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {field("Brand", "brand")}
              {field("Regular Price", "regularPrice", "number")}
              {field("Sale Price", "salePrice", "number")}
              {field("Stock", "stock", "number")}
            </div>

            {[
              ["Image URLs (one per line)", "images", 3],
              ["Short Description", "shortDescription", 2],
              ["Description", "description", 4],
            ].map(([label, name, rows]) => (
              <label key={name} className="mt-4 block text-sm font-semibold">
                {label}
                <textarea
                  className={inputClass}
                  rows={rows}
                  name={name}
                  value={form[name]}
                  onChange={change}
                />
              </label>
            ))}

            <div className="my-5 flex flex-wrap gap-5">
              {[
                ["isActive", "Active"],
                ["isFeatured", "Featured"],
                ["isNewArrival", "New Arrival"],
                ["isOffer", "Offer"],
              ].map(([name, label]) => (
                <label key={name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={name}
                    checked={form[name]}
                    onChange={change}
                    className="accent-orange-500"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                disabled={busy}
                className="rounded-lg bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Saving..."
                  : editingId
                    ? "Update Product"
                    : "Save Product"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-6 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-slate-500">Loading products...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(product => {
                    const price =
                      product.salePrice ?? product.regularPrice;

                    return (
                      <tr
                        key={product._id}
                        className="border-t border-slate-100"
                      >
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-slate-400">
                                  No image
                                </span>
                              )}
                            </div>

                            <div className="max-w-[240px]">
                              <div className="font-bold leading-5">
                                {product.name}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                SKU: {product.sku}
                              </div>
                              {product.brand && (
                                <div className="text-xs text-slate-500">
                                  {product.brand}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="p-4 text-slate-600">
                          {product.category?.name ||
                            categories.find(
                              category =>
                                category._id === product.category
                            )?.name ||
                            "—"}
                        </td>

                        <td className="p-4">
                          <div className="font-bold">
                            ৳{money(price)}
                          </div>

                          {product.salePrice != null &&
                            product.salePrice < product.regularPrice && (
                              <div className="text-xs text-slate-400 line-through">
                                ৳{money(product.regularPrice)}
                              </div>
                            )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              product.stock > 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} in stock`
                              : "Out of stock"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-1.5">
                            <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {product.isActive ? "Active" : "Inactive"}
                            </span>

                            {product.isFeatured && (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                                Featured
                              </span>
                            )}

                            {product.isOffer && (
                              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">
                                Offer
                              </span>
                            )}

                            {product.isNewArrival && (
                              <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">
                                New
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => edit(product)}
                              className="rounded-lg bg-orange-50 px-3 py-2 font-semibold text-orange-700"
                            >
                              Edit
                            </button>

                            <button
                              disabled={deletingId === product._id}
                              onClick={() => remove(product)}
                              className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-600 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!products.length && (
                <p className="p-6 text-center text-slate-500">
                  No products found.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
