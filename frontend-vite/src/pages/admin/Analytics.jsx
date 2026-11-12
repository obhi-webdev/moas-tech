import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";

const money = value =>
  new Intl.NumberFormat("en-BD").format(value || 0);

function Metric({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAdminToken()) return;

    let active = true;
    setLoading(true);
    setError("");

    adminRequest(`/analytics/admin/overview?days=${days}`)
      .then(result => {
        if (active) setData(result);
      })
      .catch(err => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [days]);

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  const summary = data?.summary;
  const trend = data?.trend || [];
  const maxViews = Math.max(1, ...trend.map(p => p.views));

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Website traffic, product performance and sales insights"
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {[7, 30, 90].map(value => (
          <button
            key={value}
            onClick={() => setDays(value)}
            className={`rounded-xl px-5 py-3 text-sm font-bold ${
              days === value
                ? "bg-orange-500 text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {value} Days
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-600">Loading analytics...</p>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            <Metric title="Page Views" value={money(summary.views)}
              note="Total tracked page loads" />
            <Metric title="Unique Visitors"
              value={money(summary.uniqueVisitors)}
              note="Approximate unique browser sessions" />
            <Metric title="Orders" value={money(summary.orders)}
              note="Excluding cancelled orders" />
            <Metric title="Revenue" value={`৳${money(summary.revenue)}`}
              note="Delivered orders only" />
            <Metric title="Conversion Rate"
              value={`${summary.conversionRate}%`}
              note="Orders divided by tracked visitors" />
            <Metric title="Product Views"
              value={money(summary.productViews)}
              note={`Landing page views: ${money(summary.landingViews)}`} />
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Daily Page Views
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              UTC reporting days
            </p>

            <div className="mt-6 flex h-48 items-end gap-1 overflow-hidden">
              {trend.map(point => (
                <div
                  key={point.date}
                  title={`${point.date}: ${point.views} views`}
                  className="min-w-0 flex-1 rounded-t bg-orange-500"
                  style={{
                    height: `${Math.max(
                      2, point.views / maxViews * 100
                    )}%`
                  }}
                />
              ))}
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>{trend[0]?.date}</span>
              <span>{trend[trend.length - 1]?.date}</span>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Most Viewed Pages
            </h2>

            <div className="mt-4 divide-y divide-slate-100">
              {data.topPages.length ? data.topPages.map(item => (
                <div
                  key={item.path}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="break-all text-sm text-slate-700">
                    {item.path}
                  </span>
                  <span className="font-bold text-slate-900">
                    {money(item.views)}
                  </span>
                </div>
              )) : (
                <p className="py-5 text-sm text-slate-500">
                  No tracking data yet.
                </p>
              )}
            </div>
          </section>
        </>
      ) : null}
    </AdminLayout>
  );
}
