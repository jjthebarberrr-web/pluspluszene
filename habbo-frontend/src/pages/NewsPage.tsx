import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, isLoggedIn } from "../api";
import { HabboAvatar } from "../components/HabboAvatar";

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url: string;
  author: string;
  author_look: string;
  category: string;
  created_at: number;
  reactions?: Record<string, number>;
  comment_count?: number;
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

export function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadReactions = useCallback(async (articleId: number) => {
    try {
      const data = await apiGet(`/api/news/${articleId}/reactions`);
      setReactions(data.reactions || {});
      setUserReactions(data.user_reactions || []);
    } catch { /* ignore */ }
  }, []);

  const loadComments = useCallback(async (articleId: number) => {
    try {
      const data = await apiGet(`/api/news/${articleId}/comments`);
      setComments(data.comments || []);
    } catch { /* ignore */ }
  }, []);

  const loadNews = async () => {
    try {
      const data = await apiGet("/api/news/?category=all");
      setArticles(data.articles);
      if (data.articles.length > 0) {
        setSelectedArticle(data.articles[0]);
        loadReactions(data.articles[0].id);
        loadComments(data.articles[0].id);
      }
    } catch {
      // ignore
    }
  };

  const selectArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setComments([]);
    setReactions({});
    setUserReactions([]);
    loadReactions(article.id);
    loadComments(article.id);
  };

  const [reactionPopup, setReactionPopup] = useState("");

  const handleReaction = async (emoji: string) => {
    if (!selectedArticle || !isLoggedIn()) return;
    try {
      await apiPost(`/api/news/${selectedArticle.id}/reactions`, { emoji });
      loadReactions(selectedArticle.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already reacted")) {
        setReactionPopup("You already reacted! Click your current reaction to remove it first.");
        setTimeout(() => setReactionPopup(""), 3500);
      }
    }
  };

  const handlePostComment = async () => {
    if (!selectedArticle || !commentText.trim() || posting || !isLoggedIn()) return;
    setPosting(true);
    try {
      await apiPost(`/api/news/${selectedArticle.id}/comments`, { content: commentText.trim() });
      setCommentText("");
      loadComments(selectedArticle.id);
    } catch { /* ignore */ }
    setPosting(false);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts * 1000);
    const day = d.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? "st" : day === 2 || day === 22 ? "nd" : day === 3 || day === 23 ? "rd" : "th";
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  const categoryColors: Record<string, string> = {
    announcement: "#E27330",
    event: "#5CB565",
    update: "#1e7295",
    general: "#5C229E",
  };

  return (
    <div style={{ display: "flex", gap: "16px", maxWidth: "1100px", margin: "0 auto", fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Left Side - Main Article Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {selectedArticle ? (
          <article style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
            {/* Article Header */}
            <div style={{
              background: `linear-gradient(135deg, ${categoryColors[selectedArticle.category] || "#5C229E"}, #1a1a1a)`,
              padding: "12px 16px",
              fontWeight: "bold",
              color: "#fff",
              fontSize: "14px",
              textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              borderBottom: "1px solid #333",
            }}>
              {selectedArticle.title}
            </div>

            {/* Article Description */}
            {selectedArticle.image_url && (
              <div style={{ padding: "10px 16px", color: "#999", fontSize: "13px", borderBottom: "1px solid #222" }}>
                {selectedArticle.category.charAt(0).toUpperCase() + selectedArticle.category.slice(1)} - Posted by {selectedArticle.author}
              </div>
            )}

            {/* Article Body */}
            <div style={{ padding: "16px", color: "#ccc", fontSize: "14px", lineHeight: "1.7" }}>
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content.replace(/\n/g, "<br/>") }} />

              {/* Reactions Bar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "16px",
                paddingTop: "12px",
                borderTop: "1px solid #2a2a2a",
              }}>
                {["😄", "❤️", "🔥", "👍", "😮", "👑"].map((emoji) => {
                  const count = reactions[emoji] || 0;
                  const active = userReactions.includes(emoji);
                  return (
                  <div
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      background: active ? "rgba(92,34,158,0.4)" : "rgba(30,30,30,0.95)",
                      border: active ? "1px solid #5C229E" : "1px solid #2a2a2a",
                      boxShadow: "inset 2px 2px rgba(255,255,255,0.1), inset -2px -2px rgba(255,255,255,0.1)",
                      borderRadius: "4px",
                      padding: "4px 10px 4px 6px",
                      cursor: isLoggedIn() ? "pointer" : "default",
                      fontSize: "13px",
                      color: "#ddd",
                      transition: "background 0.15s",
                      userSelect: "none",
                      opacity: isLoggedIn() ? 1 : 0.5,
                    }}
                    onMouseEnter={(e) => { if (isLoggedIn()) (e.currentTarget as HTMLElement).style.background = active ? "rgba(92,34,158,0.6)" : "#2a2a2a"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active ? "rgba(92,34,158,0.4)" : "rgba(30,30,30,0.95)"; }}
                  >
                    <span>{emoji}</span>
                    <span style={{ fontWeight: "bold", fontSize: "12px" }}>{count}</span>
                  </div>
                  );
                })}
              </div>

              {/* Reaction Popup */}
              {reactionPopup && (
                <div style={{
                  marginTop: "10px",
                  padding: "10px 14px",
                  background: "rgba(92,34,158,0.15)",
                  border: "1px solid rgba(92,34,158,0.4)",
                  borderRadius: "6px",
                  color: "#d8b4fe",
                  fontSize: "13px",
                  textAlign: "center",
                  animation: "fadeIn 0.2s ease-in",
                }}>
                  {reactionPopup}
                </div>
              )}
            </div>
          </article>
        ) : (
          <article style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
            <div style={{
              background: "linear-gradient(135deg, #5C229E, #1a1a1a)",
              padding: "12px 16px",
              fontWeight: "bold",
              color: "#fff",
              fontSize: "14px",
            }}>
              Hotel News
            </div>
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#666" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📰</div>
              <div style={{ fontSize: "16px", fontWeight: "600", color: "#999" }}>No news articles yet</div>
              <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>Check back later for updates!</div>
            </div>
          </article>
        )}

        {/* Comments Section */}
        <div style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a", marginTop: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, #1e7295, #1a1a1a)",
            padding: "12px 16px",
            fontWeight: "bold",
            color: "#fff",
            fontSize: "14px",
            borderBottom: "1px solid #333",
          }}>
            Comments ({comments.length})
          </div>
          <div style={{ padding: "16px" }}>
            {comments.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", fontSize: "13px", padding: "20px 0" }}>
                There are no Comments yet. Be the first to comment!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: "10px", padding: "10px", background: "#111", borderRadius: "6px", border: "1px solid #222" }}>
                    <div style={{ flexShrink: 0, marginTop: "-8px", marginBottom: "-16px", imageRendering: "pixelated" as const }}>
                      <HabboAvatar look={c.look || "hd-180-1.ch-255-66.lg-280-110"} size="small" direction={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "bold", fontSize: "13px", color: "#ddd" }}>{c.username}</span>
                        <span style={{ fontSize: "11px", color: "#666" }}>{formatDate(c.created_at)}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.5", wordBreak: "break-word" as const }}>{c.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Post a Comment */}
        {isLoggedIn() ? (
        <div style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a", marginTop: "16px" }}>
          <div style={{
            background: "linear-gradient(135deg, #5CB565, #1a1a1a)",
            padding: "12px 16px",
            fontWeight: "bold",
            color: "#fff",
            fontSize: "14px",
            borderBottom: "1px solid #333",
          }}>
            Post a Comment
          </div>
          <div style={{ padding: "16px" }}>
            <textarea
              placeholder="Type your message here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              style={{
                width: "100%",
                height: "90px",
                resize: "vertical",
                background: "#111",
                border: "1px solid #333",
                borderRadius: "6px",
                color: "#ccc",
                padding: "10px",
                fontSize: "13px",
                fontFamily: "'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                boxSizing: "border-box",
                outline: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#5C229E"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#333"; }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
            />
            <button
              onClick={handlePostComment}
              disabled={posting || !commentText.trim()}
              style={{
                backgroundImage: "url(https://fresh-hotel.org/image/bargradient.png)",
                backgroundSize: "contain",
                backgroundColor: "#5C229E",
                color: "#fff",
                fontWeight: "bold",
                cursor: posting || !commentText.trim() ? "not-allowed" : "pointer",
                border: "none",
                borderRadius: "4px",
                padding: "10px",
                width: "100%",
                fontSize: "14px",
                marginTop: "8px",
                transition: "opacity 0.2s",
                opacity: posting || !commentText.trim() ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!posting && commentText.trim()) (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = posting || !commentText.trim() ? "0.5" : "1"; }}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
        ) : (
        <div style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a", marginTop: "16px", padding: "20px", textAlign: "center" }}>
          <p style={{ color: "#666", fontSize: "13px" }}>Log in to post comments and react to articles.</p>
        </div>
        )}
      </div>

      {/* Right Side - Sidebar */}
      <div style={{ width: "320px", flexShrink: 0 }}>
        {/* Author Box */}
        {selectedArticle && (
          <div style={{
            backgroundImage: selectedArticle.image_url ? `url(${selectedArticle.image_url})` : "linear-gradient(135deg, #5C229E, #1a1a1a)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
            overflow: "hidden",
            marginBottom: "16px",
            border: "1px solid #2a2a2a",
          }}>
            <div style={{
              background: "rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              padding: "1px 12px",
            }}>
              <div style={{
                flexShrink: 0,
                marginTop: "-10px",
                marginBottom: "-20px",
                filter: "drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff)",
                imageRendering: "pixelated",
              }}>
                <HabboAvatar
                  look={selectedArticle.author_look || "hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61"}
                  size="medium"
                  direction={2}
                />
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "2px",
                textAlign: "center",
                flex: 1,
              }}>
                <span style={{ fontSize: "0.85em", color: "#fff", fontWeight: "normal", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                  Posted by
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.85em", fontWeight: "bold", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                    {selectedArticle.author}
                  </span>
                  <span style={{ fontSize: "0.85em", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>on</span>
                  <span style={{ fontSize: "0.85em", fontWeight: "bold", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                    {formatDate(selectedArticle.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest News Sidebar */}
        <div style={{ background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", border: "1px solid #2a2a2a" }}>
          <div style={{
            background: "linear-gradient(135deg, #E27330, #1a1a1a)",
            padding: "12px 16px",
            fontWeight: "bold",
            color: "#fff",
            fontSize: "14px",
            borderBottom: "1px solid #333",
          }}>
            Latest News
          </div>
          <div style={{ padding: "0" }}>
            {articles.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#666", fontSize: "13px" }}>
                No articles yet
              </div>
            )}
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => selectArticle(article)}
                style={{
                  display: "flex",
                  background: selectedArticle?.id === article.id ? "#252525" : "#1f1f1f",
                  overflow: "hidden",
                  cursor: "pointer",
                  borderBottom: "1px solid #2a2a2a",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2a2a2a"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedArticle?.id === article.id ? "#252525" : "#1f1f1f"; }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: "80px",
                  height: "80px",
                  backgroundImage: article.image_url ? `url(${article.image_url})` : `linear-gradient(135deg, ${categoryColors[article.category] || "#5C229E"}, #333)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  flexShrink: 0,
                }} />
                {/* Details */}
                <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                  <Link to={`/news/${article.id}`} style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ddd",
                    lineHeight: "1.3",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                  }}>
                    {article.title}
                  </Link>
                  <div style={{ fontSize: "11px", color: "#777", marginTop: "4px" }}>
                    {formatDate(article.created_at)}
                  </div>
                  <div style={{
                    fontSize: "10px",
                    color: categoryColors[article.category] || "#5C229E",
                    marginTop: "2px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}>
                    {article.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
