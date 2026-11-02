import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";

export default function MetaMarketing() {
  const [form, setForm] = useState({
    pixelId: "",
    accessToken: "",
    testEventCode: "",
    enabled: false,
  });

  const [hasToken, setHasToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    adminRequest("/meta/settings")
      .then(data => {
        if (!active) return;
        setForm({
          pixelId: data.pixelId || "",
          accessToken: "",
          testEventCode: data.testEventCode || "",
          enabled: Boolean(data.enabled),
        });
        setHasToken(Boolean(data.hasAccessToken));
      })
      .catch(err => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  function change(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        pixelId: form.pixelId.trim(),
        testEventCode: form.testEventCode.trim(),
        enabled: form.enabled,
      };

      if (form.accessToken.trim()) {
        payload.accessToken = form.accessToken.trim();
      }

      await adminRequest("/meta/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (payload.accessToken) setHasToken(true);
      setForm(prev => ({ ...prev, accessToken: "" }));
      setMessage("Meta Marketing settings saved successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:outline-none";

  return (
    <AdminLayout
      title="Meta Marketing"
      subtitle="Configure Meta Pixel and Conversions API"
    >
      <div className="max-w-3xl space-y-6 text-slate-900">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Pixel & Conversions API</h2>
            <p className="mt-2 text-sm text-slate-500">
              Manage your Meta advertising event tracking configuration.
            </p>
          </div>

          {loading ? (
            <p>Loading Meta settings...</p>
          ) : (
            <form onSubmit={save} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Meta Pixel ID
                </label>
                <input
                  className={fieldClass}
                  value={form.pixelId}
                  onChange={e => change("pixelId", e.target.value)}
                  placeholder="Enter Meta Pixel ID"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Conversions API Access Token
                </label>
                <input
                  className={fieldClass}
                  type="password"
                  autoComplete="new-password"
                  value={form.accessToken}
                  onChange={e => change("accessToken", e.target.value)}
                  placeholder={
                    hasToken
                      ? "Token configured. Enter a new token to replace."
                      : "Enter CAPI Access Token"
                  }
                />
                <p className="mt-2 text-xs text-slate-500">
                  {hasToken
                    ? "Access Token is securely stored."
                    : "No Access Token configured yet."}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Test Event Code
                </label>
                <input
                  className={fieldClass}
                  value={form.testEventCode}
                  onChange={e => change("testEventCode", e.target.value)}
                  placeholder="TEST12345 (optional)"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use a test code from Meta Events Manager during testing.
                  Remove it before production tracking.
                </p>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={e => change("enabled", e.target.checked)}
                  className="h-5 w-5 accent-orange-500"
                />
                <span>
                  <strong className="block">Enable Meta Tracking</strong>
                  <span className="text-sm text-slate-500">
                    Activate tracking when event integration is ready.
                  </span>
                </span>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-700">{message}</p>}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Meta Settings"}
              </button>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="font-semibold text-amber-900">Tracking Status</h3>
          <p className="mt-2 text-sm text-amber-800">
            Settings configuration is available. Browser Pixel and server-side
            CAPI event delivery will be connected in the next development stage.
            Saving settings alone does not send events.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
