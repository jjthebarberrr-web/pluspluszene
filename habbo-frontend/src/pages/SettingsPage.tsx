import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut, isLoggedIn } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Settings, Lock, Mail, User, Check } from "lucide-react";

const rankLabels: Record<number, string> = {
  1: "Member", 2: "Bronze VIP", 3: "Silver VIP", 4: "Gold VIP", 5: "Platinum VIP",
  6: "Trial Mod", 7: "Moderator", 8: "Senior Mod", 9: "Head Mod", 10: "Trial Admin",
  11: "Administrator", 12: "Head Admin", 13: "Manager", 14: "Developer", 15: "President", 16: "Owner",
};

interface Profile {
  id: number;
  username: string;
  mail: string;
  motto: string;
  look: string;
  rank: number;
  gender: string;
  account_created: number;
  last_online: number;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Motto
  const [motto, setMotto] = useState("");
  const [mottoMsg, setMottoMsg] = useState("");

  // Email
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) { navigate("/login"); return; }
    apiGet("/api/auth/me")
      .then((data) => {
        setProfile(data);
        setMotto(data.motto);
        setEmail(data.mail);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  const formatDate = (ts: number) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const saveMotto = async () => {
    try {
      await apiPut("/api/auth/me/motto", { motto });
      setMottoMsg("Motto updated!");
      if (profile) setProfile({ ...profile, motto });
      setTimeout(() => setMottoMsg(""), 3000);
    } catch (err) {
      setMottoMsg(err instanceof Error ? err.message : "Failed to update motto");
    }
  };

  const saveEmail = async () => {
    try {
      await apiPut("/api/auth/me/email", { email });
      setEmailMsg("Email updated!");
      if (profile) setProfile({ ...profile, mail: email });
      setTimeout(() => setEmailMsg(""), 3000);
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : "Failed to update email");
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Passwords do not match");
      return;
    }
    try {
      await apiPut("/api/auth/me/password", { current_password: currentPassword, new_password: newPassword });
      setPasswordMsg("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMsg(""), 3000);
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Failed to change password");
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Account Settings
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 overflow-hidden">
              <HabboAvatar look={profile.look} size="large" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.username}</h2>
              <p className="text-sm text-zinc-400 italic">&quot;{profile.motto}&quot;</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-purple-900/40 text-purple-300 border border-purple-800/50">
                {rankLabels[profile.rank] || "Member"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Info */}
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Information
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0 space-y-3">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Username</span>
              <span className="text-sm text-white font-semibold">{profile.username}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">User ID</span>
              <span className="text-sm text-zinc-300">#{profile.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Gender</span>
              <span className="text-sm text-zinc-300">{profile.gender === "M" ? "Male" : "Female"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Rank</span>
              <span className="text-sm text-purple-300">{rankLabels[profile.rank] || "Member"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-sm text-zinc-400">Joined</span>
              <span className="text-sm text-zinc-300">{formatDate(profile.account_created)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-zinc-400">Last Online</span>
              <span className="text-sm text-zinc-300">{formatDate(profile.last_online)}</span>
            </div>
          </div>
        </div>

        {/* Change Motto */}
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm">
            Change Motto
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0 space-y-3">
            <input
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              maxLength={50}
              placeholder="Enter your new motto..."
              className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-zinc-600"
            />
            <div className="flex items-center gap-3">
              <button onClick={saveMotto} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-md transition-all text-sm">
                Save Motto
              </button>
              {mottoMsg && <span className="text-sm text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" />{mottoMsg}</span>}
            </div>
          </div>
        </div>

        {/* Change Email */}
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Change Email
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0 space-y-3">
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter new email..."
              className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-amber-500 transition-all placeholder:text-zinc-600"
            />
            <div className="flex items-center gap-3">
              <button onClick={saveEmail} className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-md transition-all text-sm">
                Update Email
              </button>
              {emailMsg && <span className="text-sm text-amber-400">{emailMsg}</span>}
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded overflow-hidden">
          <div className="bg-gradient-to-r from-red-800 to-red-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Change Password
          </div>
          <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0 space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-red-500 transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-red-500 transition-all placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-red-500 transition-all placeholder:text-zinc-600"
              />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={changePassword} className="px-5 py-2.5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-bold rounded-md transition-all text-sm">
                Change Password
              </button>
              {passwordMsg && <span className={`text-sm ${passwordMsg.includes("success") ? "text-emerald-400" : "text-red-400"}`}>{passwordMsg}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
