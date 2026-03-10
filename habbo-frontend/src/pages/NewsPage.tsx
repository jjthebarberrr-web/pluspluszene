import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Megaphone, Calendar, Zap } from "lucide-react";

interface NewsArticle {
  id: number;
  title: string;
  content: string;
  image_url: string;
  author: string;
  category: string;
  created_at: number;
}

export function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    loadNews();
  }, [activeCategory]);

  const loadNews = async () => {
    try {
      const data = await apiGet(`/api/news/?category=${activeCategory}`);
      setArticles(data.articles);
    } catch {
      // ignore
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    announcement: <Megaphone className="w-4 h-4" />,
    event: <Calendar className="w-4 h-4" />,
    update: <Zap className="w-4 h-4" />,
    general: <Newspaper className="w-4 h-4" />,
  };

  const categoryColors: Record<string, string> = {
    announcement: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    event: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    update: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    general: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  };

  const categories = [
    { key: "all", label: "All News" },
    { key: "announcement", label: "Announcements" },
    { key: "event", label: "Events" },
    { key: "update", label: "Updates" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
        <Newspaper className="w-6 h-6 text-sky-400" />
        Hotel News
      </h1>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
              activeCategory === cat.key
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {articles.map((article) => (
          <Card key={article.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-800 border border-zinc-700">
                  {categoryIcons[article.category] || categoryIcons.general}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-lg font-bold text-zinc-100">{article.title}</h2>
                    <Badge variant="outline" className={`shrink-0 ${categoryColors[article.category] || categoryColors.general}`}>
                      {article.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{article.content}</p>
                  <div className="flex items-center gap-3 mt-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      By <strong className="text-zinc-400">{article.author}</strong>
                    </span>
                    <span>&bull;</span>
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {articles.length === 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Newspaper className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-zinc-400">No news articles</h3>
              <p className="text-sm text-zinc-500 mt-1">Check back later for updates!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
