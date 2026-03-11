import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Radio, Users, Headphones, Crown } from "lucide-react";

interface StaffMember {
  id: number;
  username: string;
  look: string;
  motto: string;
  rank: number;
  rank_name: string;
  online: number;
}

interface StaffGroup {
  rank: number;
  rank_name: string;
  description: string;
  icon: string;
  color: string;
  members: StaffMember[];
}

export function DJStaffPage() {
  const [groups, setGroups] = useState<StaffGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet("/api/staff").then((data) => {
        // Filter to only DJ Manager (rank 7) and DJ (rank 6)
        const djGroups = data.groups.filter((g: StaffGroup) => g.rank === 7 || g.rank === 6);
        setGroups(djGroups);
      }),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Loading DJ staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Radio className="w-8 h-8 text-pink-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">HabPlus Radio DJ Staff</h1>
              <p className="text-pink-200/70 text-sm mt-0.5">The voices behind HabPlus Radio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Headphones className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-400 leading-relaxed">
            Our DJ Staff run HabPlus Radio, hosting live shows and keeping the hotel entertained with music. 
            DJ Managers oversee the radio team, schedule shows, and ensure broadcast quality. DJs host live shows and entertain the community.
          </p>
        </div>
      </div>

      {/* DJ Staff Groups */}
      {groups.map((group) => (
        <div key={group.rank} className="rounded-lg overflow-hidden border border-zinc-800">
          {/* Group Header */}
          <div className={`bg-gradient-to-r ${group.color} px-5 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
                {group.rank === 7 ? <Crown className="w-5 h-5 text-white" /> : <Radio className="w-5 h-5 text-white" />}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                          member.rank === 7 ? "bg-pink-900/50 text-pink-300 border-pink-700/50" : "bg-rose-900/50 text-rose-300 border-rose-700/50"
                        }`}>
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
                <p className="text-sm text-zinc-500">No {group.rank_name} members yet</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">This position is currently open</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {groups.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
            <Radio className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-400">No DJ Staff Yet</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            DJ Manager and DJ positions will appear here once staff are assigned.
          </p>
        </div>
      )}
    </div>
  );
}
