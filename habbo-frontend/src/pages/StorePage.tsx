import { useState } from "react";
import { isLoggedIn } from "../api";

interface VipTier {
  id: number;
  rank: number;
  name: string;
  badge: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  price: number;
  currency: "credits" | "diamonds";
  perks: string[];
  exclusiveItems: string;
  popular?: boolean;
}

const vipTiers: VipTier[] = [
  {
    id: 1, rank: 8, name: "VIP Bronze", badge: "VIP1", color: "#CD7F32",
    borderColor: "border-amber-700", bgGradient: "from-amber-900 to-amber-700",
    price: 50000, currency: "credits",
    perks: ["VIP Bronze badge", "Access to VIP Bronze catalog", "30 exclusive bonus rares", "VIP chat prefix", "Priority room access"],
    exclusiveItems: "Bonus Rares, Mini Rares, Limited Editions",
  },
  {
    id: 2, rank: 9, name: "VIP Silver", badge: "VIP2", color: "#C0C0C0",
    borderColor: "border-zinc-400", bgGradient: "from-zinc-600 to-zinc-400",
    price: 100000, currency: "credits", popular: true,
    perks: ["VIP Silver badge", "Access to Bronze + Silver catalog", "30 premium rares", "Name change command", "Fast walk & moonwalk", "VIP chat prefix"],
    exclusiveItems: "Rainbow LTDs, Premium Bonus Rares",
  },
  {
    id: 3, rank: 10, name: "VIP Gold", badge: "VIP3", color: "#FFD700",
    borderColor: "border-yellow-500", bgGradient: "from-yellow-700 to-yellow-500",
    price: 200000, currency: "credits",
    perks: ["VIP Gold badge", "Access to Bronze + Silver + Gold catalog", "40 ultra rare items", "Mimic command", "Teleport command", "All Silver perks included"],
    exclusiveItems: "Diamond Furni, NFT Rares, Ultra Bonus Rares",
  },
  {
    id: 4, rank: 11, name: "VIP Diamond", badge: "VIP4", color: "#B9F2FF",
    borderColor: "border-sky-300", bgGradient: "from-sky-600 to-sky-300",
    price: 500000, currency: "credits", popular: true,
    perks: ["VIP Diamond badge", "Access to ALL VIP catalogs", "50 most exclusive rares", "Dance all command", "Faceless mode", "Enter full rooms", "Enter any room", "All Gold perks included"],
    exclusiveItems: "Habbo 25th Anniversary, Ultra LTDs, Legendary Rares",
  },
];

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "credits" | "diamonds";
  category: string;
  popular?: boolean;
}

const storeItems: StoreItem[] = [
  { id: "name_change", name: "Name Change", description: "Change your username to something new. One-time use per purchase.", price: 25000, currency: "credits", category: "perks" },
  { id: "room_boost", name: "Room Boost", description: "Boost your room to the top of the navigator for 24 hours. Get more visitors!", price: 10000, currency: "credits", category: "perks", popular: true },
  { id: "badge_custom", name: "Custom Badge", description: "Get a custom badge designed for you. Contact staff after purchase to design it.", price: 50, currency: "diamonds", category: "exclusive" },
  { id: "gift_box", name: "Mystery Gift Box", description: "Open a mystery box containing random rare furni, credits, or special items!", price: 5000, currency: "credits", category: "items", popular: true },
  { id: "credit_pack", name: "Diamond Pack (50)", description: "Get 50 diamonds to spend on exclusive items in the store.", price: 100000, currency: "credits", category: "currency" },
  { id: "double_xp", name: "Double Rewards (7 Days)", description: "Earn double credits and pixels from all activities for 7 days.", price: 30000, currency: "credits", category: "perks" },
];

const storeCategories = [
  { key: "all", label: "All Items" },
  { key: "perks", label: "Perks" },
  { key: "exclusive", label: "Exclusive" },
  { key: "items", label: "Items" },
  { key: "currency", label: "Currency" },
];

