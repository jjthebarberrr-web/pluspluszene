import { useState } from "react";
import { HabboAvatar } from "../components/HabboAvatar";
import { Crown, Star, Gem, Users } from "lucide-react";

interface VIPMember {
  id: number;
  username: string;
  look: string;
  motto: string;
  vip_since: string;
  tier: string;
}

export function VIPListPage() {
  const [members] = useState<VIPMember[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Crown className="w-8 h-8 text-yellow-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">VIP Members</h1>
              <p className="text-yellow-200/70 text-sm mt-0.5">Our most valued community members</p>
            </div>
          </div>
        </div>
      </div>

      {/* VIP Tiers Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center mx-auto mb-2 border border-amber-700/30">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-amber-400">Gold VIP</h3>
          <p className="text-xs text-zinc-500 mt-1">Premium perks, exclusive badges, priority support</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-zinc-700/30 rounded-lg flex items-center justify-center mx-auto mb-2 border border-zinc-600/30">
            <Gem className="w-5 h-5 text-zinc-300" />
          </div>
          <h3 className="text-sm font-bold text-zinc-300">Silver VIP</h3>
          <p className="text-xs text-zinc-500 mt-1">Extra credits, special rooms, custom commands</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-2 border border-orange-700/30">
            <Star className="w-5 h-5 text-orange-400" />
          </div>
          <h3 className="text-sm font-bold text-orange-400">Bronze VIP</h3>
          <p className="text-xs text-zinc-500 mt-1">Bonus credits, VIP badge, forum access</p>
        </div>
      </div>

      {/* VIP Members List */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-amber-700/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-700">
                  <HabboAvatar look={member.look} size="medium" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-amber-300 text-sm">{member.username}</div>
                  <div className="text-xs text-zinc-500 italic truncate">&quot;{member.motto}&quot;</div>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-900/30 text-amber-400 border border-amber-700/30">
                    {member.tier}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
            <Users className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-400">No VIP Members Yet</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            VIP memberships will be available soon in the Store. Stay tuned for exclusive perks and benefits!
          </p>
        </div>
      )}
    </div>
  );
}
