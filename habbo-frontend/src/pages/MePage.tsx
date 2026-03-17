import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet, apiPut, isLoggedIn } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Gamepad2 } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  mail: string;
  motto: string;
  look: string;
  credits: number;
  pixels: number;
  diamonds: number;
  rank: number;
  online: number;
  gender: string;
  account_created: number;
  last_login: number;
  last_online: number;
  home_room: number;
  badges: { badge_code: string; slot: number }[];
}

const rankLabels: Record<number, string> = {
  1: "Citizen", 2: "VIP Bronze", 3: "VIP Silver", 4: "VIP Gold",
  5: "VIP Platinum", 6: "DJ", 7: "Event Staff", 8: "Event Manager",
  9: "Representative", 10: "Senator", 11: "Governor", 12: "Vice President",
  13: "President", 14: "Elite", 15: "Elite+", 16: "Owner",
};

export function MePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mottoValue, setMottoValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [mottoSaved, setMottoSaved] = useState(false);

  const getTab = () => {
    if (location.pathname === "/me/page") return "mypage";
    if (location.pathname === "/me/settings") return "settings";
    return "home";
  };
  const activeTab = getTab();

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const data = await apiGet("/api/auth/me");
      setProfile(data);
      setMottoValue(data.motto);
    } catch { navigate("/login"); }
    finally { setLoading(false); }
  };

  const saveMotto = async () => {
    try {
      await apiPut("/api/auth/me/motto", { motto: mottoValue });
      if (profile) setProfile({ ...profile, motto: mottoValue });
      setMottoSaved(true);
      setTimeout(() => setMottoSaved(false), 2000);
    } catch { /* ignore */ }
  };

  const formatDate = (ts: number) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading profile...</div>;
  if (!profile) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-0 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
        <button onClick={() => navigate("/me")} className={`px-5 py-2.5 text-sm font-medium transition-all ${activeTab === "home" ? "bg-emerald-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>Home</button>
        <button onClick={() => navigate("/me/page")} className={`px-5 py-2.5 text-sm font-medium transition-all ${activeTab === "mypage" ? "bg-emerald-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>My Page</button>
        <button onClick={() => navigate("/me/settings")} className={`px-5 py-2.5 text-sm font-medium transition-all ${activeTab === "settings" ? "bg-emerald-700 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>Account Settings</button>
      </div>

      {activeTab === "home" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm">Welcome Back</div>
              <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 overflow-hidden">
                    <HabboAvatar look={profile.look} size="large" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{profile.username}</h2>
                    <p className="text-sm text-zinc-400 italic">&quot;{profile.motto}&quot;</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">{rankLabels[profile.rank] || "Member"}</span>
                  </div>
                  <button onClick={() => navigate("/client")} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-bold rounded-lg shadow-lg transition-all flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />Enter Hotel
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm">My Wallet</div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4 text-center border border-zinc-700"><div className="text-2xl font-bold text-yellow-400">{profile.credits.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-1">Credits</div></div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center border border-zinc-700"><div className="text-2xl font-bold text-purple-400">{profile.pixels.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-1">Pixels</div></div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center border border-zinc-700"><div className="text-2xl font-bold text-sky-400">{profile.diamonds.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-1">Diamonds</div></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm">My Badges</div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
                {profile.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((badge, i) => (
                      <div key={i} className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700" title={badge.badge_code}>
                        <img src={`https://images.habbo.com/c_images/album1584/${badge.badge_code}.gif`} alt={badge.badge_code} className="w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    ))}
                  </div>
                ) : (<p className="text-sm text-zinc-500">No badges yet.</p>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "mypage" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-2.5 text-white font-bold text-sm">My Avatar</div>
              <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0 text-center">
                <div className="w-28 h-28 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-zinc-700 overflow-hidden mx-auto mb-4"><HabboAvatar look={profile.look} size="large" /></div>
                <h2 className="text-lg font-bold text-white">{profile.username}</h2>
                <p className="text-sm text-zinc-400 italic mt-1">&quot;{profile.motto}&quot;</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">{rankLabels[profile.rank] || "Member"}</span>
                <div className="mt-4 space-y-2 text-left text-sm">
                  <div className="flex justify-between text-zinc-400"><span>Joined</span><span className="text-zinc-300">{formatDate(profile.account_created)}</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Last seen</span><span className="text-zinc-300">{formatDate(profile.last_online)}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm">Wallet</div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4 text-center border border-zinc-700"><div className="text-2xl font-bold text-yellow-400">{profile.credits.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-1">Credits</div></div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center border border-zinc-700"><div className="text-2xl font-bold text-purple-400">{profile.pixels.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-1">Pixels</div></div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center border border-zinc-700"><div className="text-2xl font-bold text-sky-400">{profile.diamonds.toLocaleString()}</div><div className="text-xs text-zinc-500 mt-1">Diamonds</div></div>
                </div>
              </div>
            </div>
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm">Badges</div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
                {profile.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((badge, i) => (
                      <div key={i} className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700" title={badge.badge_code}>
                        <img src={`https://images.habbo.com/c_images/album1584/${badge.badge_code}.gif`} alt={badge.badge_code} className="w-8 h-8" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    ))}
                  </div>
                ) : (<p className="text-sm text-zinc-500">No badges yet.</p>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 to-red-700 px-4 py-2.5 text-white font-bold text-sm">Account Information</div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">Username</span><span className="text-sm text-white font-semibold">{profile.username}</span></div>
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">Email</span><span className="text-sm text-zinc-300">{profile.mail}</span></div>
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">Gender</span><span className="text-sm text-zinc-300">{profile.gender === "M" ? "Male" : "Female"}</span></div>
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">User ID</span><span className="text-sm text-zinc-300">#{profile.id}</span></div>
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">Rank</span><span className="text-sm text-purple-300">{rankLabels[profile.rank] || "Member"}</span></div>
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">Home Room</span><span className="text-sm text-zinc-300">{profile.home_room || "Not set"}</span></div>
                <div className="flex justify-between py-2 border-b border-zinc-800"><span className="text-sm text-zinc-400">Created</span><span className="text-sm text-zinc-300">{formatDate(profile.account_created)}</span></div>
                <div className="flex justify-between py-2"><span className="text-sm text-zinc-400">Last Online</span><span className="text-sm text-zinc-300">{formatDate(profile.last_online)}</span></div>
              </div>
            </div>
          </div>
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm">Change Motto</div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0 space-y-3">
              <input value={mottoValue} onChange={(e) => setMottoValue(e.target.value)} maxLength={50} placeholder="Enter your new motto..." className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-zinc-600" />
              <button onClick={saveMotto} className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold rounded-md transition-all text-sm">{mottoSaved ? "Saved!" : "Save Motto"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
