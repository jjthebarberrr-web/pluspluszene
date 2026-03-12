import { useState } from "react";
import { Link } from "react-router-dom";
import { apiPost } from "../api";
import { Lock, User, Mail, KeyRound, Check, AlertCircle } from "lucide-react";

export function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setSuccess("");

    if (!username.trim()) { setError("Username is required"); return; }
    if (!email.trim()) { setError("Email is required"); return; }
    if (newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const data = await apiPost("/api/auth/forgot-password", {
        username: username.trim(),
        email: email.trim(),
        new_password: newPassword,
      });
      setSuccess(data.message || "Password reset successfully!");
      setUsername("");
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4" />
          Reset Password
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0 space-y-5">
          <p className="text-sm text-zinc-400">
            Enter your username and the email address associated with your account. If they match, you can set a new password.
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
              <Check className="w-4 h-4 shrink-0" />{success}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full h-11 pl-10 pr-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-amber-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 pl-10 pr-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-amber-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full h-11 pl-10 pr-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-amber-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full h-11 pl-10 pr-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-amber-500 transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 text-sm"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-sky-400 hover:text-sky-300 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
