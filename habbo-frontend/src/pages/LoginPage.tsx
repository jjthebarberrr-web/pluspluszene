import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, setAuth } from "../api";

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("/api/auth/login", { username, password });
      setAuth(data.token, data.username, data.user_id);
      navigate("/me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
          Login to HabPlus
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
          <form onSubmit={handleLogin} className="space-y-3">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 focus:shadow-[0_0_10px_rgba(136,211,206,0.3)] transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 focus:shadow-[0_0_10px_rgba(136,211,206,0.3)] transition-all placeholder:text-zinc-600"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold rounded-md transition-all shadow-md cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-zinc-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
                Register for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
