import { Link, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminToken } from "../../lib/adminApi";
import { Navigate } from "react-router-dom";

const sections = {
  categories: "Categories",
  orders: "Orders",
  banners: "Banners",
  branding: "Branding",
};

export default function AdminSection() {
  const { section } = useParams();
  const title = sections[section];

  if (!getAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!title) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <AdminLayout
      title={title}
      subtitle={`Manage your VC Tech ${title.toLowerCase()}.`}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900">
        <h2 className="text-xl font-bold">{title} Management</h2>
        <p className="mt-3 text-slate-600">
          This management section is being connected to the Express API.
        </p>
        <Link
          to="/admin/dashboard"
          className="mt-6 inline-block rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white"
        >
          Back to Dashboard
        </Link>
      </div>
    </AdminLayout>
  );
}
