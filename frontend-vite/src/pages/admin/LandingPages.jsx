import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";

const types = [
  "hero", "text", "image", "features",
  "reviews", "faq", "cta", "product"
];

const empty = {
  title: "",
  slug: "",
  status: "draft",
  description: "",
  seoTitle: "",
  seoDescription: "",
  productId: null,
  sections: [],
};

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-orange-500";

const buttonClass =
  "rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50";

const slugify = text =>
  text.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function LandingPages() {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const result = await adminRequest("/landing-pages/admin/all");
      setPages(Array.isArray(result.pages) ? result.pages : []);
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

  function startCreate() {
    setForm({ ...empty, sections: [] });
    setEditingId(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function startEdit(page) {
    setForm({
      title: page.title || "",
      slug: page.slug || "",
      status: page.status || "draft",
      description: page.description || "",
      seoTitle: page.seoTitle || "",
      seoDescription: page.seoDescription || "",
      productId: page.productId?._id || page.productId || null,
      sections: (page.sections || []).map(section => ({
        type: section.type,
        heading: section.heading || "",
        body: section.body || "",
        imageUrl: section.imageUrl || "",
        buttonText: section.buttonText || "",
        buttonUrl: section.buttonUrl || "",
      })),
    });

    setEditingId(page._id);
    setShowForm(true);
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(name, value) {
    setForm(current => ({ ...current, [name]: value }));
  }

  function addSection(type) {
    setForm(current => ({
      ...current,
      sections: [
        ...current.sections,
        {
          type,
          heading: "",
          body: "",
          imageUrl: "",
          buttonText: "",
          buttonUrl: "",
        },
      ],
    }));
  }

  function updateSection(index, name, value) {
    setForm(current => ({
      ...current,
      sections: current.sections.map((section, i) =>
        i === index ? { ...section, [name]: value } : section
      ),
    }));
  }

  function removeSection(index) {
    setForm(current => ({
      ...current,
      sections: current.sections.filter((_, i) => i !== index),
    }));
  }

  function moveSection(index, direction) {
    const nextIndex = index + direction;

    setForm(current => {
      if (nextIndex < 0 || nextIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];
      [sections[index], sections[nextIndex]] =
        [sections[nextIndex], sections[index]];

      return { ...current, sections };
    });
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim().toLowerCase(),
        productId: form.productId || null,
      };

      const endpoint = editingId
        ? `/landing-pages/admin/${editingId}`
        : "/landing-pages/admin";

      await adminRequest(endpoint, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });

      setMessage(editingId
        ? "Landing page updated successfully."
        : "Landing page created successfully.");

      setShowForm(false);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(page) {
    if (!window.confirm(`Delete "${page.title}" permanently?`)) return;

    setBusy(true);
    setError("");

    try {
      await adminRequest(`/landing-pages/admin/${page._id}`, {
        method: "DELETE",
      });

      setMessage("Landing page deleted successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const published = pages.filter(p => p.status === "published").length;
  const drafts = pages.filter(p => p.status === "draft").length;

  return (
    <AdminLayout
      title="Landing Pages"
      subtitle="Create, manage and publish product landing pages."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Landing Page Manager
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Build campaign pages without editing website code.
            </p>
          </div>

          <button
            type="button"
            className={buttonClass}
            onClick={startCreate}
          >
            + Create New Page
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Total Pages", pages.length],
            ["Published", published],
            ["Drafts", drafts],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div role="status" className="rounded-xl bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {showForm && (
          <form onSubmit={save} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold">
                {editingId ? "Edit Landing Page" : "Create Landing Page"}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm font-semibold text-slate-500"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                Page Title
                <input
                  required
                  minLength={2}
                  maxLength={200}
                  className={fieldClass}
                  value={form.title}
                  onChange={event => {
                    const title = event.target.value;
                    setForm(current => ({
                      ...current,
                      title,
                      slug: editingId ? current.slug : slugify(title),
                    }));
                  }}
                />
              </label>

              <label className="space-y-2 text-sm font-semibold">
                URL Slug
                <input
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  maxLength={150}
                  className={fieldClass}
                  value={form.slug}
                  onChange={event => updateField("slug", slugify(event.target.value))}
                />
              </label>

              <label className="space-y-2 text-sm font-semibold">
                Status
                <select
                  className={fieldClass}
                  value={form.status}
                  onChange={event => updateField("status", event.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-semibold">
                Product ID (optional)
                <input
                  className={fieldClass}
                  value={form.productId || ""}
                  onChange={event => updateField("productId", event.target.value || null)}
                  placeholder="MongoDB Product ID"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-semibold">
              Description
              <textarea
                className={fieldClass}
                rows={3}
                maxLength={5000}
                value={form.description}
                onChange={event => updateField("description", event.target.value)}
              />
            </label>

            <div className="space-y-4 border-t border-slate-200 pt-5">
              <div>
                <h4 className="text-lg font-bold">Page Sections</h4>
                <p className="text-sm text-slate-500">
                  Add sections and arrange their display order.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => addSection(type)}
                    disabled={form.sections.length >= 50}
                    className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-bold capitalize text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                  >
                    + {type}
                  </button>
                ))}
              </div>

              {form.sections.map((section, index) => (
                <div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="font-bold capitalize">
                      {index + 1}. {section.type}
                    </h5>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => moveSection(index, -1)}
                        disabled={index === 0} className="rounded border px-3 py-1 disabled:opacity-30">
                        ↑
                      </button>
                      <button type="button" onClick={() => moveSection(index, 1)}
                        disabled={index === form.sections.length - 1} className="rounded border px-3 py-1 disabled:opacity-30">
                        ↓
                      </button>
                      <button type="button" onClick={() => removeSection(index)}
                        className="rounded border border-red-200 px-3 py-1 text-red-600">
                        Remove
                      </button>
                    </div>
                  </div>

                  <input
                    className={fieldClass}
                    placeholder="Section Heading"
                    maxLength={250}
                    value={section.heading}
                    onChange={event => updateSection(index, "heading", event.target.value)}
                  />

                  <textarea
                    className={fieldClass}
                    rows={4}
                    maxLength={10000}
                    placeholder="Section Content"
                    value={section.body}
                    onChange={event => updateSection(index, "body", event.target.value)}
                  />

                  <input
                    className={fieldClass}
                    placeholder="Image URL"
                    maxLength={2000}
                    value={section.imageUrl}
                    onChange={event => updateSection(index, "imageUrl", event.target.value)}
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className={fieldClass}
                      placeholder="Button Text"
                      maxLength={150}
                      value={section.buttonText}
                      onChange={event => updateSection(index, "buttonText", event.target.value)}
                    />
                    <input
                      className={fieldClass}
                      placeholder="Button URL"
                      maxLength={2000}
                      value={section.buttonUrl}
                      onChange={event => updateSection(index, "buttonUrl", event.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-5">
              <h4 className="text-lg font-bold">SEO Settings</h4>

              <input
                className={fieldClass}
                placeholder="SEO Title"
                maxLength={200}
                value={form.seoTitle}
                onChange={event => updateField("seoTitle", event.target.value)}
              />

              <textarea
                className={fieldClass}
                rows={3}
                maxLength={500}
                placeholder="SEO Meta Description"
                value={form.seoDescription}
                onChange={event => updateField("seoDescription", event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? "Saving..." : editingId ? "Update Page" : "Create Page"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-300 px-5 py-3 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["Page", "Status", "Updated", "Actions"].map(label => (
                  <th key={label} className="px-5 py-4 font-bold">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center">Loading pages...</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">
                  No landing pages yet. Create your first page.
                </td></tr>
              ) : pages.map(page => (
                <tr key={page._id}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{page.title}</p>
                    <p className="text-xs text-slate-500">/lp/{page.slug}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      page.status === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {page.updatedAt
                      ? new Date(page.updatedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3">
                      <button type="button" onClick={() => startEdit(page)}
                        className="font-bold text-orange-600">
                        Edit
                      </button>
                      {page.status === "published" && (
                        <a
                          href={`/lp/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600"
                        >
                          View
                        </a>
                      )}
                      <button type="button" disabled={busy}
                        onClick={() => remove(page)}
                        className="font-bold text-red-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
