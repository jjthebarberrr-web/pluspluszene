import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, isLoggedIn } from "../api";
import { Loader2, AlertCircle, Users, UserPlus, Minus, Plus, GripHorizontal } from "lucide-react";
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
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 12, y: 12 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

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

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 40, e.clientY - dragOffset.current.y)),
      });
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
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
    <div className="fixed inset-0 z-50 bg-black">
      {/* Draggable Floating Widget */}
      <div
        ref={widgetRef}
        className="absolute z-[60] rounded-lg select-none"
        style={{
          left: position.x,
          top: position.y,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.12)',
          transition: dragging.current ? 'none' : 'box-shadow 0.2s',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Widget Header - drag handle + minimize */}
        <div
          className="flex items-center justify-between px-3 py-1.5 cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          style={{ borderBottom: minimized ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-1.5">
            <GripHorizontal className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Info</span>
          </div>
          <button
            onClick={() => setMinimized(!minimized)}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
            title={minimized ? "Expand" : "Minimize"}
          >
            {minimized ? (
              <Plus className="w-3 h-3 text-zinc-400" />
            ) : (
              <Minus className="w-3 h-3 text-zinc-400" />
            )}
          </button>
        </div>

        {/* Widget Content - collapsible */}
        {!minimized && (
          <div className="px-3 pb-2.5 pt-1.5 flex flex-col gap-2">
            {/* Online Count */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white">{onlineCount}</span>
              <span className="text-xs text-zinc-400">Online</span>
            </div>

            {/* Newest User */}
            {newestUser && (
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-zinc-400">Newest User:</span>
                <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ border: '2px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)' }}>
                  <HabboAvatar look={newestUser.look} size="small" headOnly={true} />
                </div>
                <span className="text-xs font-bold text-white">{newestUser.username}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Iframe - Full screen */}
      {clientUrl ? (
        <iframe
          src={clientUrl}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; microphone"
          title="HabPlus Hotel Client"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
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
