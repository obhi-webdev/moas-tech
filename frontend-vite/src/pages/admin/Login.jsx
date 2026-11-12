import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { adminRequest, saveAdminToken } from "../../lib/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      if (!data.accessToken) {
        throw new Error("Access token missing");
      }

      saveAdminToken(data.accessToken);
      await adminRequest("/products/admin/all");
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      sessionStorage.removeItem("vc-tech-admin-token");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ cursor: "auto" }} className="min-h-screen bg-[#f3f6fa] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#071724] shadow-lg">
            <span className="text-2xl font-black text-white">
              VC<span className="text-orange-500">.</span>
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#071724]">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your VC Tech Admin Dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9"
        >
          <div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#071724]">
                Admin Login
              </h2>
              <p className="text-xs text-slate-500">
                Secure administration access
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="admin-identifier"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email or Phone
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="admin-identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email or phone"
                  required
                  style={{ cursor: "text", caretColor: "#071724" }} className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ cursor: "text", caretColor: "#071724" }} className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ cursor: "pointer" }} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] text-sm font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#ea580c] focus:outline-none focus:ring-4 focus:ring-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <p className="mt-6 text-center text-xs text-slate-400">
            Authorized personnel only
          </p>
        </form>

        <p className="mt-7 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} VC Tech. All rights reserved.
        </p>
      </div>
    </main>
  );
}
