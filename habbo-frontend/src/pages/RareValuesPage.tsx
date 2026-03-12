import { useState, useEffect } from "react";
import { apiGet } from "../api";
import { Gem, TrendingUp, TrendingDown, Minus, Search, Package } from "lucide-react";

interface RareItem {
  id: number;
  name: string;
  image_url: string;
  value_credits: number;
  trend: "up" | "down" | "stable";
  category: string;
  rarity: string;
}

export function RareValuesPage() {
  const [items, setItems] = useState<RareItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (searchQuery) params.set("search", searchQuery);
    apiGet(`/api/rare-items?${params.toString()}`)
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  const categories = [
    { key: "all", label: "All Items" },
    { key: "furni", label: "Furni" },
    { key: "rares", label: "Rares" },
    { key: "super-rares", label: "Super Rares" },
    { key: "limiteds", label: "Limiteds" },
  ];

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-zinc-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black/20 rounded-xl flex items-center justify-center border border-white/10">
              <Gem className="w-8 h-8 text-emerald-200" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Rare Values</h1>
              <p className="text-emerald-200/70 text-sm mt-0.5">Track the value of rare items in the hotel economy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search rare items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? "bg-emerald-700 text-white font-semibold"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      {items.length > 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/50 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <div className="col-span-5">Item</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Rarity</div>
            <div className="col-span-2 text-right">Value</div>
            <div className="col-span-1 text-center">Trend</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-zinc-800 hover:bg-zinc-800/30 transition-all items-center">
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden">
                  <img src={item.image_url} alt={item.name} className="w-8 h-8 object-contain" />
                </div>
                <span className="text-sm font-medium text-zinc-200">{item.name}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-zinc-500">{item.category}</span>
              </div>
              <div className="col-span-2">
                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">{item.rarity}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-emerald-400">{item.value_credits.toLocaleString()}c</span>
              </div>
              <div className="col-span-1 flex justify-center">
                {trendIcon(item.trend)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-zinc-700">
            <Package className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-400">Rare Values Coming Soon</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            We're building a comprehensive rare item value tracker. Check back soon to see market prices, trends, and trading guides!
          </p>
        </div>
      )}
    </div>
  );
}
