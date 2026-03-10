import { Link, useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, getUsername, clearAuth, apiGet } from "../api";
import { useState, useEffect, useCallback } from "react";
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
  const [onlineCount, setOnlineCount] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [userRank, setUserRank] = useState(0);

  const facts = [
    "Did you know: This website and theme was coded by JJ",
    "Did you know: You can elect the next staff member through community elections",
    "Did you know: HabPlus is powered by Nitro HTML5 & Arcturus Morningstar",
    "Did you know: Check the Leaderboards to see the richest players",
    "Did you know: Visit the Store to get exclusive perks and items",
    "Did you know: The community elects the President and government officials",
    "Did you know: You can customize your avatar and room in the hotel",
    "Did you know: Join the community and make new friends today",
  ];

  const rotateFact = useCallback(() => {
    setFactIndex((prev) => (prev + 1) % facts.length);
  }, [facts.length]);

  useEffect(() => {
    const interval = setInterval(rotateFact, 5000);
    return () => clearInterval(interval);
  }, [rotateFact]);

  useEffect(() => {
    if (loggedIn) {
      apiGet("/api/auth/me").then((data) => {
        if (data.look) setUserLook(data.look);
        if (data.rank) setUserRank(data.rank);
      }).catch(() => {});
    }
    // Fetch online count initially and every 1 second
    const fetchOnline = () => {
      apiGet("/api/home").then((data) => {
        if (data.online_count !== undefined) setOnlineCount(data.online_count);
      }).catch(() => {});
    };
    fetchOnline();
    const onlineInterval = setInterval(fetchOnline, 1000);
    return () => clearInterval(onlineInterval);
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
      {/* Clouds + Rain CSS */}
      <style>{`
        @keyframes moveClouds {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes moveClouds2 {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(100vw); }
        }
        @keyframes rainDrop {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 0.6; }
          100% { transform: translateY(160px); opacity: 0; }
        }
        .cloud {
          position: absolute;
          opacity: 0.35;
          image-rendering: pixelated;
          pointer-events: none;
        }
        .cloud-1 { top: 8px; animation: moveClouds 25s linear infinite; }
        .cloud-2 { top: 35px; animation: moveClouds2 35s linear infinite; animation-delay: -10s; }
        .cloud-3 { top: 15px; animation: moveClouds 45s linear infinite; animation-delay: -20s; }
        .cloud-4 { top: 50px; animation: moveClouds2 30s linear infinite; animation-delay: -5s; }
        .rain-container { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .rain-drop {
          position: absolute;
          width: 1px;
          height: 12px;
          background: linear-gradient(180deg, transparent 0%, rgba(174,194,224,0.5) 50%, rgba(174,194,224,0.15) 100%);
          animation: rainDrop 0.8s linear infinite;
        }
      `}</style>

      {/* Top Banner Image - Full width like Fresh Hotel */}
      <div className="w-full relative overflow-hidden" style={{background: '#0a0a0a', height: '140px'}}>
        <img
          src="https://images.habbo.com/web_images/defaults/lpromo_gen15_51.png"
          alt="HabPlus Banner"
          className="absolute inset-0 w-full h-full object-cover"
          style={{imageRendering: 'pixelated'}}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0" style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)'}} />

        {/* Moving Habbo Clouds */}
        <img src="https://images.habbo.com/c_images/Clouds/cloud_1.png" alt="" className="cloud cloud-1" style={{height: '50px'}} />
        <img src="https://images.habbo.com/c_images/Clouds/cloud_2.png" alt="" className="cloud cloud-2" style={{height: '40px'}} />
        <img src="https://images.habbo.com/c_images/Clouds/cloud_1.png" alt="" className="cloud cloud-3" style={{height: '55px'}} />
        <img src="https://images.habbo.com/c_images/Clouds/cloud_2.png" alt="" className="cloud cloud-4" style={{height: '35px'}} />

        {/* Rain Effect */}
        <div className="rain-container">
          {Array.from({length: 40}).map((_, i) => (
            <div key={i} className="rain-drop" style={{left: `${(i / 40) * 100}%`, animationDelay: `${Math.random() * 0.8}s`, animationDuration: `${0.6 + Math.random() * 0.4}s`}} />
          ))}
        </div>

        {/* Centered HabPlus + Online Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-teal-400 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-3xl font-black text-white tracking-tight" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>HAB</span>
              <span className="text-3xl font-light text-purple-300" style={{textShadow: '0 2px 8px rgba(0,0,0,0.7)'}}>PLUS</span>
            </div>
          </Link>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-200 font-bold" style={{textShadow: '0 1px 4px rgba(0,0,0,0.8)'}}>{onlineCount} Users Online</span>
          </div>
        </div>

        {/* Login/Register on right (only when not logged in) */}
        {!loggedIn && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
            <Link to="/login" className="px-5 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-white text-sm rounded border border-zinc-600 transition-all font-medium">Login</Link>
            <span className="text-zinc-400 text-sm">or</span>
            <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-sm rounded font-semibold transition-all shadow-lg">Register for free!</Link>
          </div>
        )}
      </div>

      {/* Scrolling Facts Marquee - Directly above nav */}
      {loggedIn && (
        <div className="w-full overflow-hidden" style={{background: 'linear-gradient(90deg, #2a0505 0%, #4a0a0a 50%, #2a0505 100%)', borderTop: '1px solid #5a1515', borderBottom: '1px solid #5a1515'}}>
          <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-center">
            <span className="text-yellow-300 font-semibold tracking-wide text-center" style={{fontFamily: "'Ubuntu', sans-serif", fontSize: '11px'}}>
              ★ {facts[factIndex]} ★
            </span>
          </div>
        </div>
      )}

      {/* Navigation Bar - Only show when logged in */}
      {loggedIn && (
        <nav className="shadow-lg relative z-50" style={{background: 'linear-gradient(180deg, #4a0a0a 0%, #2a0505 100%)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '2px'}}>
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

              {/* Economy Guide */}
              <li>
                <Link
                  to="/economy"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isActive("/economy")
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Economy <img src="https://images.habbo.com/c_images/catalogue/icon_68.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
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

              {/* Housekeeping - Staff only (rank 6+) */}
              {userRank >= 6 && (
                <li>
                  <Link
                    to="/housekeeping"
                    className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                      isActive("/housekeeping")
                        ? "bg-black/40 text-white border-white/30"
                        : "text-red-100 hover:bg-black/20 hover:text-white"
                    }`}
                  >
                    Housekeeping <img src="https://images.habbo.com/c_images/catalogue/icon_19.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                  </Link>
                </li>
              )}

              {/* Me Dropdown - avatar + username like Fresh Hotel */}
              <li
                className="relative"
                onMouseEnter={() => setMeOpen(true)}
                onMouseLeave={() => setMeOpen(false)}
              >
                <button
                  className={`flex items-center gap-2 px-4 py-1 transition-all border border-transparent hover:border-white/30 text-red-100 hover:bg-black/20 hover:text-white`}
                >
                  {userLook && (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-600 flex items-center justify-center">
                      <HabboAvatar look={userLook} size="small" headOnly={true} />
                    </div>
                  )}
                  <span className="font-bold">{username}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                {meOpen && (
                  <ul className="absolute top-full left-0 bg-zinc-900 border border-zinc-700 rounded-b shadow-xl min-w-48 z-50">
                    <li>
                      <button onClick={() => { setMeOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-all">
                        <span className="flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> Logout</span>
                      </button>
                    </li>
                  </ul>
                )}
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
              <span className="font-bold text-zinc-500">HabPlus</span>
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
