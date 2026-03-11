import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";
import {
  LayoutDashboard, Users, Shield, Newspaper, DoorOpen, Settings, Gavel,
  Search, ChevronLeft, ChevronRight, Trash2, Edit3, Plus, Eye, Ban,
  Crown, Activity, TrendingUp, AlertTriangle, X, Check, Radio
} from "lucide-react";
import { HabboAvatar } from "../components/HabboAvatar";

const RANK_NAMES: Record<number, string> = {
  15: "Elite", 14: "President", 13: "Vice President", 12: "Governor", 11: "Senator",
  10: "Representative", 9: "Event Manager", 8: "Event", 7: "DJ Manager", 6: "DJ",
  5: "VIP Diamond", 4: "VIP Gold", 3: "VIP Silver", 2: "VIP Bronze", 1: "Member",
};

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, minRank: 6 },
  { id: "users", label: "Users", icon: Users, minRank: 11 },
  { id: "bans", label: "Bans", icon: Gavel, minRank: 11 },
  { id: "news", label: "News", icon: Newspaper, minRank: 12 },
  { id: "rooms", label: "Rooms", icon: DoorOpen, minRank: 11 },
  { id: "radio", label: "Radio / DJs", icon: Radio, minRank: 7 },
  { id: "modlogs", label: "Mod Logs", icon: Shield, minRank: 10 },
  { id: "settings", label: "Settings", icon: Settings, minRank: 14 },
];

