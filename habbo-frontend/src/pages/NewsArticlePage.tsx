import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiGet, apiPost, isLoggedIn } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";
import { ArrowLeft, Calendar, User, MessageSquare, Send } from "lucide-react";

interface Article {
  id: number;
  title: string;
  content: string;
  image_url: string;
  author: string;
  category: string;
  created_at: number;
  author_look: string;
  reactions: Record<string, number>;
  comment_count: number;
}

interface Comment {
  id: number;
  article_id: number;
  user_id: number;
  username: string;
  look: string;
  content: string;
  created_at: number;
}

export function NewsArticlePage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    apiGet(`/api/news/article/${articleId}`)
      .then((data) => {
        setArticle(data.article);
        setLoading(false);
      })
      .catch(() => {
        setError("Article not found");
        setLoading(false);
      });

    apiGet(`/api/news/${articleId}/comments`)
      .then((data) => setComments(data.comments || []))
      .catch(() => {});
  }, [articleId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !articleId) return;
    try {
      const data = await apiPost(`/api/news/${articleId}/comments`, { content: newComment.trim() });
      if (data.ok && data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      }
    } catch {
      // ignore
    }
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts * 1000);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (ts: number) => {
    const diff = Math.floor(Date.now() / 1000) - ts;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return formatDate(ts);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-zinc-400">Article Not Found</h2>
        <p className="text-zinc-500 mt-2">This article doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/news")} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-all">
          Back to News
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <button onClick={() => navigate("/news")} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to News
      </button>

      {/* Article */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        {article.image_url && (
          <div className="w-full h-48 bg-zinc-800 overflow-hidden">
            <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded font-medium uppercase">{article.category}</span>
            <span className="flex items-center gap-1 text-xs text-zinc-500"><Calendar className="w-3 h-3" />{formatDate(article.created_at)}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">{article.title}</h1>
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-zinc-800">
            {article.author_look && (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <HabboAvatar look={article.author_look} size="small" headOnly={true} />
              </div>
            )}
            <div>
              <Link to={`/user/${article.author}`} className="text-sm font-bold text-zinc-300 hover:text-white transition-all">{article.author}</Link>
              <div className="text-xs text-zinc-500">Author</div>
            </div>
          </div>
          <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-zinc-500" />
          <span className="text-sm font-bold text-zinc-300">Comments ({comments.length})</span>
        </div>

        {isLoggedIn() && (
          <div className="px-6 py-4 border-b border-zinc-800">
            <div className="flex gap-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-purple-500 resize-none"
                rows={2}
              />
              <button
                onClick={handlePostComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all self-end"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-zinc-800">
          {comments.length === 0 ? (
            <div className="px-6 py-8 text-center text-zinc-500 text-sm">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    {c.look ? <HabboAvatar look={c.look} size="small" headOnly={true} /> : <User className="w-4 h-4 text-zinc-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/user/${c.username}`} className="text-sm font-bold text-zinc-300 hover:text-white">{c.username}</Link>
                      <span className="text-xs text-zinc-600">{formatTime(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{c.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
