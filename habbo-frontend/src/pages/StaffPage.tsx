import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";

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
  members: StaffMember[];
}

const rankHeaderColors: Record<number, string> = {
  7: "from-purple-700 to-purple-600",
  6: "from-red-700 to-red-600",
  5: "from-emerald-700 to-emerald-600",
  4: "from-sky-700 to-sky-600",
  3: "from-amber-700 to-amber-600",
  2: "from-yellow-700 to-yellow-600",
};

export function StaffPage() {
  const [staffGroups, setStaffGroups] = useState<StaffGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/staff")
      .then((data) => setStaffGroups(data.groups))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading staff...</div>;

  return (
    <div className="space-y-6">
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-4 py-2.5 text-white font-bold text-sm">Hotel Staff Team</div>
        <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
          <p className="text-sm text-zinc-400">Meet the team that keeps HabboRetro running smoothly.</p>
        </div>
      </div>

      {staffGroups.length === 0 ? (
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-zinc-700 to-zinc-600 px-4 py-2.5 text-white font-bold text-sm">Staff</div>
          <div className="bg-zinc-900 p-8 border border-zinc-800 border-t-0 text-center">
            <p className="text-zinc-500">No staff members found.</p>
          </div>
        </div>
      ) : (
        staffGroups.map((group) => (
          <div key={group.rank} className="rounded overflow-hidden">
            <div className={`bg-gradient-to-r ${rankHeaderColors[group.rank] || "from-zinc-700 to-zinc-600"} px-4 py-2.5 text-white font-bold text-sm flex items-center justify-between`}>
              <span>{group.rank_name}</span>
              <span className="text-xs font-normal opacity-80">{group.members.length} {group.members.length === 1 ? "member" : "members"}</span>
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-600">
                        <HabboAvatar look={member.look} size="medium" />
                      </div>
                      {member.online ? (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-zinc-800"></div>
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm">{member.username}</div>
                      <div className="text-xs text-zinc-500 truncate">{member.motto || "No motto"}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">{member.rank_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
