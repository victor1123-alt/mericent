import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Simple Admin Login page (restored)
 * - Example endpoint: POST /api/admin/login
 * - Expects: { username, password } -> returns { token, user }
 */
const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4444/api/admin/login", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        // store admin token separately and also set the regular auth token so admin is logged in as a normal user as well
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user || {}));
        // store the regular user token to mimic a normal login
        localStorage.setItem("token", data.token);
        // reload so UserContext picks up the token and fetches current user
        navigate("/admin");
        window.location.reload();
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Network error. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-milk dark:bg-darkblack">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
            required
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-3 text-xs text-gray-500">Only authorized admins can access this area. Example endpoint: <code>/api/admin/login</code></p>
      </div>
    </div>
  );
};

export default AdminLogin;
