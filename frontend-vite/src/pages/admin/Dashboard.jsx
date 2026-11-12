"use client";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { adminRequest, getAdminToken, logoutAdmin } from "../../lib/adminApi";

function formatPrice(value) {
  return new Intl.NumberFormat("en-BD").format(value || 0);
}

function statusClass(status) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    case "shipped":
      return "bg-purple-100 text-purple-700";

    case "processing":
      return "bg-orange-100 text-orange-700";

    case "confirmed":
      return "bg-cyan-100 text-cyan-700";

    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!getAdminToken()) {
        navigate("/admin/login", { replace: true });
        return;
      }

      try {
        await adminRequest("/products/admin/all");

        const [productResult, orderResult] = await Promise.all([
          adminRequest("/products/admin/all"),
          adminRequest("/orders/admin/all"),
        ]);

        const products = Array.isArray(productResult)
          ? productResult
          : productResult.products || productResult.data || [];

        const orders = Array.isArray(orderResult)
          ? orderResult
          : orderResult.orders || orderResult.data || [];

        const count = status =>
          orders.filter(order => order.status === status).length;

        const delivered = orders.filter(
          order => order.status === "delivered"
        );

        const stats = {
          products: {
            total: products.length,
            active: products.filter(p => p.isActive).length,
            lowStock: products.filter(
              p => Number(p.stock) > 0 && Number(p.stock) <= 5
            ).length,
            outOfStock: products.filter(
              p => Number(p.stock) === 0
            ).length,
          },
          orders: {
            total: orders.length,
            pending: count("pending"),
            confirmed: count("confirmed"),
            processing: count("processing"),
            shipped: count("shipped"),
            delivered: count("delivered"),
            cancelled: count("cancelled"),
          },
          sales: {
            total: delivered.reduce(
              (sum, order) => sum + Number(order.total || 0), 0
            ),
          },
          recentOrders: [...orders]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10),
        };

        if (active) setData(stats);
      } catch (err) {
        if (!active) return;
        setError(err.message);

        if (/401|403|unauthorized|forbidden/i.test(err.message)) {
          logoutAdmin();
          navigate("/admin/login", { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => { active = false; };
  }, [navigate]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="font-semibold text-slate-600">
          Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your VC Tech store."
    >
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Main Stats */}

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Total Products
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.products.total}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {data.products.active} active
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Total Orders
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {data.orders.total}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {data.orders.pending} pending
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Delivered
                </p>

                <p className="mt-3 text-3xl font-bold text-green-700">
                  {data.orders.delivered}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Completed orders
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Total Sales
                </p>

                <p className="mt-3 text-3xl font-bold text-blue-700">
                  ৳{formatPrice(data.sales.total)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Delivered order revenue
                </p>
              </div>

            </div>

            {/* Order Status */}

            <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6">

              <h3 className="text-xl font-bold text-slate-900">
                Order Status
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

                <div className="rounded-xl bg-yellow-50 p-4">
                  <p className="text-2xl font-bold text-yellow-700">
                    {data.orders.pending}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Pending
                  </p>
                </div>

                <div className="rounded-xl bg-cyan-50 p-4">
                  <p className="text-2xl font-bold text-cyan-700">
                    {data.orders.confirmed}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Confirmed
                  </p>
                </div>

                <div className="rounded-xl bg-orange-50 p-4">
                  <p className="text-2xl font-bold text-orange-700">
                    {data.orders.processing}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Processing
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-2xl font-bold text-purple-700">
                    {data.orders.shipped}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Shipped
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-2xl font-bold text-green-700">
                    {data.orders.delivered}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Delivered
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-4">
                  <p className="text-2xl font-bold text-red-700">
                    {data.orders.cancelled}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Cancelled
                  </p>
                </div>

              </div>
            </section>

            {/* Inventory */}

            <section className="mt-7 grid gap-5 md:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Low Stock Products
                </p>

                <p className="mt-3 text-3xl font-bold text-orange-600">
                  {data.products.lowStock}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm font-semibold text-slate-500">
                  Out of Stock
                </p>

                <p className="mt-3 text-3xl font-bold text-red-600">
                  {data.products.outOfStock}
                </p>
              </div>

            </section>

            {/* Recent Orders */}

            <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-200 p-6">

                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Recent Orders
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest customer orders
                  </p>
                </div>

                <Link
                  to="/admin/orders"
                  className="text-sm font-bold text-blue-700"
                >
                  View All
                </Link>
              </div>

              {data.recentOrders.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  No orders yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">

                    <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-6 py-4">
                          Order
                        </th>

                        <th className="px-6 py-4">
                          Customer
                        </th>

                        <th className="px-6 py-4">
                          Total
                        </th>

                        <th className="px-6 py-4">
                          Status
                        </th>

                        <th className="px-6 py-4">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {data.recentOrders.map(
                        (order) => (
                          <tr
                            key={order._id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-6 py-4">
                              <p className="font-bold text-blue-700">
                                {order.orderNumber}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <p className="font-semibold text-slate-800">
                                {order.customerName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {order.phone}
                              </p>
                            </td>

                            <td className="px-6 py-4 font-semibold text-slate-800">
                              ৳
                              {formatPrice(
                                order.total,
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass(
                                  order.status,
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(
                                order.createdAt,
                              ).toLocaleDateString(
                                "en-BD",
                              )}
                            </td>
                          </tr>
                        ),
                      )}

                    </tbody>
                  </table>
                </div>
              )}

            </section>
          </>
        )}
    </AdminLayout>
  );
}
