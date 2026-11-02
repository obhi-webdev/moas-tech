import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken } from "../../lib/adminApi";

const statuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const transitions = {
  pending: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const statusStyles = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  processing: "bg-purple-50 text-purple-700",
  shipped: "bg-cyan-50 text-cyan-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const money = value =>
  new Intl.NumberFormat("en-BD").format(Number(value) || 0);

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
      statusStyles[status] || "bg-slate-100 text-slate-600"
    }`}>
      {status || "Unknown"}
    </span>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function OrderDetails({ order, onClose }) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-slate-900 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-extrabold">Order Details</h2>
            <p className="mt-1 text-sm text-slate-500">
              {order.orderNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 font-semibold"
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 font-bold">Customer Information</h3>
            <p>{order.customerName}</p>
            <p>{order.phone}</p>
            {order.email && <p>{order.email}</p>}
            <p className="mt-2">{order.address}</p>
            <p>{order.district}</p>
          </div>

          <div>
            <h3 className="mb-3 font-bold">Order Information</h3>
            <p>Date: {formatDate(order.createdAt)}</p>
            <p className="mt-2">
              Status: <StatusBadge status={order.status} />
            </p>
            <p className="mt-2">
              Payment: {String(order.paymentMethod || "cod").toUpperCase()}
            </p>
            <p>Payment Status: {order.paymentStatus || "unpaid"}</p>
            <p>Delivery Area: {order.deliveryArea || "—"}</p>
          </div>
        </div>

        <h3 className="mb-3 mt-7 font-bold">Ordered Products</h3>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[450px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Price</th>
                <th className="p-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="h-12 w-12 rounded-lg object-contain"
                        />
                      )}
                      <span className="font-semibold">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">৳{money(item.price)}</td>
                  <td className="p-3">
                    ৳{money(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-5 max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>৳{money(order.subtotal)}</strong>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <strong>৳{money(order.deliveryCharge)}</strong>
          </div>
          <div className="flex justify-between border-t pt-3 text-lg">
            <strong>Total</strong>
            <strong>৳{money(order.total)}</strong>
          </div>
        </div>

        {order.note && (
          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <strong>Customer Note</strong>
            <p className="mt-1 text-sm">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (filter) query.set("status", filter);

      const result = await adminRequest(
        `/orders/admin/all?${query.toString()}`
      );

      const list = result.orders || result.data || [];
      setOrders(Array.isArray(list) ? list : []);
      setPagination(result.pagination || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    if (getAdminToken()) load();
  }, [load]);

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  async function changeStatus(order, status) {
    if (!transitions[order.status]?.includes(status)) return;

    if (!window.confirm(
      `Change order ${order.orderNumber} to "${status}"?`
    )) return;

    setBusy(order._id);
    setError("");
    setMessage("");

    try {
      await adminRequest(`/orders/admin/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage(`Order ${order.orderNumber} updated to ${status}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <AdminLayout
      title="Orders"
      subtitle="Manage customer orders and fulfillment."
    >
      <div className="space-y-6 text-slate-900">
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

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Total Orders"
            value={pagination?.total ?? "—"}
          />
          <SummaryCard label="Current Page" value={page} />
          <SummaryCard
            label="Total Pages"
            value={pagination?.totalPages ?? "—"}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
            <div>
              <h2 className="text-xl font-extrabold">Customer Orders</h2>
              <p className="mt-1 text-sm text-slate-500">
                View orders, payments and fulfillment details.
              </p>
            </div>

            <select
              value={filter}
              onChange={event => {
                setFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="p-8 text-slate-500">Loading orders...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="p-4">Order</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order._id}
                      className="border-t border-slate-100 align-top"
                    >
                      <td className="p-4">
                        <button
                          onClick={() => setSelected(order)}
                          className="max-w-[160px] break-words text-left font-extrabold text-slate-900 hover:text-orange-600"
                        >
                          {order.orderNumber}
                        </button>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold">{order.customerName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.phone}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {order.district || order.address || "—"}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-bold">
                          {(order.items || []).reduce(
                            (sum, item) => sum + Number(item.quantity || 0),
                            0
                          )} item(s)
                        </p>
                        <p className="mt-1 max-w-[200px] truncate text-xs text-slate-500">
                          {(order.items || [])
                            .map(item => item.name)
                            .join(", ")}
                        </p>
                      </td>

                      <td className="p-4 font-extrabold">
                        ৳{money(order.total)}
                      </td>

                      <td className="p-4">
                        <p className="font-bold uppercase">
                          {order.paymentMethod || "cod"}
                        </p>
                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {order.paymentStatus || "unpaid"}
                        </p>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => setSelected(order)}
                          className="mb-2 rounded-lg bg-orange-50 px-3 py-2 font-semibold text-orange-700"
                        >
                          Details
                        </button>

                        {transitions[order.status]?.length > 0 && (
                          <select
                            value={order.status}
                            disabled={busy === order._id}
                            onChange={event =>
                              changeStatus(order, event.target.value)
                            }
                            className="block rounded-lg border border-slate-300 bg-white p-2 text-xs"
                          >
                            <option value={order.status}>
                              {order.status}
                            </option>
                            {transitions[order.status].map(status => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!orders.length && (
                <p className="p-8 text-center text-slate-500">
                  No orders found.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t p-5">
            <p className="text-sm text-slate-500">
              Page {pagination?.page ?? page} of{" "}
              {pagination?.totalPages ?? 1}
            </p>

            <div className="flex gap-2">
              <button
                disabled={loading || page <= 1}
                onClick={() => setPage(current => current - 1)}
                className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-40"
              >
                Previous
              </button>

              <button
                disabled={
                  loading ||
                  !pagination ||
                  page >= pagination.totalPages
                }
                onClick={() => setPage(current => current + 1)}
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderDetails
        order={selected}
        onClose={() => setSelected(null)}
      />
    </AdminLayout>
  );
}
