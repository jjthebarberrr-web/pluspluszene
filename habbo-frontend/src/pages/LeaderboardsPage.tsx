import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";

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
  extra_value?: number;
}

interface AllBoards {
  richest: LeaderboardUser[];
  most_pixels: LeaderboardUser[];
  most_diamonds: LeaderboardUser[];
  most_ltd: LeaderboardUser[];
  most_logins: LeaderboardUser[];
  most_achievement: LeaderboardUser[];
  most_respects: LeaderboardUser[];
  online_time: LeaderboardUser[];
}

const boardConfig: {
  key: keyof AllBoards;
  label: string;
  icon: string;
  headerBg: string;
  headerText: string;
  valueIcon: string;
  getValue: (u: LeaderboardUser) => string;
  valueSuffix: string;
}[] = [
  {
    key: "richest", label: "Credits", icon: "/images/leaderboards/credits.png",
    headerBg: "bg-yellow-400", headerText: "text-yellow-900",
    valueIcon: "/images/leaderboards/credits.png",
    getValue: (u) => u.credits.toLocaleString(), valueSuffix: "Credits",
  },
  {
    key: "most_pixels", label: "Duckets", icon: "/images/leaderboards/duckets.png",
    headerBg: "bg-orange-400", headerText: "text-orange-900",
    valueIcon: "/images/leaderboards/duckets.png",
    getValue: (u) => u.pixels.toLocaleString(), valueSuffix: "Duckets",
  },
  {
    key: "most_diamonds", label: "Diamonds", icon: "/images/leaderboards/diamonds.png",
    headerBg: "bg-cyan-400", headerText: "text-cyan-900",
    valueIcon: "/images/leaderboards/diamonds.png",
    getValue: (u) => (u.diamonds || 0).toLocaleString(), valueSuffix: "Diamonds",
  },
  {
    key: "most_ltd", label: "LTD", icon: "/images/leaderboards/jewels.png",
    headerBg: "bg-purple-400", headerText: "text-purple-900",
    valueIcon: "/images/leaderboards/jewels.png",
    getValue: (u) => (u.extra_value || 0).toLocaleString(), valueSuffix: "LTDs",
  },
  {
    key: "most_logins", label: "Logins", icon: "/images/leaderboards/logins.png",
    headerBg: "bg-green-400", headerText: "text-green-900",
    valueIcon: "/images/leaderboards/logins.png",
    getValue: (u) => {
      const d = new Date(u.account_created * 1000);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },
    valueSuffix: "",
  },
  {
    key: "most_achievement", label: "Achievement Score", icon: "/images/leaderboards/achievement.png",
    headerBg: "bg-blue-400", headerText: "text-blue-900",
    valueIcon: "/images/leaderboards/achievement.png",
    getValue: (u) => (u.extra_value || 0).toLocaleString(), valueSuffix: "Score",
  },
  {
    key: "most_respects", label: "Respects", icon: "/images/leaderboards/respect.gif",
    headerBg: "bg-rose-400", headerText: "text-rose-900",
    valueIcon: "/images/leaderboards/respect.gif",
    getValue: (u) => (u.extra_value || 0).toLocaleString(), valueSuffix: "Respects",
  },
  {
    key: "online_time", label: "Online Time", icon: "/images/leaderboards/time.png",
    headerBg: "bg-indigo-400", headerText: "text-indigo-900",
    valueIcon: "/images/leaderboards/time.png",
    getValue: (u) => {
      const secs = u.extra_value || 0;
      const days = Math.floor(secs / 86400);
      const hours = Math.floor((secs % 86400) / 3600);
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h`;
      return "Active";
    },
    valueSuffix: "",
  },
];

function MedalBadge({ index }: { index: number }) {
  if (index === 0) return <img src="/images/leaderboards/gold.png" alt="1st" className="w-6 h-6 shrink-0" style={{ imageRendering: "pixelated" }} />;
  if (index === 1) return <img src="/images/leaderboards/silver.png" alt="2nd" className="w-6 h-6 shrink-0" style={{ imageRendering: "pixelated" }} />;
  if (index === 2) return <img src="/images/leaderboards/bronze.png" alt="3rd" className="w-6 h-6 shrink-0" style={{ imageRendering: "pixelated" }} />;
  return null;
}

export function LeaderboardsPage() {
  const [boards, setBoards] = useState<AllBoards | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    <div className="max-w-7xl mx-auto px-2">
      {/* Grid of leaderboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {boardConfig.map((cfg) => {
          const users = boards ? (boards[cfg.key] || []) : [];
          return (
            <div key={cfg.key} className="bg-zinc-900/80 rounded-xl overflow-hidden border border-zinc-800 shadow-lg">
              {/* Category Header */}
              <div className={`${cfg.headerBg} px-4 py-2.5 flex items-center gap-2.5 rounded-t-xl`}>
                <img src={cfg.icon} alt={cfg.label} className="w-5 h-5 shrink-0" style={{ imageRendering: "pixelated" }} />
                <span className={`font-bold text-sm ${cfg.headerText} tracking-wide`}>{cfg.label}</span>
              </div>

              {/* User List */}
              <div className="divide-y divide-zinc-800/60">
                {users.length === 0 ? (
                  <div className="px-4 py-8 text-center text-zinc-600 text-xs">No users yet</div>
                ) : (
                  users.map((user, idx) => (
                    <div key={user.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-800/40 transition-colors">
                      {/* Avatar */}
                      <div className="w-12 h-14 overflow-hidden shrink-0 flex items-end justify-center">
                        <HabboAvatar look={user.look} size="small" direction={2} />
                      </div>

                      {/* Name + Value */}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => navigate(`/user/${user.username}`)}
                          className="text-sm font-bold text-white hover:text-purple-400 transition-colors truncate block text-left"
                        >
                          {user.username}
                        </button>
                        <div className="flex items-center gap-1 mt-0.5">
                          <img src={cfg.valueIcon} alt="" className="w-3.5 h-3.5 shrink-0" style={{ imageRendering: "pixelated" }} />
                          <span className="text-xs text-zinc-400">{cfg.getValue(user)} {cfg.valueSuffix}</span>
                        </div>
                      </div>

                      {/* Medal for top 3 */}
                      <MedalBadge index={idx} />
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
