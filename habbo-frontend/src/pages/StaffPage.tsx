import { useEffect, useState } from "react";
import { apiGet, apiPost, isLoggedIn } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import {
  Crown, Shield, Landmark, Scale, Users, UserCheck, Vote,
  Scroll, Gavel, Star, Building2, Award, ArrowDown
} from "lucide-react";

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

interface Candidate {
  id: number;
  user_id: number;
  username: string;
  look: string;
  statement: string;
  votes: number;
}

interface Election {
  id: number;
  position_rank: number;
  position_name: string;
  color: string;
  status: "nominations" | "voting" | "closed";
  candidates: Candidate[];
  created_at: number;
  voting_starts: number;
  voting_ends: number;
  winner_id: number;
}

const rankIcons: Record<string, React.ReactNode> = {
  crown: <Crown className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  landmark: <Landmark className="w-5 h-5" />,
  scale: <Scale className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  "user-check": <UserCheck className="w-5 h-5" />,
  user: <Users className="w-5 h-5" />,
};

const rankBadgeColors: Record<number, string> = {
  15: "bg-violet-900/50 text-violet-300 border-violet-700/50",
  14: "bg-yellow-900/50 text-yellow-300 border-yellow-700/50",
  13: "bg-red-900/50 text-red-300 border-red-700/50",
  12: "bg-purple-900/50 text-purple-300 border-purple-700/50",
  11: "bg-blue-900/50 text-blue-300 border-blue-700/50",
  10: "bg-emerald-900/50 text-emerald-300 border-emerald-700/50",
  9: "bg-green-900/50 text-green-300 border-green-700/50",
  8: "bg-lime-900/50 text-lime-300 border-lime-700/50",
  7: "bg-pink-900/50 text-pink-300 border-pink-700/50",
  6: "bg-rose-900/50 text-rose-300 border-rose-700/50",
};

const rankSmallIcons: Record<string, React.ReactNode> = {
  crown: <Crown className="w-3.5 h-3.5" />,
  shield: <Shield className="w-3.5 h-3.5" />,
  landmark: <Landmark className="w-3.5 h-3.5" />,
  scale: <Scale className="w-3.5 h-3.5" />,
  users: <Users className="w-3.5 h-3.5" />,
  "user-check": <UserCheck className="w-3.5 h-3.5" />,
  user: <Users className="w-3.5 h-3.5" />,
};

