import { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "";

interface Season {
  id: number;
  name: string;
  start_date: number;
  end_date: number;
  max_tier: number;
  days_remaining: number;
}

interface Tier {
  tier: number;
  reward_type: string;
  reward_amount: number;
  reward_badge: string | null;
  reward_furni_id: number | null;
  description: string;
  xp_required: number;
  cumulative_xp: number;
}

interface Progress {
  total_xp: number;
  current_tier: number;
  login_streak: number;
  last_login_date: string | null;
}

interface Task {
  id: number;
  task_key: string;
  description: string;
  target: number;
  xp_reward: number;
  task_type: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

const rewardIcons: Record<string, string> = {
  credits: "\uD83D\uDCB0",
  duckets: "\uD83D\uDFE2",
  diamonds: "\uD83D\uDC8E",
  badge: "\uD83C\uDFC5",
  furni: "\uD83E\uDE91",
};

const rewardColors: Record<string, string> = {
  credits: "#FFD700",
  duckets: "#7BB534",
  diamonds: "#00BFFF",
  badge: "#FF6B6B",
  furni: "#DDA0DD",
};

export function BattlePassPage() {
  const [season, setSeason] = useState<Season | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [claimedTiers, setClaimedTiers] = useState<number[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);
  const [claimingTask, setClaimingTask] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };

  const fetchAll = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [seasonRes, tiersRes, progressRes, tasksRes] = await Promise.all([
        fetch(`${API}/api/battlepass/season`),
        fetch(`${API}/api/battlepass/tiers`),
        fetch(`${API}/api/battlepass/progress`, { headers }),
        fetch(`${API}/api/battlepass/tasks`, { headers }),
      ]);

      const seasonData = await seasonRes.json();
      const tiersData = await tiersRes.json();
      const progressData = await progressRes.json();
      const tasksData = await tasksRes.json();

      setSeason(seasonData.season);
      setTiers(tiersData.tiers || []);
      setProgress(progressData.progress);
      setClaimedTiers(progressData.claimed_tiers || []);
      setDailyTasks(tasksData.daily || []);
      setWeeklyTasks(tasksData.weekly || []);

      // Record daily login
      await fetch(`${API}/api/battlepass/login`, {
        method: "POST",
        headers,
      });
    } catch (err) {
      console.error("Failed to load battle pass:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const claimTier = async (tier: number) => {
    setClaiming(tier);
    try {
      const res = await fetch(`${API}/api/battlepass/tiers/${tier}/claim`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`Claimed Tier ${tier}: ${data.description}!`);
        setTimeout(() => setNotification(null), 3000);
        await fetchAll();
      } else {
        setNotification(data.detail || "Failed to claim");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setNotification("Error claiming reward");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setClaiming(null);
    }
  };

  const claimTask = async (taskId: number) => {
    setClaimingTask(taskId);
    try {
      const res = await fetch(`${API}/api/battlepass/tasks/${taskId}/claim`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(`+${data.xp_earned} XP earned!`);
        setTimeout(() => setNotification(null), 3000);
        await fetchAll();
      } else {
        setNotification(data.detail || "Failed to claim");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setNotification("Error claiming task");
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setClaimingTask(null);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-900/80 rounded-xl p-8 text-center border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Battle Pass</h2>
          <p className="text-gray-400 mb-4">You need to be logged in to view the Battle Pass.</p>
          <a href="/login" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading Battle Pass...</div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-gray-900/80 rounded-xl p-8 text-center border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">No Active Season</h2>
          <p className="text-gray-400">Check back soon for the next Battle Pass season!</p>
        </div>
      </div>
    );
  }

  const currentTier = progress?.current_tier || 0;
  const totalXP = progress?.total_xp || 0;
  const loginStreak = progress?.login_streak || 0;

  // Calculate XP to next tier
  const nextTier = tiers.find((t) => t.tier === currentTier + 1);
  const prevTierCumulativeXP = currentTier > 0
    ? (tiers.find((t) => t.tier === currentTier)?.cumulative_xp || 0)
    : 0;
  const nextTierCumulativeXP = nextTier?.cumulative_xp || prevTierCumulativeXP;
  const tierXPRange = nextTierCumulativeXP - prevTierCumulativeXP;
  const xpIntoTier = totalXP - prevTierCumulativeXP;
  const tierProgressPct = tierXPRange > 0
    ? Math.min(100, Math.round((xpIntoTier / tierXPRange) * 100))
    : (currentTier >= (season?.max_tier || 0) ? 100 : 0);

  return (
    <div className="min-h-screen py-6 px-4">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse font-bold">
          {notification}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-purple-900/90 rounded-2xl p-6 mb-6 border border-purple-500/30 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500">
                HABPLUS BATTLE PASS
              </h1>
              <p className="text-purple-300 text-sm mt-1">{season.name}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-400">{currentTier}</div>
                <div className="text-xs text-purple-300 uppercase tracking-wider">Tier</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400">{totalXP}</div>
                <div className="text-xs text-purple-300 uppercase tracking-wider">Total XP</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400">{loginStreak}</div>
                <div className="text-xs text-purple-300 uppercase tracking-wider">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400">{season.days_remaining}</div>
                <div className="text-xs text-purple-300 uppercase tracking-wider">Days Left</div>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-purple-300 mb-1">
              <span>Tier {currentTier} {nextTier ? `\u2192 Tier ${currentTier + 1}` : "(MAX)"}</span>
              <span>{xpIntoTier} / {tierXPRange} XP</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-4 border border-purple-500/30 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transition-all duration-500"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Daily Tasks */}
          <div className="bg-gray-900/80 rounded-xl border border-purple-500/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-700 to-green-900 px-4 py-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">&#x2600;&#xFE0F;</span> Daily Tasks
              </h2>
              <p className="text-green-200 text-xs">Resets every day at midnight</p>
            </div>
            <div className="p-3 space-y-2">
              {dailyTasks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No daily tasks available</p>
              ) : (
                dailyTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClaim={claimTask} claiming={claimingTask} />
                ))
              )}
            </div>
          </div>

          {/* Weekly Tasks */}
          <div className="bg-gray-900/80 rounded-xl border border-purple-500/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-2xl">&#x1F4C5;</span> Weekly Tasks
              </h2>
              <p className="text-blue-200 text-xs">Resets every Monday</p>
            </div>
            <div className="p-3 space-y-2">
              {weeklyTasks.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No weekly tasks available</p>
              ) : (
                weeklyTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClaim={claimTask} claiming={claimingTask} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Tier Rewards Track */}
        <div className="bg-gray-900/80 rounded-xl border border-purple-500/20 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-900 px-4 py-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">&#x1F3C6;</span> Tier Rewards
            </h2>
            <p className="text-purple-200 text-xs">Complete tasks to earn XP and unlock rewards</p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3">
              {tiers.map((tier) => {
                const unlocked = currentTier >= tier.tier;
                const claimed = claimedTiers.includes(tier.tier);
                const canClaim = unlocked && !claimed;

                return (
                  <div
                    key={tier.tier}
                    className={`relative rounded-xl border-2 p-3 text-center transition-all ${
                      claimed
                        ? "border-green-500/50 bg-green-900/20"
                        : canClaim
                        ? "border-yellow-400 bg-yellow-900/20 shadow-lg shadow-yellow-500/20 hover:scale-105 cursor-pointer"
                        : unlocked
                        ? "border-purple-500/40 bg-purple-900/20"
                        : "border-gray-700/50 bg-gray-900/40 opacity-60"
                    }`}
                    onClick={() => canClaim && claimTier(tier.tier)}
                  >
                    {/* Tier number badge */}
                    <div
                      className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                        unlocked ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {tier.tier}
                    </div>

                    {/* Reward icon */}
                    <div className="text-3xl mb-1" style={{ filter: unlocked ? "none" : "grayscale(1)" }}>
                      {rewardIcons[tier.reward_type] || "?"}
                    </div>

                    {/* Reward info */}
                    <div className="text-sm font-bold" style={{ color: unlocked ? rewardColors[tier.reward_type] : "#666" }}>
                      {tier.description}
                    </div>

                    {/* XP needed */}
                    <div className="text-[10px] text-gray-500 mt-1">
                      {tier.cumulative_xp} XP
                    </div>

                    {/* Status */}
                    {claimed && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        CLAIMED
                      </div>
                    )}
                    {canClaim && claiming === tier.tier && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <span className="text-yellow-400 text-sm font-bold animate-pulse">Claiming...</span>
                      </div>
                    )}
                    {canClaim && claiming !== tier.tier && (
                      <div className="mt-1 text-[10px] text-yellow-400 font-bold animate-pulse">
                        CLICK TO CLAIM
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onClaim,
  claiming,
}: {
  task: Task;
  onClaim: (id: number) => void;
  claiming: number | null;
}) {
  const progressPct = Math.min(100, Math.round((task.progress / task.target) * 100));

  return (
    <div
      className={`rounded-lg border p-3 ${
        task.claimed
          ? "border-green-500/30 bg-green-900/10"
          : task.completed
          ? "border-yellow-500/30 bg-yellow-900/10"
          : "border-gray-700/50 bg-gray-800/30"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm font-bold text-white">{task.description}</div>
          <div className="text-xs text-gray-400">
            +{task.xp_reward} XP
          </div>
        </div>
        <div className="text-right">
          {task.claimed ? (
            <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">DONE</span>
          ) : task.completed ? (
            <button
              onClick={() => onClaim(task.id)}
              disabled={claiming === task.id}
              className="text-xs font-bold bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
              {claiming === task.id ? "..." : "CLAIM"}
            </button>
          ) : (
            <span className="text-xs text-gray-500">
              {task.progress}/{task.target}
            </span>
          )}
        </div>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            task.claimed
              ? "bg-green-500"
              : task.completed
              ? "bg-yellow-500"
              : "bg-purple-500"
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
