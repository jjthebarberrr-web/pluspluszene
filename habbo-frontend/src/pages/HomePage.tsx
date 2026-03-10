import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost, apiGet, setAuth, isLoggedIn } from "../api";
import { Gamepad2, Users, DoorOpen } from "lucide-react";
import { HabboAvatar } from "../components/HabboAvatar";

interface Room {
  id: number;
  name: string;
  owner: string;
  users: number;
  max_users: number;
}

interface OnlineUser {
  id: number;
  username: string;
  look: string;
  motto: string;
}

interface NewsItem {
  id: number;
  title: string;
  category: string;
  created_at: number;
}

interface UserOfWeek {
  id: number;
  username: string;
  look: string;
  motto: string;
}

interface HomeData {
  popular_rooms: Room[];
  online_users: OnlineUser[];
  online_count: number;
  user_of_week: UserOfWeek | null;
  latest_news: NewsItem[];
}

interface UserProfile {
  credits: number;
  pixels: number;
  diamonds: number;
  look: string;
}

export function HomePage() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userLook, setUserLook] = useState("");

  useEffect(() => {
    if (loggedIn) {
      apiGet("/api/home").then(setHomeData).catch(() => {});
      apiGet("/api/auth/me").then((data) => {
        setProfile(data);
        if (data.look) setUserLook(data.look);
      }).catch(() => {});
    }
  }, [loggedIn]);

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

  const formatDate = (ts: number) => {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    const day = d.getDate().toString().padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day}-${months[d.getMonth()]} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "announcement": return "bg-red-600";
      case "event": return "bg-purple-600";
      case "update": return "bg-blue-600";
      default: return "bg-zinc-600";
    }
  };

  if (loggedIn) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Room Preview / Welcome Banner */}
          <div className="rounded overflow-hidden">
            <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700">
              <div className="h-52 relative overflow-hidden" style={{background: '#1a1a1a'}}>
                <img
                  src="https://images.habbo.com/web_images/habbo-web-articles/lpromo_townhall_sep25.png"
                  alt="Hotel Scene"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{imageRendering: 'pixelated'}}
                />
                {/* User avatar overlay */}
                {profile && userLook && (
                  <div className="absolute bottom-0 left-6 z-10">
                    <HabboAvatar look={userLook} size="large" direction={2} />
                  </div>
                )}
                {/* Hotel name overlay */}
                <div className="absolute top-3 right-4 z-10 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded">
                  <span className="text-white font-black text-sm tracking-wide">HABBORETRO</span>
                </div>
              </div>
              {/* Currency Bar */}
              {profile && (
                <div className="flex items-center gap-4 px-4 py-2.5 bg-black/60 border-t border-zinc-700 text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="text-yellow-400 font-bold">{profile.credits.toLocaleString()}</span>
                    <span className="text-zinc-500">Credits</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-purple-400 font-bold">{profile.pixels.toLocaleString()}</span>
                    <span className="text-zinc-500">Duckets</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-sky-400 font-bold">{profile.diamonds.toLocaleString()}</span>
                    <span className="text-zinc-500">Diamonds</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Popular Rooms */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-2 text-white font-bold text-sm text-center tracking-wide">
              Popular Rooms
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0 divide-y divide-zinc-800">
              {homeData?.popular_rooms && homeData.popular_rooms.length > 0 ? (
                homeData.popular_rooms.map((room) => (
                  <div key={room.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/50 transition-all">
                    <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
                      <DoorOpen className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{room.name}</p>
                      <p className="text-xs text-zinc-500">by {room.owner}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-green-400 font-bold">{room.users}</span>
                    </div>
                    <Link
                      to="/client"
                      className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-xs text-zinc-300 hover:text-white rounded transition-all font-medium"
                    >
                      Go to room
                    </Link>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-zinc-500">No rooms available yet</div>
              )}
            </div>
          </div>

          {/* Online Users */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-2 text-white font-bold text-sm text-center tracking-wide">
              Online Users
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0 p-2.5">
              {homeData?.online_users && homeData.online_users.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {homeData.online_users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center h-12 px-2 rounded"
                      style={{
                        background: '#A4A4A4',
                        border: '2px solid #E0E0E0',
                        boxShadow: '0 0 0 1px #4D4D4D, 0 1px 0 1px #4D4D4D',
                      }}
                    >
                      <div className="w-10 h-12 relative overflow-hidden flex-shrink-0" style={{imageRendering: 'pixelated'}}>
                        <HabboAvatar look={user.look} size="small" />
                      </div>
                      <span className="text-xs font-semibold text-white ml-1 truncate" style={{textShadow: '1px 1px 1px #000'}}>{user.username}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">No users online right now</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Latest News */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-white font-bold text-sm text-center tracking-wide">
              Latest News
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0 divide-y divide-zinc-800">
              {homeData?.latest_news && homeData.latest_news.length > 0 ? (
                homeData.latest_news.map((article) => (
                  <Link key={article.id} to="/news" className="flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-800/50 transition-all group">
                    <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center ${getCategoryColor(article.category)}`}>
                      <span className="text-white text-xs font-bold">{article.category.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 group-hover:text-white transition-all font-medium truncate">{article.title}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{formatDate(article.created_at)}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-zinc-500">No news yet</div>
              )}
            </div>
          </div>

          {/* Fresh of the Week */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-white font-bold text-sm text-center tracking-wide">
              Player of the Week
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0 p-4">
              {homeData?.user_of_week ? (
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center">
                    <HabboAvatar look={homeData.user_of_week.look} size="medium" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{homeData.user_of_week.username}</p>
                    {homeData.user_of_week.motto && (
                      <p className="text-xs text-zinc-400 italic mt-0.5">"{homeData.user_of_week.motto}"</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center">Coming soon</p>
              )}
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
