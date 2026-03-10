import { Link, useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, getUsername, clearAuth } from "../api";
import { Home, User, Users, LogIn, UserPlus, LogOut, Gamepad2, Newspaper } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isLoggedIn();
  const username = getUsername();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 shadow-lg shadow-sky-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30 group-hover:bg-white/30 transition-all">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">HABBO</span>
                <span className="text-xl font-light text-sky-100">RETRO</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/" active={isActive("/")} icon={<Home className="w-4 h-4" />} label="Home" />
              <NavLink to="/community" active={isActive("/community")} icon={<Users className="w-4 h-4" />} label="Community" />
              <NavLink to="/news" active={isActive("/news")} icon={<Newspaper className="w-4 h-4" />} label="News" />
              {loggedIn && (
                <>
                  <NavLink to="/me" active={isActive("/me")} icon={<User className="w-4 h-4" />} label="Me" />
                  <NavLink to="/client" active={isActive("/client")} icon={<Gamepad2 className="w-4 h-4" />} label="Enter Hotel" />
                </>
              )}
            </nav>

            {/* Auth */}
            <div className="flex items-center gap-2">
              {loggedIn ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-sky-100 hidden sm:block">
                    Welcome, <strong className="text-white">{username}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg border border-white/20 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg border border-white/20 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-sky-50 text-sky-600 text-sm rounded-lg font-semibold transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          <NavLink to="/" active={isActive("/")} icon={<Home className="w-4 h-4" />} label="Home" />
          <NavLink to="/community" active={isActive("/community")} icon={<Users className="w-4 h-4" />} label="Community" />
          <NavLink to="/news" active={isActive("/news")} icon={<Newspaper className="w-4 h-4" />} label="News" />
          {loggedIn && (
            <>
              <NavLink to="/me" active={isActive("/me")} icon={<User className="w-4 h-4" />} label="Me" />
              <NavLink to="/client" active={isActive("/client")} icon={<Gamepad2 className="w-4 h-4" />} label="Enter Hotel" />
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-sky-500" />
              <span className="font-bold text-zinc-400">HabboRetro</span>
            </div>
            <p className="text-sm text-zinc-500">
              Powered by Nitro HTML5 Client &amp; Arcturus Morningstar Emulator
            </p>
            <p className="text-xs text-zinc-600">
              Not affiliated with Sulake Corporation Oy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${
        active
          ? "bg-white/20 text-white font-semibold"
          : "text-sky-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
