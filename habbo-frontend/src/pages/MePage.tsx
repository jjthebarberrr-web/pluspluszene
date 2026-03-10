import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut, isLoggedIn } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HabboAvatar } from "../components/HabboAvatar";
import { User, Coins, Diamond, Sparkles, Calendar, Clock, Edit3, Check, Shield, Award } from "lucide-react";

interface UserProfile {
  id: number;
  username: string;
  mail: string;
  motto: string;
  look: string;
  credits: number;
  pixels: number;
  diamonds: number;
  rank: number;
  online: number;
  gender: string;
  account_created: number;
  last_login: number;
  last_online: number;
  home_room: number;
  badges: { badge_code: string; slot: number }[];
}

export function MePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingMotto, setEditingMotto] = useState(false);
  const [mottoValue, setMottoValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      const data = await apiGet("/api/auth/me");
      setProfile(data);
      setMottoValue(data.motto);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const saveMotto = async () => {
    try {
      await apiPut("/api/auth/me/motto", { motto: mottoValue });
      setEditingMotto(false);
      if (profile) {
        setProfile({ ...profile, motto: mottoValue });
      }
    } catch {
      // ignore
    }
  };

  const formatDate = (ts: number) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const rankLabels: Record<number, { label: string; color: string }> = {
    1: { label: "Member", color: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
    2: { label: "VIP", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    3: { label: "Moderator", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    4: { label: "Senior Mod", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
    5: { label: "Admin", color: "bg-red-500/20 text-red-400 border-red-500/30" },
    6: { label: "Owner", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-zinc-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const rank = rankLabels[profile.rank] || rankLabels[1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
        <User className="w-6 h-6 text-sky-400" />
        My Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-zinc-700 overflow-hidden">
                <HabboAvatar look={profile.look} size="large" />
              </div>
              {profile.online ? (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900"></div>
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-zinc-100">{profile.username}</h2>
            <Badge variant="outline" className={`mt-2 ${rank.color}`}>
              <Shield className="w-3 h-3 mr-1" />
              {rank.label}
            </Badge>

            <Separator className="my-4 bg-zinc-800" />

            {/* Motto */}
            <div className="text-left">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Motto</span>
                <button
                  onClick={() => {
                    if (editingMotto) {
                      saveMotto();
                    } else {
                      setEditingMotto(true);
                    }
                  }}
                  className="text-sky-400 hover:text-sky-300"
                >
                  {editingMotto ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </button>
              </div>
              {editingMotto ? (
                <Input
                  value={mottoValue}
                  onChange={(e) => setMottoValue(e.target.value)}
                  maxLength={50}
                  onKeyDown={(e) => e.key === "Enter" && saveMotto()}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm"
                  autoFocus
                />
              ) : (
                <p className="text-sm text-zinc-300 italic">"{profile.motto}"</p>
              )}
            </div>

            <Separator className="my-4 bg-zinc-800" />

            {/* Info */}
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">Joined:</span>
                <span className="text-zinc-300">{formatDate(profile.account_created)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-400">Last seen:</span>
                <span className="text-zinc-300">{formatDate(profile.last_online)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Currency */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-zinc-100">{profile.credits.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Credits</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-zinc-100">{profile.pixels.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Pixels</div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4 text-center">
                <Diamond className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-zinc-100">{profile.diamonds.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">Diamonds</div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                My Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.badges.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profile.badges.map((badge, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 hover:border-sky-500/50 transition-all"
                      title={badge.badge_code}
                    >
                      <img
                        src={`https://images.habbo.com/c_images/album1584/${badge.badge_code}.gif`}
                        alt={badge.badge_code}
                        className="w-8 h-8"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No badges yet. Start collecting!</p>
              )}
            </CardContent>
          </Card>

          {/* Account Details */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-base text-zinc-100">Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Email</span>
                  <p className="text-sm text-zinc-300 mt-1">{profile.mail}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Gender</span>
                  <p className="text-sm text-zinc-300 mt-1">{profile.gender === "M" ? "Male" : "Female"}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">User ID</span>
                  <p className="text-sm text-zinc-300 mt-1">#{profile.id}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Home Room</span>
                  <p className="text-sm text-zinc-300 mt-1">{profile.home_room || "Not set"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enter Hotel Button */}
          <Button
            onClick={() => navigate("/client")}
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold py-6 text-lg rounded-xl"
          >
            Enter Hotel
          </Button>
        </div>
      </div>
    </div>
  );
}
