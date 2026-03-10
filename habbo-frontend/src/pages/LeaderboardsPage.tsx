import { useState, useEffect } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Trophy, Medal, Coins, Clock, Users, Star } from "lucide-react";

interface LeaderboardUser {
  id: number;
  username: string;
  look: string;
  motto: string;
  credits: number;
  pixels: number;
  online: number;
  account_created: number;
}

export function LeaderboardsPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBoard, setActiveBoard] = useState("credits");

  useEffect(() => {
    loadLeaderboard();
  }, [activeBoard]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/leaderboards?sort=${activeBoard}`);
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const boards = [
    { key: "credits", label: "Richest", icon: <Coins className="w-4 h-4" /> },
    { key: "pixels", label: "Most Pixels", icon: <Star className="w-4 h-4" /> },
    { key: "online", label: "Online Now", icon: <Users className="w-4 h-4" /> },
    { key: "oldest", label: "Oldest Accounts", icon: <Clock className="w-4 h-4" /> },
  ];

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-zinc-300";
    if (index === 2) return "text-orange-400";
    return "text-zinc-600";
  };

  const getMedalBg = (index: number) => {
    if (index === 0) return "bg-yellow-900/30 border-yellow-700/30";
    if (index === 1) return "bg-zinc-700/30 border-zinc-600/30";
    if (index === 2) return "bg-orange-900/30 border-orange-700/30";
    return "bg-zinc-800/50 border-zinc-700/30";
  };

  const getValue = (user: LeaderboardUser) => {
    if (activeBoard === "credits") return `${user.credits.toLocaleString()} credits`;
    if (activeBoard === "pixels") return `${user.pixels.toLocaleString()} pixels`;
    if (activeBoard === "online") return user.online ? "Online" : "Offline";
    if (activeBoard === "oldest") return new Date(user.account_created * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Leaderboards</h1>
              <p className="text-purple-200/70 text-sm mt-0.5">See who's on top of the hotel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Board Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {boards.map((board) => (
          <button
            key={board.key}
            onClick={() => setActiveBoard(board.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeBoard === board.key
                ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {board.icon}
            {board.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length > 0 ? (
        <div className="space-y-2">
          {users.map((user, idx) => (
            <div
              key={user.id}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                idx < 3
                  ? `${getMedalBg(idx)} hover:border-zinc-600`
                  : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getMedalBg(idx)}`}>
                {idx < 3 ? (
                  <Medal className={`w-5 h-5 ${getMedalColor(idx)}`} />
                ) : (
                  <span className="text-xs font-bold text-zinc-500">{idx + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
                <HabboAvatar look={user.look} size="medium" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{user.username}</div>
                <div className="text-xs text-zinc-500 truncate italic">&quot;{user.motto || "No motto"}&quot;</div>
              </div>

              {/* Value */}
              <div className="text-right shrink-0">
                <div className={`text-sm font-bold ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-zinc-300" : idx === 2 ? "text-orange-400" : "text-zinc-400"}`}>
                  {getValue(user)}
                </div>
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider">#{idx + 1}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
            <Trophy className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-400">No Data Yet</h3>
          <p className="text-sm text-zinc-500 mt-1">Leaderboard data will appear as more users join the hotel.</p>
        </div>
      )}
    </div>
  );
}
