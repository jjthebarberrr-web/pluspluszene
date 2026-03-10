import { useState, useEffect } from "react";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";

interface LeaderboardUser {
  id: number;
  username: string;
  look: string;
  motto: string;
  credits: number;
  pixels: number;
  online: number;
  account_created: number;
}

interface AllBoards {
  richest: LeaderboardUser[];
  most_pixels: LeaderboardUser[];
  online_now: LeaderboardUser[];
  oldest: LeaderboardUser[];
}

const boardConfig: { key: keyof AllBoards; label: string; emoji: string; color: string; gradient: string; getValue: (u: LeaderboardUser) => string }[] = [
  { key: "richest", label: "Richest", emoji: "\u{1F4B0}", color: "#E8A820", gradient: "linear-gradient(135deg, #E8A820, #1a1a1a)", getValue: (u) => `${u.credits.toLocaleString()} credits` },
  { key: "most_pixels", label: "Most Pixels", emoji: "\u{2B50}", color: "#5CB565", gradient: "linear-gradient(135deg, #5CB565, #1a1a1a)", getValue: (u) => `${u.pixels.toLocaleString()} pixels` },
  { key: "online_now", label: "Online Now", emoji: "\u{1F7E2}", color: "#1e7295", gradient: "linear-gradient(135deg, #1e7295, #1a1a1a)", getValue: (u) => u.online ? "Online" : "Offline" },
  { key: "oldest", label: "Oldest Accounts", emoji: "\u{23F3}", color: "#5C229E", gradient: "linear-gradient(135deg, #5C229E, #1a1a1a)", getValue: (u) => { const d = new Date(u.account_created * 1000); return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } },
];

export function LeaderboardsPage() {
  const [boards, setBoards] = useState<AllBoards | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/api/leaderboards/all");
      setBoards(data);
    } catch {
      setBoards(null);
    } finally {
      setLoading(false);
    }
  };

  const getMedalStyle = (idx: number): React.CSSProperties => {
    if (idx === 0) return { background: "linear-gradient(135deg, #FFD700, #B8860B)", color: "#fff", fontWeight: "bold", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, border: "1px solid #FFD700", boxShadow: "0 0 6px rgba(255,215,0,0.4)" };
    if (idx === 1) return { background: "linear-gradient(135deg, #C0C0C0, #808080)", color: "#fff", fontWeight: "bold", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, border: "1px solid #C0C0C0" };
    if (idx === 2) return { background: "linear-gradient(135deg, #CD7F32, #8B4513)", color: "#fff", fontWeight: "bold", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, border: "1px solid #CD7F32" };
    return { background: "#222", color: "#666", fontWeight: "bold", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, border: "1px solid #333" };
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #5C229E", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #5C229E, #1a1a1a)",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
        border: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <span style={{ fontSize: "28px" }}>&#x1F3C6;</span>
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "bold", color: "#fff", margin: 0 }}>Leaderboards</h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>See who's on top of the hotel</p>
        </div>
      </div>

      {/* 4 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {boardConfig.map((cfg) => {
          const users = boards ? (boards[cfg.key] || []) : [];
          return (
            <div key={cfg.key} style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
              {/* Column Header */}
              <div style={{
                background: cfg.gradient,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid #333",
              }}>
                <span style={{ fontSize: "16px" }}>{cfg.emoji}</span>
                <span style={{ fontWeight: "bold", color: "#fff", fontSize: "13px", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{cfg.label}</span>
              </div>

              {/* User List */}
              <div style={{ padding: "0" }}>
                {users.length === 0 ? (
                  <div style={{ padding: "24px 12px", textAlign: "center", color: "#555", fontSize: "12px" }}>
                    No users yet
                  </div>
                ) : (
                  users.map((user, idx) => (
                    <div
                      key={user.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 10px",
                        borderBottom: idx < users.length - 1 ? "1px solid #222" : "none",
                        background: idx === 0 ? "rgba(255,215,0,0.05)" : idx === 1 ? "rgba(192,192,192,0.03)" : idx === 2 ? "rgba(205,127,50,0.03)" : "transparent",
                        transition: "background 0.15s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#222"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = idx === 0 ? "rgba(255,215,0,0.05)" : idx === 1 ? "rgba(192,192,192,0.03)" : idx === 2 ? "rgba(205,127,50,0.03)" : "transparent"; }}
                    >
                      {/* Medal/Rank */}
                      <div style={getMedalStyle(idx)}>
                        {idx + 1}
                      </div>

                      {/* Avatar */}
                      <div style={{ width: "32px", height: "32px", overflow: "hidden", borderRadius: "4px", background: "#111", border: "1px solid #333", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <HabboAvatar look={user.look} size="small" direction={2} />
                      </div>

                      {/* Name + Value */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#ddd", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{user.username}</div>
                        <div style={{ fontSize: "10px", color: cfg.color, fontWeight: "500" }}>{cfg.getValue(user)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
