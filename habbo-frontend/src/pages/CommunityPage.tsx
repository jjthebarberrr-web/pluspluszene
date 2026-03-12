import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, isLoggedIn } from "../api";
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
    } catch { /* ignore */ }
  };

  const handleCreatePost = async () => {
    setError("");
    if (newTitle.length < 3) { setError("Title must be at least 3 characters"); return; }
    if (newContent.length < 10) { setError("Content must be at least 10 characters"); return; }
    try {
      await apiPost("/api/community/posts", { title: newTitle, content: newContent, category: newCategory });
      setNewTitle(""); setNewContent(""); setShowNewPost(false); loadPosts();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to create post"); }
  };

  const handleLike = async (postId: number) => {
    if (!isLoggedIn()) return;
    try { await apiPost(`/api/community/posts/${postId}/like`, {}); loadPosts(); } catch { /* ignore */ }
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
          <Users className="w-6 h-6 text-sky-400" />Community
        </h1>
        {isLoggedIn() && (
          <button onClick={() => setShowNewPost(!showNewPost)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-sm font-bold rounded-lg transition-all">
            <PlusCircle className="w-4 h-4" />New Post
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {showNewPost && (
            <div className="rounded overflow-hidden">
              <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
                <Send className="w-4 h-4" />Create New Post
              </div>
              <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-3">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}
                <input placeholder="Post title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full h-11 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-zinc-600" />
                <textarea placeholder="Write your post content... (min 10 characters)" value={newContent} onChange={(e) => setNewContent(e.target.value)} className="w-full h-24 px-4 py-3 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-teal-500 transition-all placeholder:text-zinc-600 resize-none" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">Category:</span>
                  {categories.filter(c => c.key !== "all").map((cat) => (
                    <button key={cat.key} onClick={() => setNewCategory(cat.key)} className={`px-3 py-1 text-xs rounded-lg border transition-all ${newCategory === cat.key ? categoryColors[cat.key] || "bg-zinc-700 text-zinc-300" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600"}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowNewPost(false)} className="px-4 py-2 text-sm text-zinc-400 border border-zinc-700 rounded-lg hover:border-zinc-600 transition-all">Cancel</button>
                  <button onClick={handleCreatePost} className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-bold rounded-lg transition-all">Post</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button key={cat.key} onClick={() => { setActiveTab(cat.key); setPage(1); }} className={`px-4 py-2 text-sm rounded whitespace-nowrap transition-all ${activeTab === cat.key ? "bg-emerald-700 text-white font-semibold" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"}`}>
                {cat.label}
              </button>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="bg-zinc-900 p-4 border border-zinc-800 rounded hover:border-zinc-700 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 hidden sm:block">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
                        <MessageSquare className="w-5 h-5 text-zinc-500" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link to={`/community/post/${post.id}`} className="font-semibold text-zinc-100 hover:text-sky-400 transition-colors"><h3 className="inline">{post.title}</h3></Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Link to={`/user/${post.username}`} className="text-xs text-sky-400 font-medium hover:text-sky-300">{post.username}</Link>
                            <span className="text-xs text-zinc-600">&bull;</span>
                            <span className="text-xs text-zinc-500">{formatTime(post.created_at)}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded border ${categoryColors[post.category] || categoryColors.general}`}>{post.category}</span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-2 line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                          <Heart className="w-3.5 h-3.5" />{post.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 text-sm border border-zinc-700 text-zinc-400 rounded-lg hover:border-zinc-600 disabled:opacity-40 transition-all">Previous</button>
                  <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 text-sm border border-zinc-700 text-zinc-400 rounded-lg hover:border-zinc-600 disabled:opacity-40 transition-all">Next</button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-900 p-8 border border-zinc-800 rounded text-center">
              <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-zinc-400">No posts yet</h3>
              <p className="text-sm text-zinc-500 mt-1">Be the first to start a discussion!</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />Stats
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Total Members</span><span className="text-sm font-semibold text-zinc-200">{stats?.total_users || 0}</span></div>
              <div className="border-t border-zinc-800"></div>
              <div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Online Now</span><span className="text-sm font-semibold text-emerald-400">{stats?.online_users || 0}</span></div>
              <div className="border-t border-zinc-800"></div>
              <div className="flex items-center justify-between"><span className="text-sm text-zinc-400">Total Posts</span><span className="text-sm font-semibold text-zinc-200">{stats?.total_posts || 0}</span></div>
            </div>
          </div>

          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4" />New Members
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-3">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
