import { useEffect, useState } from "react";
import { apiGet, apiPost, isLoggedIn } from "../api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HabboAvatar } from "../components/HabboAvatar";
import { Users, MessageSquare, Heart, PlusCircle, Send, Trophy, TrendingUp, AlertCircle } from "lucide-react";

interface Post {
  id: number;
  user_id: number;
  username: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  created_at: number;
}

interface Stats {
  total_users: number;
  online_users: number;
  total_posts: number;
  recent_users: { id: number; username: string; look: string; motto: string }[];
}

export function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPosts();
    apiGet("/api/community/stats").then(setStats).catch(() => {});
  }, [activeTab, page]);

  const loadPosts = async () => {
    try {
      const data = await apiGet(`/api/community/posts?category=${activeTab}&page=${page}`);
      setPosts(data.posts);
      setTotalPages(data.pages);
    } catch {
      // ignore
    }
  };

  const handleCreatePost = async () => {
    setError("");
    if (newTitle.length < 3) {
      setError("Title must be at least 3 characters");
      return;
    }
    if (newContent.length < 10) {
      setError("Content must be at least 10 characters");
      return;
    }
    try {
      await apiPost("/api/community/posts", {
        title: newTitle,
        content: newContent,
        category: newCategory,
      });
      setNewTitle("");
      setNewContent("");
      setShowNewPost(false);
      loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  const handleLike = async (postId: number) => {
    if (!isLoggedIn()) return;
    try {
      await apiPost(`/api/community/posts/${postId}/like`, {});
      loadPosts();
    } catch {
      // ignore
    }
  };

  const formatTime = (ts: number) => {
    if (!ts) return "";
    const now = Math.floor(Date.now() / 1000);
    const diff = now - ts;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const categories = [
    { key: "all", label: "All Posts" },
    { key: "general", label: "General" },
    { key: "trading", label: "Trading" },
    { key: "events", label: "Events" },
    { key: "help", label: "Help" },
    { key: "offtopic", label: "Off Topic" },
  ];

  const categoryColors: Record<string, string> = {
    general: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    trading: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    events: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    help: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    offtopic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Users className="w-6 h-6 text-sky-400" />
          Community
        </h1>
        {isLoggedIn() && (
          <Button
            onClick={() => setShowNewPost(!showNewPost)}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* New Post Form */}
          {showNewPost && (
            <Card className="bg-zinc-900 border-sky-500/30">
              <CardHeader>
                <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  Create New Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <Input
                  placeholder="Post title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
                <textarea
                  placeholder="Write your post content... (min 10 characters)"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none resize-none"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Category:</span>
                  {categories.filter(c => c.key !== "all").map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setNewCategory(cat.key)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                        newCategory === cat.key
                          ? categoryColors[cat.key] || "bg-zinc-700 text-zinc-300"
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewPost(false)} className="border-zinc-700 text-zinc-400 hover:text-zinc-200">
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} className="bg-sky-500 hover:bg-sky-600 text-white">
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setActiveTab(cat.key); setPage(1); }}
                className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
                  activeTab === cat.key
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold"
                    : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 hidden sm:block">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-zinc-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-zinc-100">{post.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-sky-400 font-medium">{post.username}</span>
                              <span className="text-xs text-zinc-600">&bull;</span>
                              <span className="text-xs text-zinc-500">{formatTime(post.created_at)}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={`shrink-0 text-xs ${categoryColors[post.category] || categoryColors.general}`}>
                            {post.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{post.content}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            {post.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="border-zinc-700 text-zinc-400"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-zinc-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="border-zinc-700 text-zinc-400"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-zinc-400">No posts yet</h3>
                <p className="text-sm text-zinc-500 mt-1">Be the first to start a discussion!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Community Stats */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Total Members</span>
                <span className="text-sm font-semibold text-zinc-200">{stats?.total_users || 0}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Online Now</span>
                <span className="text-sm font-semibold text-emerald-400">{stats?.online_users || 0}</span>
              </div>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Total Posts</span>
                <span className="text-sm font-semibold text-zinc-200">{stats?.total_posts || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* New Members */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
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
                      <div className="text-xs text-zinc-500 truncate max-w-28">{user.motto}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No members yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
