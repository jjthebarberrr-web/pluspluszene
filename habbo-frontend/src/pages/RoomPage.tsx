import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { Home, Users, Star, Lock, Eye, EyeOff, Package, User } from "lucide-react";

interface RoomInfo {
  id: number;
  owner_id: number;
  owner_name: string;
  name: string;
  description: string;
  model: string;
  state: string;
  users: number;
  users_max: number;
  score: number;
  tags: string;
  is_public: string;
  is_staff_picked: string;
  owner_look: string;
  items_count: number;
}

const stateIcons: Record<string, { icon: typeof Lock; label: string; color: string }> = {
  open: { icon: Eye, label: "Open", color: "text-emerald-400" },
  locked: { icon: Lock, label: "Locked", color: "text-amber-400" },
  password: { icon: Lock, label: "Password", color: "text-red-400" },
  invisible: { icon: EyeOff, label: "Invisible", color: "text-zinc-500" },
};

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    apiGet(`/api/rooms/${roomId}`)
      .then((data) => setRoom(data))
      .catch(() => setError("Room not found"))
      .finally(() => setLoading(false));
  }, [roomId]);

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading room...</div>;
  if (error || !room) {
    return (
      <div className="text-center py-16">
        <Home className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-zinc-400 mb-2">Room Not Found</h2>
        <p className="text-sm text-zinc-500">Room #{roomId} does not exist.</p>
        <Link to="/" className="inline-block mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  const stateInfo = stateIcons[room.state] || stateIcons.open;
  const StateIcon = stateInfo.icon;
  const tags = room.tags ? room.tags.split(";").filter(Boolean) : [];

  return (
    <div className="space-y-4">
      {/* Room Header */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <Home className="w-4 h-4" />
          Room Preview
        </div>
        <div className="bg-zinc-900 p-6 border border-zinc-800 border-t-0">
          <div className="flex items-start gap-6">
            {/* Room Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl flex items-center justify-center border-2 border-emerald-700/30">
              <Home className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{room.name}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded border border-zinc-700 ${stateInfo.color}`}>
                  <StateIcon className="w-3 h-3" />
                  {stateInfo.label}
                </span>
                {room.is_staff_picked === "1" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-yellow-900/40 text-yellow-300 border border-yellow-700/50">
                    <Star className="w-3 h-3" /> Staff Pick
                  </span>
                )}
              </div>

              {room.description && (
                <p className="text-sm text-zinc-400 mb-3">{room.description}</p>
              )}

              {/* Owner */}
              <Link to={`/user/${room.owner_name}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-all mb-3">
                <div className="w-7 h-7 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 flex items-center justify-center">
                  {room.owner_look ? (
                    <HabboAvatar look={room.owner_look} size="small" headOnly={true} />
                  ) : (
                    <User className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <span>Owned by <span className="text-white font-medium">{room.owner_name}</span></span>
              </Link>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded overflow-hidden">
          <div className="bg-zinc-900 p-5 border border-zinc-800 text-center">
            <Users className="w-6 h-6 mx-auto text-emerald-400 mb-2" />
            <div className="text-2xl font-bold text-white">{room.users}/{room.users_max}</div>
            <div className="text-xs text-zinc-500 mt-1">Players</div>
          </div>
        </div>
        <div className="rounded overflow-hidden">
          <div className="bg-zinc-900 p-5 border border-zinc-800 text-center">
            <Star className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">+{room.score}</div>
            <div className="text-xs text-zinc-500 mt-1">Score</div>
          </div>
        </div>
        <div className="rounded overflow-hidden">
          <div className="bg-zinc-900 p-5 border border-zinc-800 text-center">
            <Package className="w-6 h-6 mx-auto text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">{room.items_count}</div>
            <div className="text-xs text-zinc-500 mt-1">Furni Items</div>
          </div>
        </div>
        <div className="rounded overflow-hidden">
          <div className="bg-zinc-900 p-5 border border-zinc-800 text-center">
            <Home className="w-6 h-6 mx-auto text-sky-400 mb-2" />
            <div className="text-2xl font-bold text-white capitalize">{room.model}</div>
            <div className="text-xs text-zinc-500 mt-1">Room Model</div>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm">
          Room Details
        </div>
        <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Room ID</span>
              <span className="text-sm text-zinc-300">#{room.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Owner</span>
              <Link to={`/user/${room.owner_name}`} className="text-sm text-teal-400 hover:text-teal-300">{room.owner_name}</Link>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Access</span>
              <span className={`text-sm ${stateInfo.color}`}>{stateInfo.label}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Capacity</span>
              <span className="text-sm text-zinc-300">{room.users_max} max</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Public</span>
              <span className="text-sm text-zinc-300">{room.is_public === "1" ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800/50">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Staff Picked</span>
              <span className="text-sm text-zinc-300">{room.is_staff_picked === "1" ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
