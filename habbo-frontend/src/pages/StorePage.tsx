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
    price: 500, currency: "credits",
    perks: ["VIP Bronze badge", "Access to VIP Bronze catalog", "30 exclusive bonus rares", "VIP chat prefix", "Priority room access"],
    exclusiveItems: "Bonus Rares, Mini Rares, Limited Editions",
  },
  {
    id: 2, rank: 9, name: "VIP Silver", badge: "VIP2", color: "#C0C0C0",
    borderColor: "border-zinc-400", bgGradient: "from-zinc-600 to-zinc-400",
    price: 25, currency: "diamonds", popular: true,
    perks: ["VIP Silver badge", "Access to Bronze + Silver catalog", "30 premium rares", "Name change command", "Fast walk & moonwalk", "VIP chat prefix"],
    exclusiveItems: "Rainbow LTDs, Premium Bonus Rares",
  },
  {
    id: 3, rank: 10, name: "VIP Gold", badge: "VIP3", color: "#FFD700",
    borderColor: "border-yellow-500", bgGradient: "from-yellow-700 to-yellow-500",
    price: 50, currency: "diamonds",
    perks: ["VIP Gold badge", "Access to Bronze + Silver + Gold catalog", "40 ultra rare items", "Mimic command", "Teleport command", "All Silver perks included"],
    exclusiveItems: "Diamond Furni, NFT Rares, Ultra Bonus Rares",
  },
  {
    id: 4, rank: 11, name: "VIP Diamond", badge: "VIP4", color: "#B9F2FF",
    borderColor: "border-sky-300", bgGradient: "from-sky-600 to-sky-300",
    price: 100, currency: "diamonds", popular: true,
    perks: ["VIP Diamond badge", "Access to ALL VIP catalogs", "50 most exclusive rares", "Dance all command", "Faceless mode", "Enter full rooms", "Enter any room", "All Gold perks included"],
    exclusiveItems: "HabPlus 25th Anniversary, Ultra LTDs, Legendary Rares",
  },
];

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "credits" | "diamonds" | "duckets";
  category: string;
  popular?: boolean;
}

const storeItems: StoreItem[] = [
  { id: "name_change", name: "Name Change", description: "Change your username to something new. One-time use per purchase.", price: 250, currency: "credits", category: "perks" },
  { id: "room_boost", name: "Room Boost", description: "Boost your room to the top of the navigator for 24 hours. Get more visitors!", price: 100, currency: "credits", category: "perks", popular: true },
  { id: "badge_custom", name: "Custom Badge", description: "Get a custom badge designed for you. Contact staff after purchase to design it.", price: 15, currency: "diamonds", category: "exclusive" },
  { id: "gift_box", name: "Mystery Gift Box", description: "Open a mystery box containing random rare furni, credits, or special items!", price: 75, currency: "credits", category: "items", popular: true },
  { id: "credit_pack", name: "Diamond Pack (5)", description: "Get 5 diamonds to spend on exclusive items in the store and catalog.", price: 300, currency: "credits", category: "currency" },
  { id: "double_xp", name: "Double Rewards (7 Days)", description: "Earn double credits and duckets from all activities for 7 days.", price: 10, currency: "diamonds", category: "perks" },
  { id: "room_layout", name: "Custom Room Layout", description: "Unlock a premium room layout for building unique rooms.", price: 150, currency: "duckets", category: "perks" },
  { id: "rare_box", name: "Rare Surprise Box", description: "Contains a random rare item from the catalog. Could be anything!", price: 5, currency: "diamonds", category: "items", popular: true },
];

const storeCategories = [
  { key: "all", label: "All Items" },
  { key: "perks", label: "Perks" },
  { key: "exclusive", label: "Exclusive" },
  { key: "items", label: "Items" },
  { key: "currency", label: "Currency" },
];

