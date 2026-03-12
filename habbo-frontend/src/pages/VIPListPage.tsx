import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Crown, Users } from "lucide-react";

interface VIPMember {
  id: number;
  username: string;
  look: string;
  motto: string;
  rank: number;
  rank_name: string;
  online: number;
}

interface VIPGroup {
  rank: number;
  rank_name: string;
  description: string;
  icon: string;
  color: string;
  badge_color: string;
  members: VIPMember[];
}

const rankBadgeImages: Record<number, string> = {
  5: "/badges/vip_diamond.png",
  4: "/badges/vip_gold.png",
  3: "/badges/vip_silver.png",
  2: "/badges/vip_bronze.png",
};

const rankBadgeColors: Record<number, string> = {
  5: "bg-cyan-900/50 text-cyan-300 border-cyan-700/50",
  4: "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
  3: "bg-zinc-700/50 text-zinc-300 border-zinc-500/50",
  2: "bg-orange-900/50 text-orange-300 border-orange-700/50",
};

export function VIPListPage() {
  const [vipGroups, setVipGroups] = useState<VIPGroup[]>([]);
  const [totalVip, setTotalVip] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/vip-list")
      .then((data) => {
        setVipGroups(data.groups);
        setTotalVip(data.total_vip);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Loading VIP members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
                <Crown className="w-8 h-8 text-yellow-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">VIP Members</h1>
                <p className="text-yellow-200/70 text-sm mt-0.5">Our most valued community members</p>
              </div>
            </div>
            <span className="bg-black/20 px-3 py-1.5 rounded-full text-sm font-semibold text-white/80">
              {totalVip} VIP {totalVip === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      </div>

      {/* VIP Rank Cards */}
      <div className="space-y-4">
        {vipGroups.map((group) => {
          const badgeImg = rankBadgeImages[group.rank];
          return (
            <div key={group.rank} className="rounded-lg overflow-hidden border border-zinc-800">
              {/* Rank Header */}
              <div className={`bg-gradient-to-r ${group.color} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center border border-white/10 p-1">
                    {badgeImg ? (
                      <img src={badgeImg} alt={group.rank_name} className="w-8 h-8 object-contain drop-shadow-lg" />
                    ) : (
                      <Crown className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm tracking-wide">{group.rank_name}</div>
                    <div className="text-[11px] text-white/50 leading-tight max-w-md">{group.description}</div>
                  </div>
                </div>
                <span className="bg-black/20 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white/80 shrink-0">
                  {group.members.length} {group.members.length === 1 ? "member" : "members"}
                </span>
              </div>

              {/* Members */}
              <div className="bg-zinc-900/80 p-4">
                {group.members.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/40 hover:border-zinc-600/60 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative shrink-0">
                            <div className="w-16 h-16 bg-zinc-700/40 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-600/40">
                              <HabboAvatar look={member.look} size="medium" />
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-800 ${
                                member.online ? "bg-emerald-500 shadow-emerald-500/50 shadow-sm" : "bg-zinc-600"
                              }`}
                            ></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white text-sm">{member.username}</div>
                            <div className="text-xs text-zinc-500 truncate mt-0.5 italic">
                              &quot;{member.motto || "No motto"}&quot;
                            </div>
                            <span
                              className={`inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                rankBadgeColors[member.rank] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                              }`}
                            >
                              {rankBadgeImages[member.rank] && (
                                <img src={rankBadgeImages[member.rank]} alt="" className="w-4 h-4 object-contain" />
                              )}
                              {member.rank_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="w-10 h-10 bg-zinc-800/80 rounded-lg flex items-center justify-center mx-auto mb-2 border border-zinc-700/40">
                      <Users className="w-5 h-5 text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-500">No members yet</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">Purchase this VIP rank from the Store</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
