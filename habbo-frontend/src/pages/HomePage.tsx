import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, isLoggedIn } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HabboAvatar } from "../components/HabboAvatar";
import { Users, Newspaper, Star, ArrowRight, Gamepad2, Shield, Sparkles, Trophy } from "lucide-react";

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: number;
}

interface Stats {
  total_users: number;
  online_users: number;
  total_posts: number;
  recent_users: { id: number; username: string; look: string; motto: string }[];
}

export function HomePage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiGet("/api/news/latest").then((d) => setNews(d.articles)).catch(() => {});
    apiGet("/api/community/stats").then((d) => setStats(d)).catch(() => {});
  }, []);

  const categoryColors: Record<string, string> = {
    announcement: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    event: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    update: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    general: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-400 p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M0%200h40v40H0z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M0%200h20v20H0zM20%2020h20v20H20z%22%20fill%3D%22rgba(255%2C255%2C255%2C0.05)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Welcome to <span className="text-yellow-300">HabboRetro</span>
            </h1>
            <p className="text-lg text-sky-100 mb-6 max-w-lg">
              The ultimate Habbo retro experience powered by Nitro HTML5 client and Arcturus Morningstar. Create your avatar, build your rooms, and join an amazing community!
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {!isLoggedIn() ? (
                <>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-lg shadow-sky-700/30"
                  >
                    <Sparkles className="w-5 h-5" />
                    Join Now - It's Free!
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  to="/client"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-sky-600 font-bold rounded-xl hover:bg-sky-50 transition-all shadow-lg shadow-sky-700/30"
                >
                  <Gamepad2 className="w-5 h-5" />
                  Enter Hotel
                </Link>
              )}
            </div>
          </div>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <Users className="w-6 h-6 text-white mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats?.total_users || 0}</div>
              <div className="text-xs text-sky-200">Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <div className="w-6 h-6 mx-auto mb-1 flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold text-white">{stats?.online_users || 0}</div>
              <div className="text-xs text-sky-200">Online</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
              <Star className="w-6 h-6 text-yellow-300 mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{stats?.total_posts || 0}</div>
              <div className="text-xs text-sky-200">Posts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800 hover:border-sky-500/50 transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Gamepad2 className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="font-bold text-zinc-100 mb-1">Nitro HTML5 Client</h3>
            <p className="text-sm text-zinc-400">Play directly in your browser with the modern Nitro HTML5 client. No downloads needed!</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 hover:border-emerald-500/50 transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-bold text-zinc-100 mb-1">Arcturus Morningstar</h3>
            <p className="text-sm text-zinc-400">Powered by the most stable and feature-rich Habbo emulator available.</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-500/50 transition-all">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-bold text-zinc-100 mb-1">Amazing Community</h3>
            <p className="text-sm text-zinc-400">Join thousands of players. Participate in events, trade rares, and make friends!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-sky-400" />
              Latest News
            </h2>
            <Link to="/news" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {news.map((article) => (
            <Card key={article.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-bold text-zinc-100">{article.title}</h3>
                  <Badge variant="outline" className={`shrink-0 text-xs ${categoryColors[article.category] || categoryColors.general}`}>
                    {article.category}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{article.content}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>By {article.author}</span>
                  <span>{formatTime(article.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Members */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                New Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.recent_users && stats.recent_users.length > 0 ? (
                stats.recent_users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <HabboAvatar look={user.look} size="small" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">{user.username}</div>
                      <div className="text-xs text-zinc-500 truncate max-w-36">{user.motto}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No members yet. Be the first to join!</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-100">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/community" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-sky-400 transition-colors">
                <ArrowRight className="w-3 h-3" /> Community Forum
              </Link>
              <Link to="/news" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-sky-400 transition-colors">
                <ArrowRight className="w-3 h-3" /> All News
              </Link>
              {!isLoggedIn() && (
                <Link to="/register" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-sky-400 transition-colors">
                  <ArrowRight className="w-3 h-3" /> Create Account
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