const currencyColor = (c: string) => c === "credits" ? "text-yellow-400" : c === "diamonds" ? "text-sky-400" : "text-purple-400";
const currencyIcon = (c: string) => c === "credits" ? "https://fresh-hotel.org/nitro-assets-new/images/wallet/1.png" : c === "diamonds" ? "https://fresh-hotel.org/nitro-assets-new/images/wallet/0.png" : "https://fresh-hotel.org/nitro-assets-new/images/wallet/0.png";

export function StorePage() {
  const [activeTab, setActiveTab] = useState<"vip" | "store" | "economy">("economy");
  const [activeCategory, setActiveCategory] = useState("all");
  const loggedIn = isLoggedIn();

  const filteredItems = activeCategory === "all" ? storeItems : storeItems.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab("economy")} className={`px-6 py-2.5 text-sm font-bold rounded transition-all ${activeTab === "economy" ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"}`}>
          Economy Guide
        </button>
        <button onClick={() => setActiveTab("vip")} className={`px-6 py-2.5 text-sm font-bold rounded transition-all ${activeTab === "vip" ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"}`}>
          VIP Ranks
        </button>
        <button onClick={() => setActiveTab("store")} className={`px-6 py-2.5 text-sm font-bold rounded transition-all ${activeTab === "store" ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"}`}>
          Store Items
        </button>
      </div>

      {activeTab === "economy" && (
        <>
          {/* Economy Overview */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-4 py-3 text-white font-bold text-sm flex items-center gap-2">
              HabPlus Economy System
            </div>
            <div className="bg-zinc-900 p-5 border border-zinc-800 border-t-0">
              <p className="text-sm text-zinc-300 mb-3">HabPlus uses a <strong className="text-white">strict, balanced economy</strong> with three distinct currencies. Each currency has a clear purpose — earn them by being active in the hotel!</p>
              <p className="text-xs text-zinc-500">New citizens start with <span className="text-yellow-400 font-semibold">500 Credits</span>, <span className="text-purple-400 font-semibold">200 Duckets</span>, and <span className="text-sky-400 font-semibold">10 Diamonds</span>.</p>
            </div>
          </div>

          {/* Currency Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Credits */}
            <div className="rounded overflow-hidden border border-yellow-700/50">
              <div className="bg-gradient-to-r from-yellow-800 to-yellow-600 px-4 py-3 flex items-center gap-3">
                <img src="https://fresh-hotel.org/nitro-assets-new/images/wallet/1.png" alt="Credits" className="w-6 h-6" />
                <div className="text-white font-bold text-sm">Credits</div>
              </div>
              <div className="bg-zinc-900 p-4 space-y-3">
                <div className="bg-zinc-800/60 rounded px-3 py-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Earn Rate</div>
                  <div className="text-sm text-yellow-400 font-bold">25 every 15 minutes</div>
                </div>
                <div className="text-xs text-zinc-400 font-semibold mb-1">Used For:</div>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-xs"><span className="text-yellow-400 mt-0.5">+</span><span className="text-zinc-300">All regular furniture (5-50 credits)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-yellow-400 mt-0.5">+</span><span className="text-zinc-300">Clothing and accessories (8-35 credits)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-yellow-400 mt-0.5">+</span><span className="text-zinc-300">Pets and pet accessories (15-50 credits)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-yellow-400 mt-0.5">+</span><span className="text-zinc-300">Store items and perks</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-yellow-400 mt-0.5">+</span><span className="text-zinc-300">Camera photos (5 credits each)</span></div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 italic">The everyday currency. Earn it just by being active in the hotel!</p>
              </div>
            </div>

            {/* Duckets */}
            <div className="rounded overflow-hidden border border-purple-700/50">
              <div className="bg-gradient-to-r from-purple-800 to-purple-600 px-4 py-3 flex items-center gap-3">
                <img src="https://fresh-hotel.org/nitro-assets-new/images/wallet/0.png" alt="Duckets" className="w-6 h-6" />
                <div className="text-white font-bold text-sm">Duckets</div>
              </div>
              <div className="bg-zinc-900 p-4 space-y-3">
                <div className="bg-zinc-800/60 rounded px-3 py-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Earn Rate</div>
                  <div className="text-sm text-purple-400 font-bold">15 every 15 minutes</div>
                </div>
                <div className="text-xs text-zinc-400 font-semibold mb-1">Used For:</div>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-xs"><span className="text-purple-400 mt-0.5">+</span><span className="text-zinc-300">Seasonal items (Christmas, Halloween, Easter)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-purple-400 mt-0.5">+</span><span className="text-zinc-300">Wired furniture (30 duckets each)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-purple-400 mt-0.5">+</span><span className="text-zinc-300">Room construction and building tools</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-purple-400 mt-0.5">+</span><span className="text-zinc-300">Game furniture (15 duckets each)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-purple-400 mt-0.5">+</span><span className="text-zinc-300">Custom room layouts</span></div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 italic">The builder's currency. Invest duckets to create amazing rooms!</p>
              </div>
            </div>

            {/* Diamonds */}
            <div className="rounded overflow-hidden border border-sky-500/50">
              <div className="bg-gradient-to-r from-sky-700 to-sky-500 px-4 py-3 flex items-center gap-3">
                <img src="https://fresh-hotel.org/nitro-assets-new/images/wallet/0.png" alt="Diamonds" className="w-6 h-6" />
                <div className="text-white font-bold text-sm">Diamonds</div>
              </div>
              <div className="bg-zinc-900 p-4 space-y-3">
                <div className="bg-zinc-800/60 rounded px-3 py-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Earn Rate</div>
                  <div className="text-sm text-sky-400 font-bold">1 every 30 minutes</div>
                </div>
                <div className="text-xs text-zinc-400 font-semibold mb-1">Used For:</div>
                <div className="space-y-1">
                  <div className="flex items-start gap-2 text-xs"><span className="text-sky-400 mt-0.5">+</span><span className="text-zinc-300">Limited Edition items (25-50 diamonds)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-sky-400 mt-0.5">+</span><span className="text-zinc-300">Diamond-exclusive furniture (5 diamonds)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-sky-400 mt-0.5">+</span><span className="text-zinc-300">Rare collectibles (1-3 diamonds + credits)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-sky-400 mt-0.5">+</span><span className="text-zinc-300">VIP memberships (Silver, Gold, Diamond)</span></div>
                  <div className="flex items-start gap-2 text-xs"><span className="text-sky-400 mt-0.5">+</span><span className="text-zinc-300">Store exclusives and premium perks</span></div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 italic">The premium currency. Hard to earn, used for the rarest items!</p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="rounded overflow-hidden">
            <div className="bg-zinc-800 px-4 py-2 text-zinc-300 font-bold text-xs">Catalog Pricing Tiers</div>
            <div className="bg-zinc-900 border border-zinc-800 border-t-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left px-4 py-2">Category</th>
                    <th className="text-left px-4 py-2">Credits</th>
                    <th className="text-left px-4 py-2">Duckets</th>
                    <th className="text-left px-4 py-2">Diamonds</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Basic Furniture</td><td className="px-4 py-2 text-yellow-400">5</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-zinc-600">-</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Clothing</td><td className="px-4 py-2 text-yellow-400">8-12</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-zinc-600">-</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">New/Premium Furniture</td><td className="px-4 py-2 text-yellow-400">15-25</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-zinc-600">-</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Seasonal Items</td><td className="px-4 py-2 text-yellow-400">18-25</td><td className="px-4 py-2 text-purple-400">12-20</td><td className="px-4 py-2 text-zinc-600">-</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Wired / Games</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-purple-400">15-30</td><td className="px-4 py-2 text-zinc-600">-</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Mini Rares</td><td className="px-4 py-2 text-yellow-400">75</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-sky-400">1</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Bonus Rares</td><td className="px-4 py-2 text-yellow-400">100</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-sky-400">2</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Premium Rares</td><td className="px-4 py-2 text-yellow-400">150</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-sky-400">3</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold">Diamond Exclusives</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-sky-400">5</td></tr>
                  <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-semibold text-amber-400">Limited Editions</td><td className="px-4 py-2 text-yellow-400">250-500</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-sky-400">15-25</td></tr>
                  <tr><td className="px-4 py-2 font-semibold">HC/VIP Items</td><td className="px-4 py-2 text-yellow-400">40-60</td><td className="px-4 py-2 text-zinc-600">-</td><td className="px-4 py-2 text-sky-400">1-3</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* LTD Info */}
          <div className="rounded overflow-hidden">
            <div className="bg-gradient-to-r from-amber-700 to-amber-500 px-4 py-2 text-white font-bold text-xs flex items-center gap-2">Limited Edition Rules</div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-2">
              <p className="text-xs text-zinc-400"><strong className="text-amber-400">Daily Purchase Limit:</strong> You can buy a maximum of <strong className="text-white">2 copies of any single LTD per day</strong> and <strong className="text-white">5 total LTDs per day</strong>. This prevents hoarding and keeps the economy fair.</p>
              <p className="text-xs text-zinc-400"><strong className="text-amber-400">Stock-Based Pricing:</strong> LTDs with lower stock cost more diamonds. Items with only 10 in stock cost 500 credits + 25 diamonds, while items with 50 in stock cost 250 credits + 15 diamonds.</p>
              <p className="text-xs text-zinc-400"><strong className="text-amber-400">Why It Matters:</strong> Limited Editions are the backbone of HabPlus trading. Their scarcity creates real value — collect, trade, and invest wisely!</p>
            </div>
          </div>

          {/* Timer Info */}
          <div className="rounded overflow-hidden">
            <div className="bg-zinc-800 px-4 py-2 text-zinc-300 font-bold text-xs">How Earning Works</div>
            <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0 space-y-2">
              <p className="text-xs text-zinc-400">You earn currencies <strong className="text-zinc-300">passively</strong> just by being online and active in the hotel. Idle users don't earn duckets or diamonds — stay active!</p>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="bg-zinc-800/60 rounded px-3 py-2 text-center">
                  <div className="text-yellow-400 font-bold text-lg">25</div>
                  <div className="text-[10px] text-zinc-500">Credits / 15min</div>
                  <div className="text-[9px] text-zinc-600">~100/hour</div>
                </div>
                <div className="bg-zinc-800/60 rounded px-3 py-2 text-center">
                  <div className="text-purple-400 font-bold text-lg">15</div>
                  <div className="text-[10px] text-zinc-500">Duckets / 15min</div>
                  <div className="text-[9px] text-zinc-600">~60/hour</div>
                </div>
                <div className="bg-zinc-800/60 rounded px-3 py-2 text-center">
                  <div className="text-sky-400 font-bold text-lg">1</div>
                  <div className="text-[10px] text-zinc-500">Diamond / 30min</div>
                  <div className="text-[9px] text-zinc-600">~2/hour</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
                    <div className="flex items-center gap-2">
                      <img src={currencyIcon(tier.currency)} alt={tier.currency} className="w-4 h-4" />
                      <span className={`font-bold text-lg ${currencyColor(tier.currency)}`}>{tier.price.toLocaleString()}</span>
                      <span className="text-xs text-zinc-500">{tier.currency}</span>
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
              <p className="text-sm text-zinc-400">Spend your credits, duckets, and diamonds on exclusive perks and items.</p>
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
                      <img src={currencyIcon(item.currency)} alt={item.currency} className="w-4 h-4" />
                      <span className={`font-bold ${currencyColor(item.currency)}`}>{item.price.toLocaleString()}</span>
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
