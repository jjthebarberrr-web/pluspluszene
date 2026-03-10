import { Link, useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, getUsername, clearAuth, apiGet } from "../api";
import { useState, useEffect } from "react";
import { LogOut, ChevronDown, Gamepad2 } from "lucide-react";
import { HabboAvatar } from "./HabboAvatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isLoggedIn();
  const username = getUsername();
  const [communityOpen, setCommunityOpen] = useState(false);
  const [meOpen, setMeOpen] = useState(false);
  const [userLook, setUserLook] = useState("");

  useEffect(() => {
    if (loggedIn) {
      apiGet("/api/auth/me").then((data) => {
        if (data.look) setUserLook(data.look);
      }).catch(() => {});
    }
  }, [loggedIn]);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");
  const isAnyCommunityActive = () =>
    isActive("/community") || isActive("/photos") || isActive("/staff") ||
    isActive("/old-staff") || isActive("/vip-list") || isActive("/rare-values");

  // Don't show layout chrome on client page
  if (location.pathname === "/client") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Roboto', sans-serif" }}>
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-teal-400 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">HABBO</span>
                <span className="text-xl font-light text-purple-300">RETRO</span>
              </div>
            </Link>

            {/* Header Right - Auth Buttons or User Info */}
            <div className="flex items-center gap-3">
              {loggedIn ? (
                <>
                  <span className="text-sm text-zinc-400 hidden sm:block">
                    Welcome, <strong className="text-white">{username}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded border border-zinc-700 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400 hidden md:block">Join our community and make new friends</span>
                  <Link
                    to="/login"
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded border border-zinc-600 transition-all font-medium"
                  >
                    Login
                  </Link>
                  <span className="text-zinc-600 text-sm">or</span>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-sm rounded font-semibold transition-all shadow-lg shadow-purple-500/20"
                  >
                    Register for free!
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Only show when logged in */}
      {loggedIn && (
        <nav className="border-b border-red-800/50 shadow-lg relative z-50" style={{background: 'linear-gradient(180deg, #4a0a0a 0%, #2a0505 100%)'}}>
          <div className="max-w-6xl mx-auto px-4">
            <ul className="flex items-center gap-0" style={{fontFamily: "'Ubuntu', 'Roboto', sans-serif", fontWeight: 500, fontSize: '13px'}}>
              {/* Home */}
              <li>
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    location.pathname === "/"
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Home <img src="https://fresh-hotel.org/image/nav/nest_small.gif" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                </Link>
              </li>

              {/* News */}
              <li>
                <Link
                  to="/news"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isActive("/news")
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  News <img src="https://fresh-hotel.org/image/nav/my_2.gif" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                </Link>
              </li>

              {/* Community Dropdown */}
              <li
                className="relative"
                onMouseEnter={() => setCommunityOpen(true)}
                onMouseLeave={() => setCommunityOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isAnyCommunityActive()
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Community<img src="https://fresh-hotel.org/image/nav/icon_203.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                </button>
                {communityOpen && (
                  <ul className="absolute top-full left-0 bg-zinc-900 border border-zinc-700 rounded-b shadow-xl min-w-52 z-50">
                    <li>
                      <Link to="/photos" onClick={() => setCommunityOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Photos
                      </Link>
                    </li>
                    <li>
                      <Link to="/staff" onClick={() => setCommunityOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Hotel Staff
                      </Link>
                    </li>
                    <li>
                      <Link to="/old-staff" onClick={() => setCommunityOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Old Staff
                      </Link>
                    </li>
                    <li>
                      <Link to="/vip-list" onClick={() => setCommunityOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        VIP List
                      </Link>
                    </li>
                    <li>
                      <Link to="/rare-values" onClick={() => setCommunityOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Rare Values
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Leaderboards */}
              <li>
                <Link
                  to="/leaderboards"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isActive("/leaderboards")
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Leaderboards <img src="https://fresh-hotel.org/image/nav/bb.gif" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                </Link>
              </li>

              {/* Store */}
              <li>
                <Link
                  to="/store"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isActive("/store")
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Store 🛍️
                </Link>
              </li>

              {/* Me Dropdown - avatar + username like Fresh Hotel */}
              <li
                className="relative"
                onMouseEnter={() => setMeOpen(true)}
                onMouseLeave={() => setMeOpen(false)}
              >
                <button
                  className={`flex items-center gap-2 px-4 py-1 transition-all border border-transparent hover:border-white/30 ${
                    isActive("/me")
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  {userLook && (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                      <HabboAvatar look={userLook} size="small" />
                    </div>
                  )}
                  <span className="font-bold">{username}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {meOpen && (
                  <ul className="absolute top-full left-0 bg-zinc-900 border border-zinc-700 rounded-b shadow-xl min-w-48 z-50">
                    <li>
                      <Link to="/me" onClick={() => setMeOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to="/me/page" onClick={() => setMeOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        My Page
                      </Link>
                    </li>
                    <li>
                      <Link to="/me/settings" onClick={() => setMeOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Account Settings
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Enter Hotel - right aligned */}
              <li className="ml-auto">
                <Link
                  to="/client"
                  className="flex items-center gap-1.5 px-4 py-2.5 font-bold text-yellow-300 hover:bg-black/20 hover:text-yellow-200 transition-all border border-transparent hover:border-white/30"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Enter Hotel
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-500" />
              <span className="font-bold text-zinc-500">HabboRetro</span>
            </div>
            <p className="text-xs text-zinc-600">
              Powered by Nitro HTML5 &amp; Arcturus Morningstar | Not affiliated with Sulake
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
