import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, isLoggedIn } from "../api";
import { Button } from "@/components/ui/button";
import { Gamepad2, Loader2, RefreshCw, Maximize, Minimize, AlertCircle } from "lucide-react";

const NITRO_CLIENT_URL = import.meta.env.VITE_NITRO_URL || "";

export function ClientPage() {
  const navigate = useNavigate();
  const [ssoTicket, setSsoTicket] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    generateSSO();
  }, [navigate]);

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
      <div className="flex items-center justify-center min-h-[80vh]">
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Connection Error</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <Button onClick={generateSSO} className="bg-sky-500 hover:bg-sky-600 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If Nitro URL is configured, show the embedded client
  if (clientUrl) {
    return (
      <div className={fullscreen ? "fixed inset-0 z-50 bg-black" : "space-y-0"}>
        {/* Client Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-white" />
            <span className="text-sm font-bold text-white">HabPlus Hotel</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-sky-100">Connected</span>
            </div>
            <button
              onClick={generateSSO}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Refresh SSO"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {fullscreen ? (
                <Minimize className="w-4 h-4 text-white" />
              ) : (
                <Maximize className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Nitro Client Iframe */}
        <iframe
          src={clientUrl}
          className="w-full border-0"
          style={{ height: fullscreen ? "calc(100vh - 40px)" : "calc(100vh - 140px)" }}
          allow="autoplay; fullscreen; microphone"
          title="HabPlus Hotel Client"
        />
      </div>
    );
  }

  // No Nitro URL configured - show the "Enter Hotel" setup page
  return (
    <div className={fullscreen ? "fixed inset-0 z-50 bg-black" : "space-y-0"}>
      {/* Client Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-sky-600 to-cyan-500 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold text-white">HabPlus Hotel</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-sky-100">SSO Ready</span>
          </div>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            {fullscreen ? (
              <Minimize className="w-4 h-4 text-white" />
            ) : (
              <Maximize className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Client Area */}
      <div
        className="bg-zinc-950 border-x border-b border-zinc-800 rounded-b-2xl flex items-center justify-center"
        style={{ minHeight: fullscreen ? "calc(100vh - 40px)" : "calc(100vh - 180px)" }}
      >
        <div className="text-center px-8 max-w-2xl">
          <div className="w-28 h-28 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-sky-500/30">
            <Gamepad2 className="w-14 h-14 text-sky-400" />
          </div>

          <h2 className="text-3xl font-bold text-zinc-100 mb-3">Enter Hotel</h2>
          <p className="text-zinc-400 mb-8 text-lg">
            Your SSO ticket is ready. Connect the Nitro HTML5 client to start playing!
          </p>

          {/* SSO Ticket Display */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 mb-8">
            <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">Your SSO Ticket</div>
            <div className="font-mono text-sm text-sky-400 break-all bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
              {ssoTicket}
            </div>
            <Button
              onClick={generateSSO}
              variant="outline"
              size="sm"
              className="mt-3 border-zinc-700 text-zinc-400 hover:text-zinc-200"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Ticket
            </Button>
          </div>

          {/* How to Connect */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-left">
            <h3 className="font-bold text-zinc-200 mb-4 text-lg">How to Connect the Nitro Client</h3>
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center font-bold text-xs">1</span>
                <p>Build the <a href="https://git.krews.org/niclas/nitro" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-medium">Nitro HTML5 Client</a> and host the built files on a URL</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center font-bold text-xs">2</span>
                <p>Set up <a href="https://git.krews.org/morningstar/Arcturus-Community" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-medium">Arcturus Morningstar</a> emulator and configure the WebSocket connection</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center font-bold text-xs">3</span>
                <p>Set the <code className="text-amber-400 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">VITE_NITRO_URL</code> environment variable to your hosted Nitro client URL</p>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex-shrink-0 w-7 h-7 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center font-bold text-xs">4</span>
                <p>Rebuild the frontend and the Nitro client will automatically embed here with SSO authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
