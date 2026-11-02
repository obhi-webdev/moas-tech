import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  parentCategory: "",
  isActive: true,
  sortOrder: 0,
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      setLoading(true);
      const result = await adminRequest("/categories/admin/all");
      const items = Array.isArray(result)
        ? result
        : result.categories || result.data || [];

      setCategories(Array.isArray(items) ? items : []);
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

  function change(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function startEdit(category) {
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      parentCategory: category.parentCategory?._id ||
        category.parentCategory || "",
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder ?? 0,
    });

    setEditingId(category._id);
    setShowForm(true);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        parentCategory: form.parentCategory || null,
        isActive: Boolean(form.isActive),
        sortOrder: Number(form.sortOrder) || 0,
      };

      await adminRequest(
        editingId ? `/categories/${editingId}` : "/categories",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );

      setMessage(
        editingId
          ? "Category updated successfully."
          : "Category created successfully."
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(category) {
    if (!window.confirm(`Delete "${category.name}"?`)) return;

    setDeletingId(category._id);
    setError("");
    setMessage("");

    try {
      await adminRequest(`/categories/${category._id}`, {
        method: "DELETE",
      });

      setMessage("Category deleted successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId("");
    }
  }

  const sorted = [...categories].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <AdminLayout
      title="Categories"
      subtitle="Manage VC Tech product categories."
    >
      <div className="space-y-6 text-slate-900">
        <div className="flex justify-end">
          <button
            onClick={() => showForm ? setShowForm(false) : startCreate()}
            className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
          >
            {showForm ? "Close Form" : "+ Add Category"}
          </button>
        </div>

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

        {showForm && (
          <form
            onSubmit={save}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category Name
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={e => change("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.sortOrder}
                  onChange={e => change("sortOrder", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category Image URL
                </label>
                <input
                  className={inputClass}
                  value={form.image}
                  onChange={e => change("image", e.target.value)}
                  placeholder="https://..."
                />
                <p className="mt-2 text-xs text-slate-500">
                  Image upload will be connected separately.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Parent Category
                </label>
                <select
                  className={inputClass}
                  value={form.parentCategory}
                  onChange={e => change("parentCategory", e.target.value)}
                >
                  <option value="">Main Category</option>
                  {categories
                    .filter(c =>
                      c._id !== editingId &&
                      !c.parentCategory
                    )
                    .map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                rows={3}
                className={inputClass}
                value={form.description}
                onChange={e => change("description", e.target.value)}
              />
            </div>

            <label className="mt-5 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => change("isActive", e.target.checked)}
                className="h-5 w-5 accent-orange-500"
              />
              <span className="font-semibold">Active Category</span>
            </label>

            <div className="mt-6 flex gap-3">
              <button
                disabled={saving}
                className="rounded-xl bg-orange-500 px-7 py-3 font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-xl font-bold">
              All Categories ({categories.length})
            </h2>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Loading categories...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4">Category</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Sort</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sorted.map(category => (
                    <tr key={category._id} className="border-t border-slate-100">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="font-bold text-slate-400">
                                {category.name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="font-bold">{category.name}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        {category.slug}
                      </td>

                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                          category.isActive !== false
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {category.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-4">{category.sortOrder ?? 0}</td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(category)}
                            className="rounded-lg bg-orange-50 px-3 py-2 font-semibold text-orange-700"
                          >
                            Edit
                          </button>

                          <button
                            disabled={deletingId === category._id}
                            onClick={() => remove(category)}
                            className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-600 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
