import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, isLoggedIn } from "../api";
import { Loader2, AlertCircle, Users, UserPlus } from "lucide-react";
import { HabboAvatar } from "@/components/HabboAvatar";

const NITRO_CLIENT_URL = import.meta.env.VITE_NITRO_URL || "";

interface NewestUser {
  id: number;
  username: string;
  look: string;
}

export function ClientPage() {
  const navigate = useNavigate();
  const [ssoTicket, setSsoTicket] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [newestUser, setNewestUser] = useState<NewestUser | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    generateSSO();
  }, [navigate]);

  // Fetch online count + newest user
  useEffect(() => {
    const fetchData = () => {
      apiGet("/api/home").then((data) => {
        if (data.online_count !== undefined) setOnlineCount(data.online_count);
        if (data.newest_user) setNewestUser(data.newest_user);
      }).catch(() => {});
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateSSO = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet("/api/auth/sso");
      setSsoTicket(data.sso_ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate SSO ticket");
    } finally {
      setLoading(false);
    }
  };

  const clientUrl = NITRO_CLIENT_URL
    ? `${NITRO_CLIENT_URL}?sso=${encodeURIComponent(ssoTicket)}`
    : "";

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-sky-400 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-400 text-lg">Entering hotel...</p>
          <p className="text-zinc-500 text-sm mt-1">Preparing your session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Connection Error</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button onClick={generateSSO} className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Slim Info Bar */}
      <div className="flex items-center justify-between px-4 h-9 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Left: Online Users */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-emerald-300">{onlineCount}</span>
            <span className="text-xs text-zinc-500">online</span>
          </div>
        </div>

        {/* Right: Newest Member */}
        {newestUser && (
          <div className="flex items-center gap-2">
            <UserPlus className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-zinc-500">Newest:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center" style={{ border: '1.5px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.05)' }}>
                <HabboAvatar look={newestUser.look} size="small" headOnly={true} />
              </div>
              <span className="text-xs font-bold text-white">{newestUser.username}</span>
            </div>
          </div>
        )}
      </div>

      {/* Client Iframe - Takes up all remaining space */}
      {clientUrl ? (
        <iframe
          src={clientUrl}
          className="w-full flex-1 border-0"
          allow="autoplay; fullscreen; microphone"
          title="HabPlus Hotel Client"
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-8 max-w-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-sky-500/30">
              <Loader2 className="w-10 h-10 text-sky-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">Nitro Client Not Configured</h2>
            <p className="text-zinc-400 text-sm">
              Set the <code className="text-amber-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">VITE_NITRO_URL</code> environment variable to your Nitro client URL.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
