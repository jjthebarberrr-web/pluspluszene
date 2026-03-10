import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, setAuth } from "../api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("M");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost("/api/auth/register", { username, password, email, gender });
      setAuth(data.token, data.username, data.user_id);
      navigate("/me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
          Create an Account
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
          <form onSubmit={handleRegister} className="space-y-3">
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
                placeholder="Choose a username"
                required
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-purple-500 focus:shadow-[0_0_10px_rgba(110,69,226,0.3)] transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-purple-500 focus:shadow-[0_0_10px_rgba(110,69,226,0.3)] transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-purple-500 focus:shadow-[0_0_10px_rgba(110,69,226,0.3)] transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-purple-500 focus:shadow-[0_0_10px_rgba(110,69,226,0.3)] transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Gender</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender("M")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    gender === "M"
                      ? "bg-sky-900/40 border-sky-500/50 text-sky-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("F")}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    gender === "F"
                      ? "bg-pink-900/40 border-pink-500/50 text-pink-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-bold rounded-md transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Register for Free"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-zinc-500">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