export function StorePage() {
  const [activeTab, setActiveTab] = useState<"vip" | "store">("vip");
  const [activeCategory, setActiveCategory] = useState("all");
  const loggedIn = isLoggedIn();

  const filteredItems = activeCategory === "all" ? storeItems : storeItems.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("vip")} className={`px-6 py-2.5 text-sm font-bold rounded transition-all ${activeTab === "vip" ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"}`}>
          VIP Ranks
        </button>
        <button onClick={() => setActiveTab("store")} className={`px-6 py-2.5 text-sm font-bold rounded transition-all ${activeTab === "store" ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"}`}>
          Store Items
        </button>
      </div>

      {activeTab === "vip" && (
        <>
          {/* VIP Header */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-teal-600 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
              <span className="text-lg">&#9733;</span> VIP Membership Ranks
            </div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
              <p className="text-sm text-zinc-400">Upgrade your experience with VIP! Each rank unlocks exclusive catalog items, special commands, and unique perks. Higher VIP ranks include all benefits from lower tiers.</p>
              <p className="text-xs text-zinc-500 mt-2">VIP members get exclusive access to the VIP catalog tab in-game with rare items only available to their rank and above.</p>
            </div>
          </div>

          {/* VIP Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vipTiers.map((tier) => (
              <div key={tier.id} className={`rounded overflow-hidden relative border ${tier.borderColor}`}>
                {tier.popular && <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">BEST VALUE</div>}
                <div className={`bg-gradient-to-r ${tier.bgGradient} px-4 py-3 flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: tier.color, border: "2px solid rgba(255,255,255,0.3)" }}>
                    {tier.badge.replace("VIP", "")}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{tier.name}</div>
                    <div className="text-white/70 text-xs">Rank {tier.rank}</div>
                  </div>
                </div>
                <div className="bg-zinc-900/90 p-4">
                  <div className="space-y-1.5 mb-4">
                    {tier.perks.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-400 mt-0.5 flex-shrink-0">+</span>
                        <span className="text-zinc-300">{perk}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-zinc-800/60 rounded px-3 py-2 mb-4">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Exclusive Catalog Items</div>
                    <div className="text-xs text-zinc-300">{tier.exclusiveItems}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-yellow-400 font-bold text-lg">{tier.price.toLocaleString()}</span>
                      <span className="text-xs text-zinc-500 ml-1">{tier.currency}</span>
                    </div>
                    <button disabled={!loggedIn} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-xs font-bold rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      {loggedIn ? "Purchase" : "Login Required"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* VIP Hierarchy note */}
          <div className="rounded overflow-hidden">
            <div className="bg-zinc-800 px-4 py-2 text-zinc-300 font-bold text-xs">How VIP Works</div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-2">
              <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Hierarchical Access:</strong> Higher VIP ranks can access all catalog pages from lower tiers. VIP Diamond members can browse Bronze, Silver, Gold, and Diamond exclusive catalogs.</p>
              <p className="text-xs text-zinc-400"><strong className="text-zinc-300">In-Game Catalog:</strong> Once you have a VIP rank, a new "VIP" tab appears in your in-game catalog alongside Furni, Clothes, Pets, Others, and Staff tabs. Only VIP members can see it.</p>
              <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Exclusive Rares:</strong> Each tier has unique rare items that cannot be obtained any other way. Collect them all!</p>
            </div>
          </div>
        </>
      )}

      {activeTab === "store" && (
        <>
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-pink-700 to-pink-600 px-4 py-2.5 text-white font-bold text-sm">Hotel Store</div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
              <p className="text-sm text-zinc-400">Spend your credits and diamonds on exclusive perks and items.</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {storeCategories.map((cat) => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`px-4 py-2 text-sm rounded transition-all ${activeCategory === cat.key ? "bg-emerald-700 text-white font-semibold" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"}`}>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="rounded overflow-hidden relative">
                {item.popular && <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">Popular</div>}
                <div className="bg-gradient-to-r from-sky-700 to-sky-600 px-3 py-2 text-white font-bold text-xs">{item.name}</div>
                <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 flex flex-col h-full">
                  <p className="text-xs text-zinc-400 mb-4 flex-1">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold ${item.currency === "credits" ? "text-yellow-400" : "text-sky-400"}`}>{item.price.toLocaleString()}</span>
                      <span className="text-xs text-zinc-500">{item.currency}</span>
                    </div>
                    <button disabled={!loggedIn} className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white text-xs font-bold rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      {loggedIn ? "Buy" : "Login"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loggedIn && (
        <div className="text-center text-sm text-zinc-500">You need to be logged in to purchase items from the store.</div>
      )}
    </div>
  );
}
