import { useState, useEffect } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Trophy } from "lucide-react";

interface LeaderboardUser {
  id: number;
  username: string;
  look: string;
  motto: string;
  credits: number;
  pixels: number;
  diamonds: number;
  online: number;
  account_created: number;
  events_won?: number;
  last_online?: number;
}

interface AllBoards {
  richest: LeaderboardUser[];
  most_pixels: LeaderboardUser[];
  most_diamonds: LeaderboardUser[];
  oldest: LeaderboardUser[];
  longest_playing: LeaderboardUser[];
  most_events_won: LeaderboardUser[];
}

const boardConfig: { key: keyof AllBoards; label: string; emoji: string; twGradient: string; twText: string; getValue: (u: LeaderboardUser) => string }[] = [
  { key: "richest", label: "Richest", emoji: "\u{1F4B0}", twGradient: "from-amber-600 to-zinc-900", twText: "text-amber-400", getValue: (u) => `${u.credits.toLocaleString()} credits` },
  { key: "most_pixels", label: "Most Duckets", emoji: "\u{2B50}", twGradient: "from-green-600 to-zinc-900", twText: "text-green-400", getValue: (u) => `${u.pixels.toLocaleString()} duckets` },
  { key: "most_diamonds", label: "Most Diamonds", emoji: "\u{1F48E}", twGradient: "from-teal-600 to-zinc-900", twText: "text-teal-400", getValue: (u) => `${(u.diamonds || 0).toLocaleString()} diamonds` },
  { key: "oldest", label: "Oldest Accounts", emoji: "\u{23F3}", twGradient: "from-purple-700 to-zinc-900", twText: "text-purple-400", getValue: (u) => { const d = new Date(u.account_created * 1000); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } },
  { key: "longest_playing", label: "Longest Playing", emoji: "\u{1F525}", twGradient: "from-orange-600 to-zinc-900", twText: "text-orange-400", getValue: (u) => { const secs = u.last_online ? (u.last_online - u.account_created) : 0; const days = Math.floor(secs / 86400); return days > 0 ? `${days.toLocaleString()} days` : "Active"; } },
  { key: "most_events_won", label: "Most Events Won", emoji: "\u{1F3C6}", twGradient: "from-yellow-700 to-zinc-900", twText: "text-yellow-400", getValue: (u) => `${(u.events_won || 0)} events won` },
];

function MedalBadge({ index }: { index: number }) {
  if (index === 0) return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-700 border border-yellow-500 shadow-[0_0_6px_rgba(255,215,0,0.4)] flex items-center justify-center text-[11px] font-bold text-white shrink-0">1</div>;
  if (index === 1) return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-400 flex items-center justify-center text-[11px] font-bold text-white shrink-0">2</div>;
  if (index === 2) return <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-700 flex items-center justify-center text-[11px] font-bold text-white shrink-0">3</div>;
  return <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-zinc-500 shrink-0">{index + 1}</div>;
}

export function LeaderboardsPage() {
  const [boards, setBoards] = useState<AllBoards | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/leaderboards/all")
      .then((data) => setBoards(data))
      .catch(() => setBoards(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Trophy className="w-7 h-7 text-purple-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Leaderboards</h1>
              <p className="text-purple-200/60 text-sm">See who's on top of the hotel</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {boardConfig.map((cfg) => {
          const users = boards ? (boards[cfg.key] || []) : [];
          return (
            <div key={cfg.key} className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
              <div className={`bg-gradient-to-r ${cfg.twGradient} px-3 py-2.5 flex items-center gap-2 border-b border-zinc-700/50`}>
                <span className="text-base">{cfg.emoji}</span>
                <span className="font-bold text-white text-sm">{cfg.label}</span>
              </div>
              <div>
                {users.length === 0 ? (
                  <div className="px-3 py-6 text-center text-zinc-600 text-xs">No users yet</div>
                ) : (
                  users.map((user, idx) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800/50 transition-all ${
                        idx < users.length - 1 ? "border-b border-zinc-800/50" : ""
                      } ${idx === 0 ? "bg-yellow-500/5" : ""}`}
                    >
                      <MedalBadge index={idx} />
                      <div className="w-8 h-8 overflow-hidden rounded bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center">
                        <HabboAvatar look={user.look} size="small" direction={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-300 truncate">{user.username}</div>
                        <div className={`text-[10px] font-medium ${cfg.twText}`}>{cfg.getValue(user)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
