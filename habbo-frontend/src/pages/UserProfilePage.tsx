import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Users, Home, Award, Clock, Calendar, User, Shield } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  motto: string;
  look: string;
  credits: number;
  online: string;
  gender: string;
  rank: number;
  account_created: number;
  last_online: number;
  badges: { badge_code: string; slot: number }[];
  rooms: { id: number; name: string; description: string; users: number; users_max: number; score: number }[];
  friends_count: number;
  groups: { id: number; name: string; badge: string }[];
}

const rankLabels: Record<number, string> = {
  1: "Member",
  2: "Bronze VIP",
  3: "Silver VIP",
  4: "Gold VIP",
  5: "Platinum VIP",
  6: "Trial Mod",
  7: "Moderator",
  8: "Senior Mod",
  9: "Head Mod",
  10: "Trial Admin",
  11: "Administrator",
  12: "Head Admin",
  13: "Manager",
  14: "Developer",
  15: "President",
  16: "Owner",
};

const rankColors: Record<number, string> = {
  1: "bg-zinc-700 text-zinc-300",
  2: "bg-amber-900/50 text-amber-300 border-amber-700/50",
  3: "bg-slate-600/50 text-slate-200 border-slate-500/50",
  4: "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
  5: "bg-cyan-900/50 text-cyan-200 border-cyan-600/50",
  6: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  7: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  8: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  9: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  10: "bg-red-900/50 text-red-300 border-red-700/50",
  11: "bg-red-900/50 text-red-300 border-red-700/50",
  12: "bg-red-900/50 text-red-300 border-red-700/50",
  13: "bg-purple-900/50 text-purple-300 border-purple-700/50",
  14: "bg-sky-900/50 text-sky-300 border-sky-700/50",
  15: "bg-yellow-900/50 text-yellow-200 border-yellow-600/50",
  16: "bg-purple-900/50 text-purple-200 border-purple-600/50",
};

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError("");
    apiGet(`/api/users/${encodeURIComponent(username)}`)
      .then((data) => setProfile(data))
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false));
  }, [username]);

  const formatDate = (ts: number) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const timeAgo = (ts: number) => {
    if (!ts) return "Never";
    const now = Math.floor(Date.now() / 1000);
    const diff = now - ts;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(ts);
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading profile...</div>;
  if (error || !profile) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-30">
          <User className="w-16 h-16 mx-auto text-zinc-600" />
        </div>
        <h2 className="text-xl font-bold text-zinc-400 mb-2">User Not Found</h2>
        <p className="text-sm text-zinc-500">The user &quot;{username}&quot; does not exist.</p>
        <Link to="/" className="inline-block mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  const isOnline = profile.online === "1";

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <User className="w-4 h-4" />
          {profile.username}&apos;s Profile
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-zinc-800 rounded-xl flex items-center justify-center border-2 border-zinc-700 overflow-hidden">
                <HabboAvatar look={profile.look} size="large" />
              </div>
              {/* Online indicator */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-zinc-900 ${isOnline ? "bg-emerald-400" : "bg-zinc-600"}`} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
                <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded border ${rankColors[profile.rank] || rankColors[1]}`}>
                  {rankLabels[profile.rank] || "Member"}
                </span>
                {isOnline && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-400 italic mb-3">&quot;{profile.motto || "No motto set"}&quot;</p>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(profile.account_created)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last seen {isOnline ? "now" : timeAgo(profile.last_online)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{profile.friends_count} friends</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Badges */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <Award className="w-4 h-4" />
              Badges ({profile.badges.length})
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
              {profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, i) => (
                    <div key={i} className="w-11 h-11 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 hover:border-zinc-500 transition-all" title={badge.badge_code}>
                      <img
                        src={`https://images.habbo.com/c_images/album1584/${badge.badge_code}.gif`}
                        alt={badge.badge_code}
                        className="w-8 h-8"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">No badges yet.</p>
              )}
            </div>
          </div>

          {/* Rooms */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <Home className="w-4 h-4" />
              Rooms ({profile.rooms.length})
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0">
              {profile.rooms.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {profile.rooms.map((room) => (
                    <div key={room.id} className="px-4 py-3 hover:bg-zinc-800/50 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{room.name}</h4>
                          {room.description && (
                            <p className="text-xs text-zinc-500 mt-0.5">{room.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {room.users}/{room.users_max}
                          </span>
                          <span className="text-yellow-500">+{room.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">No rooms created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Profile Stats Card */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm">
              Profile Info
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-3">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Gender</span>
                <span className="text-sm text-zinc-300">{profile.gender === "M" ? "Male" : "Female"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Rank</span>
                <span className={`text-sm font-medium ${profile.rank >= 6 ? "text-emerald-400" : profile.rank >= 2 ? "text-amber-400" : "text-zinc-300"}`}>
                  {rankLabels[profile.rank] || "Member"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Friends</span>
                <span className="text-sm text-zinc-300">{profile.friends_count}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Rooms</span>
                <span className="text-sm text-zinc-300">{profile.rooms.length}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Badges</span>
                <span className="text-sm text-zinc-300">{profile.badges.length}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Status</span>
                <span className={`text-sm font-medium ${isOnline ? "text-emerald-400" : "text-zinc-500"}`}>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          {/* Groups */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Groups ({profile.groups.length})
            </div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0">
              {profile.groups.length > 0 ? (
                <div className="divide-y divide-zinc-800">
                  {profile.groups.map((group) => (
                    <div key={group.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center border border-zinc-700">
                        <img
                          src={`https://www.habbo.com/habbo-imaging/badge/${group.badge}.gif`}
                          alt={group.name}
                          className="w-6 h-6"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <span className="text-sm text-zinc-300">{group.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">No groups joined.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