// ==================== DASHBOARD ====================
function DashboardTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/api/housekeeping/dashboard").then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-zinc-400">Loading dashboard...</div>;
  if (!data) return <div className="text-center py-12 text-red-400">Failed to load dashboard</div>;

  const stats = data.stats;
  const statCards = [
    { label: "Total Users", value: stats.total_users, icon: Users, color: "from-blue-600 to-blue-800" },
    { label: "Online Now", value: stats.online_users, icon: Activity, color: "from-emerald-600 to-emerald-800" },
    { label: "New Today", value: stats.new_users_today, icon: TrendingUp, color: "from-purple-600 to-purple-800" },
    { label: "Total Rooms", value: stats.total_rooms, icon: DoorOpen, color: "from-amber-600 to-amber-800" },
    { label: "Active Bans", value: stats.total_bans, icon: Gavel, color: "from-red-600 to-red-800" },
    { label: "News Articles", value: stats.total_news, icon: Newspaper, color: "from-cyan-600 to-cyan-800" },
    { label: "Staff Members", value: stats.total_staff, icon: Crown, color: "from-yellow-600 to-yellow-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-lg p-4 shadow-lg`}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70 font-medium">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-sm">Recent Registrations</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {data.recent_users.map((u: any) => (
              <div key={u.id} className="px-4 py-2 flex items-center gap-3 hover:bg-zinc-800/50">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                  <HabboAvatar look={u.look} size="small" headOnly />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{u.username}</div>
                  <div className="text-xs text-zinc-500">{RANK_NAMES[u.rank] || `Rank ${u.rank}`}</div>
                </div>
                <div className="text-xs text-zinc-500">{new Date(u.account_created * 1000).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bans */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-red-400" />
            <span className="font-semibold text-sm">Recent Bans</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {data.recent_bans.length === 0 && (
              <div className="px-4 py-6 text-center text-zinc-500 text-sm">No bans recorded</div>
            )}
            {data.recent_bans.map((b: any) => (
              <div key={b.id} className="px-4 py-2 hover:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-300 font-medium">{b.banned_user}</span>
                  <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded">{b.type}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">by {b.staff_user} - {b.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== USER MANAGEMENT ====================
function UsersTab({ userRank }: { userRank: number }) {
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("username");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [banModal, setBanModal] = useState(false);
  const [banForm, setBanForm] = useState({ reason: "", duration: 0, type: "account" });
  const [message, setMessage] = useState("");

  const searchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/housekeeping/users?q=${encodeURIComponent(query)}&page=${p}&search_type=${searchType}`);
      setUsers(data.users);
      setTotalPages(data.pages);
      setPage(p);
    } catch { setUsers([]); }
    setLoading(false);
  }, [query, searchType]);

  useEffect(() => { searchUsers(); }, []);

  const viewUser = async (userId: number) => {
    try {
      const data = await apiGet(`/api/housekeeping/users/${userId}`);
      setSelectedUser(data);
      setEditForm({ motto: data.motto, credits: data.credits, pixels: data.pixels, rank: data.rank });
    } catch { }
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    try {
      await apiPut(`/api/housekeeping/users/${selectedUser.id}`, editForm);
      setMessage("User updated successfully!");
      setEditMode(false);
      viewUser(selectedUser.id);
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setMessage(e.message || "Failed to update user");
    }
  };

  const banUser = async () => {
    if (!selectedUser) return;
    try {
      await apiPost("/api/housekeeping/bans", {
        user_id: selectedUser.id,
        reason: banForm.reason,
        duration: banForm.duration,
        type: banForm.type,
      });
      setMessage("User banned successfully!");
      setBanModal(false);
      setBanForm({ reason: "", duration: 0, type: "account" });
      viewUser(selectedUser.id);
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setMessage(e.message || "Failed to ban user");
    }
  };

  if (selectedUser) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setSelectedUser(null); setEditMode(false); }} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back to search
        </button>

        {message && (
          <div className={`px-4 py-2 rounded text-sm ${message.includes("success") ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700" : "bg-red-900/50 text-red-300 border border-red-700"}`}>
            {message}
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800">
                <HabboAvatar look={selectedUser.look} size="small" headOnly />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedUser.username}</h3>
                <div className="text-sm text-zinc-400">
                  {RANK_NAMES[selectedUser.rank] || `Rank ${selectedUser.rank}`} | ID: {selectedUser.id}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditMode(!editMode)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              {selectedUser.rank < userRank && (
                <button onClick={() => setBanModal(true)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5" /> Ban
                </button>
              )}
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Account Info</h4>
              {[
                ["Email", selectedUser.email],
                ["Motto", editMode ? undefined : selectedUser.motto],
                ["Gender", selectedUser.gender === "M" ? "Male" : "Female"],
                ["Registered", new Date(selectedUser.account_created * 1000).toLocaleString()],
                ["Last Login", new Date(selectedUser.last_login * 1000).toLocaleString()],
                ["Online", selectedUser.online === "1" || selectedUser.online === 1 ? "Yes" : "No"],
                ["Home Room", selectedUser.home_room || "None"],
              ].map(([label, value]) => value !== undefined && (
                <div key={label as string} className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">{label}</span>
                  <span className="text-sm text-white">{value as string}</span>
                </div>
              ))}
              {editMode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Motto</span>
                  <input
                    value={editForm.motto || ""}
                    onChange={(e) => setEditForm({ ...editForm, motto: e.target.value })}
                    className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-48"
                  />
                </div>
              )}
              {userRank >= 13 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">IP Current</span>
                    <span className="text-sm text-white font-mono">{selectedUser.ip_current}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-500">IP Register</span>
                    <span className="text-sm text-white font-mono">{selectedUser.ip_register}</span>
                  </div>
                </>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Currency</h4>
              {editMode ? (
                <>
                  {[
                    ["Credits", "credits"],
                    ["Pixels", "pixels"],
                  ].map(([label, field]) => (
                    <div key={field} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">{label}</span>
                      <input
                        type="number"
                        value={editForm[field] ?? ""}
                        onChange={(e) => setEditForm({ ...editForm, [field]: parseInt(e.target.value) || 0 })}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white w-32"
                      />
                    </div>
                  ))}
                  {userRank >= 14 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">Rank</span>
                      <select
                        value={editForm.rank || 1}
                        onChange={(e) => setEditForm({ ...editForm, rank: parseInt(e.target.value) })}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
                      >
                        {Object.entries(RANK_NAMES).filter(([r]) => parseInt(r) < userRank).map(([r, name]) => (
                          <option key={r} value={r}>{name} (Rank {r})</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button onClick={saveUser} className="mt-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-sm font-medium flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Save Changes
                  </button>
                </>
              ) : (
                <>
                  {[
                    ["Credits", selectedUser.credits],
                    ["Duckets", selectedUser.duckets],
                    ["Diamonds", selectedUser.diamonds],
                  ].map(([label, value]) => (
                    <div key={label as string} className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500">{label}</span>
                      <span className="text-sm text-white font-bold">{(value as number)?.toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Badges */}
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mt-4">Badges ({selectedUser.badges?.length || 0})</h4>
              <div className="flex flex-wrap gap-1">
                {(selectedUser.badges || []).slice(0, 20).map((b: any, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-300">{b.code}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Ban History */}
          {selectedUser.bans && selectedUser.bans.length > 0 && (
            <div className="px-6 pb-4">
              <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Ban History</h4>
              <div className="space-y-2">
                {selectedUser.bans.map((b: any) => (
                  <div key={b.id} className="bg-red-950/30 border border-red-900/50 rounded p-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-red-300">{b.reason}</span>
                      <span className="text-xs text-red-400">{b.type}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(b.timestamp * 1000).toLocaleString()} | Expires: {b.expires === 0 ? "Permanent" : new Date(b.expires * 1000).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ban Modal */}
        {banModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-red-400 flex items-center gap-2"><Ban className="w-5 h-5" /> Ban {selectedUser.username}</h3>
                <button onClick={() => setBanModal(false)}><X className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Reason</label>
                  <input
                    value={banForm.reason}
                    onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                    placeholder="Ban reason..."
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Duration</label>
                  <select
                    value={banForm.duration}
                    onChange={(e) => setBanForm({ ...banForm, duration: parseInt(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                  >
                    <option value={0}>Permanent</option>
                    <option value={3600}>1 Hour</option>
                    <option value={86400}>1 Day</option>
                    <option value={604800}>1 Week</option>
                    <option value={2592000}>30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 block mb-1">Type</label>
                  <select
                    value={banForm.type}
                    onChange={(e) => setBanForm({ ...banForm, type: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                  >
                    <option value="account">Account Ban</option>
                    <option value="ip">IP Ban</option>
                    <option value="machine">Machine Ban</option>
                  </select>
                </div>
                <button
                  onClick={banUser}
                  disabled={!banForm.reason}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded text-sm font-medium"
                >
                  Confirm Ban
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers(1)}
            placeholder="Search users..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white"
        >
          <option value="username">Username</option>
          <option value="email">Email</option>
          <option value="id">User ID</option>
        </select>
        <button onClick={() => searchUsers(1)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">
          Search
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                      <HabboAvatar look={u.look} size="small" headOnly />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{u.username}</div>
                      <div className="text-xs text-zinc-500">ID: {u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-300">{RANK_NAMES[u.rank] || `Rank ${u.rank}`}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${u.online === "1" || u.online === 1 ? "bg-emerald-900/50 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>
                    {u.online === "1" || u.online === 1 ? "Online" : "Offline"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => viewUser(u.id)} className="text-xs px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => searchUsers(page - 1)} disabled={page <= 1} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
          <button onClick={() => searchUsers(page + 1)} disabled={page >= totalPages} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== BANS MANAGEMENT ====================
function BansTab({ userRank: _userRank }: { userRank: number }) {
  const [bans, setBans] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadBans = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/housekeeping/bans?page=${p}&q=${encodeURIComponent(query)}`);
      setBans(data.bans);
      setTotalPages(data.pages);
      setPage(p);
    } catch { setBans([]); }
    setLoading(false);
  }, [query]);

  useEffect(() => { loadBans(); }, []);

  const removeBan = async (banId: number) => {
    if (!confirm("Remove this ban?")) return;
    try {
      await apiDelete(`/api/housekeeping/bans/${banId}`);
      setMessage("Ban removed!");
      loadBans(page);
      setTimeout(() => setMessage(""), 3000);
    } catch { }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="px-4 py-2 rounded text-sm bg-emerald-900/50 text-emerald-300 border border-emerald-700">{message}</div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadBans(1)}
            placeholder="Search bans by username or reason..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button onClick={() => loadBans(1)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">Search</button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Banned By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
            ) : bans.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No bans found</td></tr>
            ) : bans.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 text-sm text-red-300 font-medium">{b.banned_user}</td>
                <td className="px-4 py-3 text-sm text-zinc-300 max-w-xs truncate">{b.reason}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${b.type === "ip" ? "bg-orange-900/50 text-orange-300" : b.type === "machine" ? "bg-purple-900/50 text-purple-300" : "bg-red-900/50 text-red-300"}`}>
                    {b.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{b.staff_user}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {b.ban_expire === 0 ? <span className="text-red-400 font-medium">Permanent</span> : new Date(b.ban_expire * 1000).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => removeBan(b.id)} className="text-xs px-2.5 py-1 bg-red-900/50 hover:bg-red-800 rounded text-red-300 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => loadBans(page - 1)} disabled={page <= 1} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
          <button onClick={() => loadBans(page + 1)} disabled={page >= totalPages} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== NEWS MANAGEMENT ====================
function NewsTab() {
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", image_url: "", category: "general" });
  const [message, setMessage] = useState("");

  const loadNews = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/housekeeping/news?page=${p}`);
      setArticles(data.articles);
      setTotalPages(data.pages);
      setPage(p);
    } catch { setArticles([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadNews(); }, []);

  const saveArticle = async () => {
    try {
      if (editing) {
        await apiPut(`/api/housekeeping/news/${editing.id}`, form);
        setMessage("Article updated!");
      } else {
        await apiPost("/api/housekeeping/news", form);
        setMessage("Article published!");
      }
      setEditing(null);
      setCreating(false);
      setForm({ title: "", content: "", image_url: "", category: "general" });
      loadNews(page);
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setMessage(e.message || "Failed to save");
    }
  };

  const deleteArticle = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    try {
      await apiDelete(`/api/housekeeping/news/${id}`);
      setMessage("Article deleted!");
      loadNews(page);
      setTimeout(() => setMessage(""), 3000);
    } catch { }
  };

  if (creating || editing) {
    return (
      <div className="space-y-4">
        <button onClick={() => { setCreating(false); setEditing(null); setForm({ title: "", content: "", image_url: "", category: "general" }); }} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-bold">{editing ? "Edit Article" : "New Article"}</h3>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
              placeholder="Article title..."
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
            >
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="update">Update</option>
              <option value="promotion">Promotion</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Image URL (optional)</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white min-h-40"
              placeholder="Write article content..."
            />
          </div>
          <button
            onClick={saveArticle}
            disabled={!form.title || !form.content}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded text-sm font-medium"
          >
            {editing ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="px-4 py-2 rounded text-sm bg-emerald-900/50 text-emerald-300 border border-emerald-700">{message}</div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-sm text-zinc-400">Manage news articles</h3>
        <button onClick={() => setCreating(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Author</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No articles</td></tr>
            ) : articles.map((a) => (
              <tr key={a.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 text-sm text-white font-medium max-w-xs truncate">{a.title}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize">{a.category}</span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{a.author}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{new Date(a.created_at * 1000).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(a);
                        setForm({ title: a.title, content: a.content || "", image_url: a.image_url || "", category: a.category });
                      }}
                      className="text-xs px-2.5 py-1 bg-blue-900/50 hover:bg-blue-800 rounded text-blue-300 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => deleteArticle(a.id)} className="text-xs px-2.5 py-1 bg-red-900/50 hover:bg-red-800 rounded text-red-300 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => loadNews(page - 1)} disabled={page <= 1} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
          <button onClick={() => loadNews(page + 1)} disabled={page >= totalPages} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== ROOMS MANAGEMENT ====================
function RoomsTab() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadRooms = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/housekeeping/rooms?page=${p}&q=${encodeURIComponent(query)}`);
      setRooms(data.rooms);
      setTotalPages(data.pages);
      setPage(p);
    } catch { setRooms([]); }
    setLoading(false);
  }, [query]);

  useEffect(() => { loadRooms(); }, []);

  const deleteRoom = async (roomId: number) => {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    try {
      await apiDelete(`/api/housekeeping/rooms/${roomId}`);
      setMessage("Room deleted!");
      loadRooms(page);
      setTimeout(() => setMessage(""), 3000);
    } catch { }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div className="px-4 py-2 rounded text-sm bg-emerald-900/50 text-emerald-300 border border-emerald-700">{message}</div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadRooms(1)}
            placeholder="Search rooms by name or owner..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        <button onClick={() => loadRooms(1)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium">Search</button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Room Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Users</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">State</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
            ) : rooms.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No rooms found</td></tr>
            ) : rooms.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 text-sm text-zinc-400">#{r.id}</td>
                <td className="px-4 py-3 text-sm text-white font-medium">{r.name}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{r.owner_name}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{r.users}/{r.users_max}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded ${r.state === "open" ? "bg-emerald-900/50 text-emerald-300" : r.state === "locked" ? "bg-amber-900/50 text-amber-300" : "bg-red-900/50 text-red-300"}`}>
                    {r.state}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteRoom(r.id)} className="text-xs px-2.5 py-1 bg-red-900/50 hover:bg-red-800 rounded text-red-300 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => loadRooms(page - 1)} disabled={page <= 1} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
          <button onClick={() => loadRooms(page + 1)} disabled={page >= totalPages} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== MOD LOGS ====================
function ModLogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await apiGet(`/api/housekeeping/modlogs?page=${p}`);
      setLogs(data.logs);
      setTotalPages(data.pages);
      setPage(p);
    } catch { setLogs([]); }
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, []);

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-800/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Staff</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Target</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No mod logs found</td></tr>
            ) : logs.map((l) => (
              <tr key={l.id} className="hover:bg-zinc-800/30">
                <td className="px-4 py-3 text-sm text-zinc-400">{new Date(l.timestamp * 1000).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{l.type}</span>
                </td>
                <td className="px-4 py-3 text-sm text-white">{l.user_name}</td>
                <td className="px-4 py-3 text-sm text-zinc-300">{l.target_name}</td>
                <td className="px-4 py-3 text-sm text-zinc-500 max-w-xs truncate">{l.extra_data}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => loadLogs(page - 1)} disabled={page <= 1} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-zinc-400">Page {page} of {totalPages}</span>
          <button onClick={() => loadLogs(page + 1)} disabled={page >= totalPages} className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS ====================
// ==================== RADIO / DJ MANAGEMENT ====================
function RadioTab() {
  const [managers, setManagers] = useState<any[]>([]);
  const [djs, setDjs] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState("dj");
  const [showName, setShowName] = useState("");
  const [goLiveDjId, setGoLiveDjId] = useState("");

  const loadData = useCallback(async () => {
    try {
      const data = await apiGet("/api/radio/djs");
      setManagers(data.managers);
      setDjs(data.djs);
      setCurrentStatus(data.current_status);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addDJ = async () => {
    if (!addUserId) return;
    try {
      const res = await apiPost("/api/radio/add-dj", { user_id: parseInt(addUserId), role: addRole });
      setMessage(res.message || "DJ added!");
      setAddUserId("");
      loadData();
    } catch (e: any) { setMessage(e.message || "Failed"); }
    setTimeout(() => setMessage(""), 3000);
  };

  const removeDJ = async (userId: number) => {
    try {
      const res = await apiPost("/api/radio/remove-dj", { user_id: userId });
      setMessage(res.message || "DJ removed!");
      loadData();
    } catch (e: any) { setMessage(e.message || "Failed"); }
    setTimeout(() => setMessage(""), 3000);
  };

  const goLive = async () => {
    if (!goLiveDjId) return;
    try {
      const res = await apiPost("/api/radio/go-live", { dj_user_id: parseInt(goLiveDjId), show_name: showName });
      setMessage(res.message || "DJ is live!");
      setShowName("");
      loadData();
    } catch (e: any) { setMessage(e.message || "Failed"); }
    setTimeout(() => setMessage(""), 3000);
  };

  const goOffline = async () => {
    try {
      const res = await apiPost("/api/radio/go-offline", {});
      setMessage(res.message || "Radio offline");
      loadData();
    } catch (e: any) { setMessage(e.message || "Failed"); }
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Loading radio data...</div>;

  const allDJs = [...managers, ...djs];

  return (
    <div className="space-y-6">
      {message && (
        <div className={`px-4 py-2 rounded text-sm ${message.toLowerCase().includes("fail") || message.toLowerCase().includes("denied") ? "bg-red-900/50 text-red-300 border border-red-700" : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"}`}>
          {message}
        </div>
      )}

      {/* Current Status */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-sm">Radio Status</span>
          {currentStatus.is_live && (
            <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase animate-pulse">LIVE</span>
          )}
        </div>
        <div className="p-4">
          {currentStatus.is_live ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-white">Currently Live: <strong>DJ #{currentStatus.current_dj_id}</strong></span>
                {currentStatus.show_name && <span className="text-xs text-zinc-400">— {currentStatus.show_name}</span>}
              </div>
              <button onClick={goOffline} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium">
                Take Offline
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-zinc-600 rounded-full" />
              <span className="text-sm text-zinc-400">Radio is currently off air</span>
            </div>
          )}
        </div>
      </div>

      {/* Go Live Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="px-4 py-3 border-b border-zinc-800">
          <span className="font-semibold text-sm">Set DJ Live</span>
        </div>
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Select DJ</label>
            <select
              value={goLiveDjId}
              onChange={(e) => setGoLiveDjId(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white min-w-48"
            >
              <option value="">Choose a DJ...</option>
              {allDJs.filter(d => d.status === "active").map((d) => (
                <option key={d.user_id} value={d.user_id}>{d.username} ({d.role === "dj_manager" ? "Manager" : "DJ"})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Show Name (optional)</label>
            <input
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              placeholder="e.g. Evening Vibes"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white w-48"
            />
          </div>
          <button onClick={goLive} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm font-medium">
            Go Live
          </button>
        </div>
      </div>

      {/* DJ Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Managers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm">DJ Managers ({managers.length})</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {managers.length === 0 && <div className="px-4 py-6 text-center text-zinc-500 text-sm">No DJ Managers yet</div>}
            {managers.map((m) => (
              <div key={m.id} className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/50">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                  <HabboAvatar look={m.look} size="small" headOnly />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{m.username}</div>
                  <div className="text-xs text-amber-400">DJ Manager</div>
                </div>
                <span className={`w-2 h-2 rounded-full ${m.online ? "bg-emerald-500" : "bg-zinc-600"}`} />
                <button onClick={() => removeDJ(m.user_id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* DJs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400" />
            <span className="font-semibold text-sm">DJs ({djs.length})</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {djs.length === 0 && <div className="px-4 py-6 text-center text-zinc-500 text-sm">No DJs yet</div>}
            {djs.map((d) => (
              <div key={d.id} className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-800/50">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                  <HabboAvatar look={d.look} size="small" headOnly />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{d.username}</div>
                  <div className="text-xs text-rose-400">DJ</div>
                </div>
                <span className={`w-2 h-2 rounded-full ${d.online ? "bg-emerald-500" : "bg-zinc-600"}`} />
                <button onClick={() => removeDJ(d.user_id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add DJ */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="px-4 py-3 border-b border-zinc-800">
          <span className="font-semibold text-sm">Add DJ / DJ Manager</span>
        </div>
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">User ID</label>
            <input
              value={addUserId}
              onChange={(e) => setAddUserId(e.target.value)}
              placeholder="Enter user ID"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white w-36"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Role</label>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white"
            >
              <option value="dj">DJ</option>
              <option value="dj_manager">DJ Manager</option>
            </select>
          </div>
          <button onClick={addDJ} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [emuSettings, setEmuSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiGet("/api/housekeeping/settings").then((data) => {
      setSiteSettings(data.site_settings || {});
      setEmuSettings(data.emulator_settings || {});
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      await apiPut("/api/housekeeping/settings", { key, value });
      setMessage(`Setting "${key}" updated!`);
      setSiteSettings({ ...siteSettings, [key]: value });
      setTimeout(() => setMessage(""), 3000);
    } catch (e: any) {
      setMessage(e.message || "Failed to update");
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-400">Loading settings...</div>;

  return (
    <div className="space-y-6">
      {message && (
        <div className="px-4 py-2 rounded text-sm bg-emerald-900/50 text-emerald-300 border border-emerald-700">{message}</div>
      )}

      {/* Site Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-purple-400" /> Site Settings</h3>
        </div>
        <div className="divide-y divide-zinc-800">
          {Object.entries(siteSettings).map(([key, value]) => (
            <div key={key} className="px-4 py-3 flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-400 font-mono min-w-40">{key}</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <input
                  defaultValue={value}
                  onBlur={(e) => { if (e.target.value !== value) updateSetting(key, e.target.value); }}
                  className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white max-w-xs w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emulator Settings (read-only view) */}
      {Object.keys(emuSettings).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Emulator Settings (Read Only)</h3>
          </div>
          <div className="divide-y divide-zinc-800 max-h-96 overflow-y-auto">
            {Object.entries(emuSettings).map(([key, value]) => (
              <div key={key} className="px-4 py-2 flex items-center justify-between gap-4">
                <span className="text-xs text-zinc-500 font-mono">{key}</span>
                <span className="text-xs text-zinc-300 text-right max-w-xs truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN HOUSEKEEPING PAGE ====================
export function HousekeepingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRank, setUserRank] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/api/housekeeping/dashboard")
      .then((data) => {
        setUserRank(data.user.rank);
        setUserInfo(data.user);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || "Access denied");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-zinc-400 animate-pulse">Loading Housekeeping...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <Shield className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold text-red-400">Access Denied</h2>
        <p className="text-zinc-500 text-sm">{error}</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm">
          Go Home
        </button>
      </div>
    );
  }

  const visibleTabs = TABS.filter((t) => userRank >= t.minRank);

  return (
    <div className="flex gap-6 min-h-96">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden sticky top-4">
          {/* User Card */}
          <div className="p-4 bg-gradient-to-br from-purple-900/50 to-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              {userInfo?.look && (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                  <HabboAvatar look={userInfo.look} size="small" headOnly />
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-white">{userInfo?.username}</div>
                <div className="text-xs text-purple-300">{RANK_NAMES[userRank]}</div>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="py-2">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-600/20 text-purple-300 border-l-2 border-purple-500"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white border-l-2 border-transparent"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Housekeeping
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {visibleTabs.find((t) => t.id === activeTab)?.label} Panel
          </p>
        </div>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "users" && <UsersTab userRank={userRank} />}
        {activeTab === "bans" && <BansTab userRank={userRank} />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "rooms" && <RoomsTab />}
        {activeTab === "modlogs" && <ModLogsTab />}
        {activeTab === "radio" && <RadioTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
