import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminRequest, saveAdminToken } from "../../lib/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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

      navigate("/admin", { replace: true });
    } catch (err) {
      sessionStorage.removeItem("vc-tech-admin-token");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <form onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border">
        <h1 className="text-3xl font-bold text-blue-800">VC Tech</h1>
        <p className="mt-2 text-slate-500">Admin Dashboard Login</p>

        <input
          className="mt-8 w-full border rounded-lg p-3"
          placeholder="Email or phone"
          value={identifier}
          onChange={e => setIdentifier(e.target.value)}
          required
        />

        <input
          type="password"
          className="mt-4 w-full border rounded-lg p-3"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <button disabled={loading}
          className="mt-6 w-full bg-blue-700 text-white p-3 rounded-lg font-bold disabled:opacity-50">
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
