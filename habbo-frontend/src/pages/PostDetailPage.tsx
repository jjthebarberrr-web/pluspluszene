import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet, apiPost, isLoggedIn } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { MessageSquare, Heart, ArrowLeft, Send, AlertCircle, Clock } from "lucide-react";

interface Comment {
  id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: number;
  look: string;
}

interface PostDetail {
  id: number;
  user_id: number;
  username: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  created_at: number;
  look: string;
  comments: Comment[];
}

const categoryColors: Record<string, string> = {
  general: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  trading: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  events: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  help: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  offtopic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPost = async () => {
    if (!postId) return;
    try {
      const data = await apiGet(`/api/community/posts/${postId}`);
      setPost(data);
    } catch {
      setError("Post not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPost(); }, [postId]);

  const formatTime = (ts: number) => {
    if (!ts) return "";
    const now = Math.floor(Date.now() / 1000);
    const diff = now - ts;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleLike = async () => {
    if (!isLoggedIn() || !post) return;
    try {
      await apiPost(`/api/community/posts/${post.id}/like`, {});
      loadPost();
    } catch { /* ignore */ }
  };

  const handleComment = async () => {
    if (!post) return;
    setCommentError("");
    if (comment.trim().length < 2) { setCommentError("Comment must be at least 2 characters"); return; }
    setSubmitting(true);
    try {
      await apiPost(`/api/community/posts/${post.id}/comment`, { content: comment.trim() });
      setComment("");
      loadPost();
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-zinc-500">Loading...</div>;
  if (error || !post) {
    return (
      <div className="text-center py-16">
        <MessageSquare className="w-16 h-16 mx-auto text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-zinc-400 mb-2">Post Not Found</h2>
        <Link to="/community" className="inline-block mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition-all">
          Back to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Link */}
      <Link to="/community" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />Back to Community
      </Link>

      {/* Post */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {post.title}
        </div>
        <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
          <div className="flex items-start gap-4">
            {/* Author Avatar */}
            <div className="shrink-0 hidden sm:block">
              <Link to={`/user/${post.username}`}>
                <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-700 overflow-hidden">
                  <HabboAvatar look={post.look} size="large" />
                </div>
              </Link>
              <div className="text-center mt-1">
                <Link to={`/user/${post.username}`} className="text-xs text-sky-400 font-semibold hover:text-sky-300">{post.username}</Link>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3 sm:hidden">
                <Link to={`/user/${post.username}`} className="text-sm text-sky-400 font-semibold">{post.username}</Link>
                <span className="text-xs text-zinc-600">&bull;</span>
                <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(post.created_at)}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded border ${categoryColors[post.category] || categoryColors.general}`}>{post.category}</span>
                <span className="text-xs text-zinc-500 hidden sm:flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(post.created_at)}</span>
              </div>

              <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{post.content}</div>

              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800">
                <button onClick={handleLike} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors">
                  <Heart className="w-4 h-4" />{post.likes} {post.likes === 1 ? "like" : "likes"}
                </button>
                <span className="text-xs text-zinc-600">{post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-2.5 text-white font-bold text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments ({post.comments.length})
        </div>
        <div className="bg-zinc-900 border border-zinc-800 border-t-0">
          {/* Add Comment */}
          {isLoggedIn() ? (
            <div className="p-4 border-b border-zinc-800">
              {commentError && (
                <div className="flex items-center gap-2 p-2 mb-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{commentError}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={500}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                  className="flex-1 h-10 px-4 bg-black/60 border border-zinc-700 rounded-lg text-white text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-600"
                />
                <button
                  onClick={handleComment}
                  disabled={submitting}
                  className="px-4 h-10 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 text-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />{submitting ? "..." : "Post"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-zinc-800 text-center">
              <p className="text-sm text-zinc-500">
                <Link to="/login" className="text-sky-400 hover:text-sky-300">Log in</Link> to leave a comment
              </p>
            </div>
          )}

          {/* Comment List */}
          {post.comments.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {post.comments.map((c) => (
                <div key={c.id} className="p-4 hover:bg-zinc-800/30 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      <Link to={`/user/${c.username}`}>
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 overflow-hidden">
                          <HabboAvatar look={c.look} size="small" />
                        </div>
                      </Link>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/user/${c.username}`} className="text-sm text-sky-400 font-semibold hover:text-sky-300">{c.username}</Link>
                        <span className="text-xs text-zinc-600">&bull;</span>
                        <span className="text-xs text-zinc-500">{formatTime(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-zinc-300">{c.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500">No comments yet. Be the first to reply!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