export function StaffPage() {
  const [staffGroups, setStaffGroups] = useState<StaffGroup[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"hierarchy" | "elections">("hierarchy");
  const [votingMessage, setVotingMessage] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/api/staff").then((data) => {
        // Only show government officials (rank 10+), DJs and Events have their own pages
        const govGroups = data.groups.filter((g: StaffGroup) => g.rank >= 10);
        setStaffGroups(govGroups);
      }),
      apiGet("/api/staff/elections").then((data) => setElections(data.elections)).catch(() => {}),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (electionId: number, candidateId: number) => {
    try {
      const res = await apiPost(`/api/staff/elections/${electionId}/vote`, {
        election_id: electionId,
        candidate_id: candidateId,
      });
      setVotingMessage(res.message || "Vote cast!");
      const data = await apiGet("/api/staff/elections");
      setElections(data.elections);
    } catch (err) {
      setVotingMessage(err instanceof Error ? err.message : "Failed to vote");
    }
    setTimeout(() => setVotingMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Loading government officials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-700 via-amber-600 to-yellow-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Building2 className="w-8 h-8 text-yellow-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">The Government of HabPlus</h1>
              <p className="text-yellow-200/70 text-sm mt-0.5">Elected by the people, serving the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("hierarchy")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "hierarchy"
              ? "bg-gradient-to-r from-yellow-600 to-amber-500 text-white shadow-lg shadow-amber-500/20"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <Landmark className="w-4 h-4" />Government Officials
        </button>
        <button
          onClick={() => setActiveTab("elections")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "elections"
              ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-lg shadow-purple-500/20"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
          }`}
        >
          <Vote className="w-4 h-4" />Elections &amp; Voting
        </button>
      </div>

      {votingMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400 text-center">
          {votingMessage}
        </div>
      )}

      {/* Hierarchy Tab */}
      {activeTab === "hierarchy" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT — Rank Cards (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            {staffGroups.map((group) => {
              const Icon = rankIcons[group.icon] || rankIcons.user;
              return (
                <div key={group.rank} className="rounded-lg overflow-hidden border border-zinc-800">
                  {/* Rank Header */}
                  <div className={`bg-gradient-to-r ${group.color} px-5 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
                        {Icon}
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

                  {/* Members — always visible */}
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
                                  className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                    rankBadgeColors[member.rank] || "bg-zinc-800 text-zinc-400 border-zinc-700"
                                  }`}
                                >
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
                        <p className="text-sm text-zinc-500">Position vacant</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">Can be filled through community elections</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — Sidebar widgets (1/3 width) */}
          <div className="space-y-4">
            {/* About the Government */}
            <div className="rounded-lg overflow-hidden border border-zinc-800">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 flex items-center gap-2">
                <Scroll className="w-4 h-4 text-white" />
                <span className="font-bold text-white text-sm">About Our Government</span>
              </div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-3">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  The <span className="text-amber-400 font-semibold">HabPlus Government</span> is the backbone of our virtual world.
                  Our officials are elected by the community and entrusted with keeping the hotel safe, fun, and thriving for everyone.
                </p>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Every leader you see here was chosen through democratic elections. They enforce the rules,
                  organize events, moderate discussions, and make decisions that shape the future of our hotel.
                  From the President down to our Citizens, each role carries real responsibility.
                </p>
                <div className="border-t border-zinc-800 pt-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Gavel className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400"><span className="text-zinc-300 font-medium">Enforce rules</span> and keep the hotel safe for all players</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400"><span className="text-zinc-300 font-medium">Organize events</span> and create memorable experiences</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-400"><span className="text-zinc-300 font-medium">Elected democratically</span> by the people, for the people</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chain of Command */}
            <div className="rounded-lg overflow-hidden border border-zinc-800">
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 px-4 py-2.5 flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-white" />
                <span className="font-bold text-white text-sm">Chain of Command</span>
              </div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
                <div className="space-y-1.5">
                  {staffGroups.map((group, idx) => (
                    <div key={group.rank}>
                      <div
                        className={`bg-gradient-to-r ${group.color} rounded-md px-3 py-2 flex items-center justify-between`}
                        style={{ marginLeft: `${idx * 8}px` }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-black/20 rounded flex items-center justify-center text-white">
                            {rankSmallIcons[group.icon] || rankSmallIcons.user}
                          </div>
                          <span className="text-white text-xs font-bold">{group.rank_name}</span>
                        </div>
                        <span className="text-white/50 text-[10px] font-medium">{group.members.length}</span>
                      </div>
                      {idx < staffGroups.length - 1 && (
                        <div className="flex" style={{ marginLeft: `${idx * 8 + 16}px` }}>
                          <div className="w-0.5 h-1.5 bg-zinc-700"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* How Elections Work */}
            <div className="rounded-lg overflow-hidden border border-zinc-800">
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-2.5 flex items-center gap-2">
                <Vote className="w-4 h-4 text-white" />
                <span className="font-bold text-white text-sm">How Elections Work</span>
              </div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-900/40 rounded-full flex items-center justify-center border border-purple-700/30 shrink-0">
                    <span className="text-[10px] font-bold text-purple-300">1</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Nominations Open</p>
                    <p className="text-[11px] text-zinc-500">Community members nominate candidates for open positions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-900/40 rounded-full flex items-center justify-center border border-purple-700/30 shrink-0">
                    <span className="text-[10px] font-bold text-purple-300">2</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Voting Period</p>
                    <p className="text-[11px] text-zinc-500">All registered users get one vote per election.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-900/40 rounded-full flex items-center justify-center border border-purple-700/30 shrink-0">
                    <span className="text-[10px] font-bold text-purple-300">3</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">Winner Takes Office</p>
                    <p className="text-[11px] text-zinc-500">The candidate with the most votes is promoted to the position.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Elections Tab */}
      {activeTab === "elections" && (
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-zinc-800">
            <div className="bg-gradient-to-r from-purple-700 to-teal-600 px-5 py-3 flex items-center gap-2">
              <Vote className="w-4 h-4 text-white" />
              <span className="font-bold text-white text-sm">Community Elections</span>
            </div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
              <p className="text-sm text-zinc-400 leading-relaxed">
                In HabPlus, the community has the power to elect their leaders. Every citizen can vote for candidates
                running for government positions. Elections are held regularly to fill open positions. Your vote matters — shape the future of our hotel.
              </p>
            </div>
          </div>

          {elections.length > 0 ? (
            elections.map((election) => (
              <div key={election.id} className="rounded-lg overflow-hidden border border-zinc-800">
                <div className={`bg-gradient-to-r ${election.color} px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-white" />
                    <span className="font-bold text-white text-sm">
                      Election for {election.position_name}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      election.status === "voting"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : election.status === "nominations"
                        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                        : "bg-zinc-500/20 text-zinc-300 border border-zinc-500/30"
                    }`}
                  >
                    {election.status}
                  </span>
                </div>
                <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
                  {election.candidates.length > 0 ? (
                    <div className="space-y-3">
                      {election.candidates.map((candidate, idx) => (
                        <div
                          key={candidate.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border ${
                            idx === 0 && election.status === "closed"
                              ? "bg-yellow-900/10 border-yellow-700/30"
                              : "bg-zinc-800/50 border-zinc-700/30"
                          }`}
                        >
                          <div className="text-center w-8">
                            <span className="text-lg font-bold text-zinc-500">#{idx + 1}</span>
                          </div>
                          <div className="w-10 h-10 bg-zinc-700 rounded-lg overflow-hidden border border-zinc-600">
                            <HabboAvatar look={candidate.look} size="small" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white text-sm">{candidate.username}</div>
                            {candidate.statement && (
                              <div className="text-xs text-zinc-500 italic truncate">&quot;{candidate.statement}&quot;</div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold text-purple-400">{candidate.votes}</div>
                            <div className="text-[10px] text-zinc-600 uppercase">votes</div>
                          </div>
                          {election.status === "voting" && isLoggedIn() && (
                            <button
                              onClick={() => handleVote(election.id, candidate.id)}
                              className="shrink-0 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-xs font-bold rounded-lg transition-all"
                            >
                              Vote
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 text-center py-4">No candidates yet. Nominations are open!</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg overflow-hidden border border-zinc-800">
              <div className="bg-zinc-900 p-10 text-center">
                <Vote className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-300">No Active Elections</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
                  Elections will be announced when government positions become available. Stay active in the community to be eligible for nominations!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
