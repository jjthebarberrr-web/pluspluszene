import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, setAuth, isLoggedIn, getUsername } from "../api";
import { Gamepad2 } from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const username = getUsername();
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("/api/auth/login", { username: loginUser, password: loginPass });
      setAuth(data.token, data.username, data.user_id);
      navigate("/me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (loggedIn) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
              Welcome Back
            </div>
            <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-teal-400 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">Welcome back, {username}!</h2>
                  <p className="text-zinc-400 mt-1">Ready to enter the hotel?</p>
                </div>
                <Link
                  to="/client"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all"
                >
                  Enter Hotel
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
              Quick Links
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-2">
              <Link to="/me" className="block px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 hover:text-white transition-all">
                My Profile
              </Link>
              <Link to="/community" className="block px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 hover:text-white transition-all">
                Community
              </Link>
              <Link to="/staff" className="block px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 hover:text-white transition-all">
                Staff Team
              </Link>
              <Link to="/store" className="block px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 hover:text-white transition-all">
                Store
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left Side - Login */}
      <div className="lg:col-span-2">
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
            Login to HabboRetro
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
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  placeholder="Username"
                  required
                  className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 focus:shadow-[0_0_10px_rgba(136,211,206,0.3)] transition-all placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="block mb-1.5 font-bold text-xs text-zinc-400 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
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
              <Link
                to="/register"
                className="block w-full mt-3"
              >
                <div className="w-full h-16 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 flex items-center justify-center text-white font-bold text-lg rounded-md transition-all shadow-md cursor-pointer">
                  Create an account
                </div>
              </Link>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="space-y-4">
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
            About HabboRetro
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-teal-400 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white">HabboRetro</h3>
                <p className="text-xs text-zinc-500">Virtual World</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Welcome to HabboRetro! Create your avatar, design your room, chat with friends, and explore our virtual world. Join thousands of players in the ultimate retro hotel experience.
            </p>
          </div>
        </div>

        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm shadow-md">
            Getting Started
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                Create a free account
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                Customize your avatar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                Enter the hotel & make friends
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                Build & decorate your room
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
