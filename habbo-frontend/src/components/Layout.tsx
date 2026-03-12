import { Link, useNavigate, useLocation } from "react-router-dom";
import { isLoggedIn, getUsername, clearAuth, apiGet } from "../api";
import { useState, useEffect, useCallback } from "react";
import { LogOut, ChevronDown, Gamepad2, Settings, HelpCircle, User, Menu, X, Bell } from "lucide-react";
import { HabboAvatar } from "./HabboAvatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = isLoggedIn();
  const username = getUsername();
  const [communityOpen, setCommunityOpen] = useState(false);
  const [staffOpen, setStaffOpen] = useState(false);
  const [meOpen, setMeOpen] = useState(false);
  const [userLook, setUserLook] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [userRank, setUserRank] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCommunityOpen, setMobileCommunityOpen] = useState(false);
  const [mobileStaffOpen, setMobileStaffOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: number; type: string; message: string; read: boolean; created_at: number; link?: string}>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  useEffect(() => {
    if (!loggedIn) return;
    const fetchNotifs = () => {
      apiGet("/api/notifications").then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }).catch(() => {});
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  const markAllRead = () => {
    apiGet("/api/notifications/read-all").then(() => {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }).catch(() => {});
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCommunityOpen(false);
    setMobileStaffOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");
  const isAnyCommunityActive = () =>
    isActive("/community") || isActive("/photos") || isActive("/vip-list") || isActive("/rare-values");
  const isAnyStaffActive = () =>
    isActive("/staff") || isActive("/old-staff") || isActive("/event-staff") || isActive("/dj-staff");

  const formatNotifTime = (ts: number) => {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

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
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
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

        {!loggedIn && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3 z-10">
            <Link to="/login" className="px-5 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-white text-sm rounded border border-zinc-600 transition-all font-medium">Login</Link>
            <span className="text-zinc-400 text-sm">or</span>
            <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-sm rounded font-semibold transition-all shadow-lg">Register for free!</Link>
          </div>
        )}
        {!loggedIn && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex md:hidden items-center gap-2 z-10">
            <Link to="/login" className="px-3 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-white text-xs rounded border border-zinc-600 transition-all font-medium">Login</Link>
            <Link to="/register" className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white text-xs rounded font-semibold transition-all">Register</Link>
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
            <ul className="hidden lg:flex items-center gap-0" style={{fontFamily: "'Ubuntu', 'Roboto', sans-serif", fontWeight: 500, fontSize: '13px'}}>
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
                <Link
                  to="/community"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isAnyCommunityActive()
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Community<img src="https://fresh-hotel.org/image/nav/icon_203.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                </Link>
                {communityOpen && (
                  <ul className="absolute top-full left-0 bg-zinc-900 border border-zinc-700 rounded-b shadow-xl min-w-52 z-50">
                    <li>
                      <Link to="/photos" onClick={() => setCommunityOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Photos
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

              {/* Staff Dropdown */}
              <li
                className="relative"
                onMouseEnter={() => setStaffOpen(true)}
                onMouseLeave={() => setStaffOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isAnyStaffActive()
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Staff <img src="https://images.habbo.com/c_images/catalogue/icon_19.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
                </button>
                {staffOpen && (
                  <ul className="absolute top-full left-0 bg-zinc-900 border border-zinc-700 rounded-b shadow-xl min-w-52 z-50">
                    <li>
                      <Link to="/staff" onClick={() => setStaffOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Current Staff
                      </Link>
                    </li>
                    <li>
                      <Link to="/old-staff" onClick={() => setStaffOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Former Government Officials
                      </Link>
                    </li>
                    <li>
                      <Link to="/event-staff" onClick={() => setStaffOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        Event Staff
                      </Link>
                    </li>
                    <li>
                      <Link to="/dj-staff" onClick={() => setStaffOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        DJ Staff
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

              {/* Battle Pass */}
              <li>
                <Link
                  to="/battlepass"
                  className={`flex items-center gap-1.5 px-4 py-2.5 transition-all border border-transparent hover:border-white/30 ${
                    isActive("/battlepass")
                      ? "bg-black/40 text-white border-white/30"
                      : "text-red-100 hover:bg-black/20 hover:text-white"
                  }`}
                >
                  Battle Pass <img src="https://images.habbo.com/c_images/catalogue/icon_213.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
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
                  Store <img src="https://images.habbo.com/c_images/catalogue/icon_68.png" alt="" className="w-4 h-4" style={{imageRendering: 'pixelated'}} />
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

              {/* Notification Bell */}
              <li className="relative ml-auto" onMouseEnter={() => setNotifOpen(true)} onMouseLeave={() => setNotifOpen(false)}>
                <button className="flex items-center px-3 py-2.5 text-red-100 hover:text-white transition-all relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute top-full right-0 bg-zinc-900 border border-zinc-700 rounded-b shadow-xl w-80 z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
                      <span className="text-sm font-bold text-white">Notifications</span>
                      {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-teal-400 hover:text-teal-300">Mark all read</button>}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-zinc-500 text-sm">No notifications yet</div>
                    ) : notifications.slice(0, 20).map((n) => (
                      <div key={n.id} onClick={() => { if (n.link) navigate(n.link); setNotifOpen(false); }} className={`px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/50 transition-all cursor-pointer ${!n.read ? "bg-zinc-800/30" : ""}`}>
                        <div className="text-sm text-zinc-300">{n.message}</div>
                        <div className="text-xs text-zinc-600 mt-1">{formatNotifTime(n.created_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </li>

              {/* Me Dropdown */}
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
                      <Link to={`/user/${username}`} onClick={() => setMeOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        <span className="flex items-center gap-2"><User className="w-3.5 h-3.5" /> My Profile</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/settings" onClick={() => setMeOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        <span className="flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Settings</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/help" onClick={() => setMeOpen(false)} className="block px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all">
                        <span className="flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> Help & FAQ</span>
                      </Link>
                    </li>
                    <li className="border-t border-zinc-800">
                      <button onClick={() => { setMeOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-all">
                        <span className="flex items-center gap-2"><LogOut className="w-3.5 h-3.5" /> Logout</span>
                      </button>
                    </li>
                  </ul>
                )}
              </li>

            </ul>

            {/* Mobile Nav */}
            <div className="flex lg:hidden items-center justify-between py-2">
              <button onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setNotifOpen(false); }} className="flex items-center gap-2 text-red-100 hover:text-white transition-all">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                <span className="text-sm font-bold">Menu</span>
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => { setNotifOpen(!notifOpen); setMobileMenuOpen(false); }} className="relative text-red-100 hover:text-white">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {userLook && (
                  <Link to={`/user/${username}`} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-600 flex items-center justify-center"><HabboAvatar look={userLook} size="small" headOnly={true} /></div>
                    <span className="text-sm font-bold text-red-100">{username}</span>
                  </Link>
                )}
              </div>
            </div>
            {/* Mobile Notifications */}
            {notifOpen && (
              <div className="lg:hidden bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl mb-2 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-teal-400 hover:text-teal-300">Mark all read</button>}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-4 text-center text-zinc-500 text-sm">No notifications yet</div>
                ) : notifications.slice(0, 10).map((n) => (
                  <div key={n.id} onClick={() => { if (n.link) navigate(n.link); setNotifOpen(false); }} className={`px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800/50 ${!n.read ? "bg-zinc-800/30" : ""}`}>
                    <div className="text-sm text-zinc-300">{n.message}</div>
                    <div className="text-xs text-zinc-600 mt-1">{formatNotifTime(n.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden border-t border-white/10 py-2 space-y-0.5" style={{fontFamily: "'Ubuntu', 'Roboto', sans-serif", fontSize: '14px'}}>
                <Link to="/" className={`block px-4 py-2.5 rounded ${location.pathname === "/" ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>Home</Link>
                <Link to="/news" className={`block px-4 py-2.5 rounded ${isActive("/news") ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>News</Link>
                <div>
                  <button onClick={() => setMobileCommunityOpen(!mobileCommunityOpen)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded ${isAnyCommunityActive() ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>
                    <span>Community</span><ChevronDown className={`w-4 h-4 transition-transform ${mobileCommunityOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileCommunityOpen && (
                    <div className="pl-6 space-y-0.5 mt-0.5">
                      <Link to="/photos" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">Photos</Link>
                      <Link to="/vip-list" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">VIP List</Link>
                      <Link to="/rare-values" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">Rare Values</Link>
                    </div>
                  )}
                </div>
                <div>
                  <button onClick={() => setMobileStaffOpen(!mobileStaffOpen)} className={`w-full flex items-center justify-between px-4 py-2.5 rounded ${isAnyStaffActive() ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>
                    <span>Staff</span><ChevronDown className={`w-4 h-4 transition-transform ${mobileStaffOpen ? "rotate-180" : ""}`} />
                  </button>
                  {mobileStaffOpen && (
                    <div className="pl-6 space-y-0.5 mt-0.5">
                      <Link to="/staff" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">Current Staff</Link>
                      <Link to="/old-staff" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">Former Officials</Link>
                      <Link to="/event-staff" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">Event Staff</Link>
                      <Link to="/dj-staff" className="block px-4 py-2 text-sm text-zinc-300 hover:text-white rounded hover:bg-black/20">DJ Staff</Link>
                    </div>
                  )}
                </div>
                <Link to="/leaderboards" className={`block px-4 py-2.5 rounded ${isActive("/leaderboards") ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>Leaderboards</Link>
                <Link to="/battlepass" className={`block px-4 py-2.5 rounded ${isActive("/battlepass") ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>Battle Pass</Link>
                <Link to="/economy" className={`block px-4 py-2.5 rounded ${isActive("/economy") ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>Economy</Link>
                <Link to="/store" className={`block px-4 py-2.5 rounded ${isActive("/store") ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>Store</Link>
                {userRank >= 6 && <Link to="/housekeeping" className={`block px-4 py-2.5 rounded ${isActive("/housekeeping") ? "bg-black/40 text-white" : "text-red-100 hover:bg-black/20"}`}>Housekeeping</Link>}
                <div className="border-t border-white/10 pt-2 mt-2 space-y-0.5">
                  <Link to={`/user/${username}`} className="block px-4 py-2.5 text-zinc-300 hover:text-white rounded hover:bg-black/20"><span className="flex items-center gap-2"><User className="w-4 h-4" /> My Profile</span></Link>
                  <Link to="/settings" className="block px-4 py-2.5 text-zinc-300 hover:text-white rounded hover:bg-black/20"><span className="flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</span></Link>
                  <Link to="/help" className="block px-4 py-2.5 text-zinc-300 hover:text-white rounded hover:bg-black/20"><span className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Help & FAQ</span></Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 rounded hover:bg-black/20"><span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</span></button>
                </div>
              </div>
            )}
          </div>
        </nav>
      )}


      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-500" />
                <span className="font-bold text-zinc-300">HabPlus</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">Your retro hotel experience. Build rooms, make friends, and explore the community.</p>
            </div>
            {/* Quick Links */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Links</span>
              <Link to="/news" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">News</Link>
              <Link to="/community" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Community</Link>
              <Link to="/leaderboards" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Leaderboards</Link>
              <Link to="/store" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Store</Link>
            </div>
            {/* Info */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Information</span>
              <Link to="/help" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Help & FAQ</Link>
              <Link to="/staff" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Staff Team</Link>
              <Link to="/economy" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Economy Guide</Link>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} HabPlus. All rights reserved.</p>
            <p className="text-xs text-zinc-700">Powered by Nitro HTML5 &amp; Arcturus Morningstar | Not affiliated with Sulake</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
