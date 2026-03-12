import { useState, useEffect } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Clock, Shield, Users } from "lucide-react";

interface OldStaffMember {
  id: number;
  username: string;
  look: string;
  motto: string;
  rank_name: string;
  served_until: string;
}

export function OldStaffPage() {
  const [members, setMembers] = useState<OldStaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/staff/history")
      .then((data) => {
        setMembers(data.members || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Clock className="w-8 h-8 text-zinc-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Former Government Officials</h1>
              <p className="text-zinc-300/70 text-sm mt-0.5">Honoring those who served our community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
          <p className="text-sm text-zinc-400 leading-relaxed">
            These are the former officials who previously served in the HabPlus Government. They dedicated their time and effort 
            to making our hotel a better place. We honor their service and contributions to our community.
          </p>
        </div>
      </div>

      {/* Old Staff List */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center overflow-hidden border border-zinc-700">
                  <HabboAvatar look={member.look} size="medium" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-zinc-300 text-sm">{member.username}</div>
                  <div className="text-xs text-zinc-500 italic truncate">&quot;{member.motto}&quot;</div>
                  <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider font-semibold">
                    Former {member.rank_name}
                  </div>
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
          <h3 className="text-lg font-bold text-zinc-400">No Former Staff</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            When government officials step down or are replaced through elections, they will be honored here.
          </p>
        </div>
      )}
    </div>
  );
}
