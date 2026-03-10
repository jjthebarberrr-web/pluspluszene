import { useState } from "react";
import { isLoggedIn } from "../api";

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
  { id: "vip_1month", name: "VIP Membership (1 Month)", description: "Get VIP status for 30 days! Includes exclusive badge, VIP room access, and double daily rewards.", price: 50000, currency: "credits", category: "membership", popular: true },
  { id: "vip_3month", name: "VIP Membership (3 Months)", description: "Save 20%! Get VIP status for 90 days with all VIP perks plus priority event access.", price: 120000, currency: "credits", category: "membership" },
  { id: "name_change", name: "Name Change", description: "Change your username to something new. One-time use per purchase.", price: 25000, currency: "credits", category: "perks" },
  { id: "room_boost", name: "Room Boost", description: "Boost your room to the top of the navigator for 24 hours. Get more visitors!", price: 10000, currency: "credits", category: "perks", popular: true },
  { id: "badge_custom", name: "Custom Badge", description: "Get a custom badge designed for you. Contact staff after purchase to design it.", price: 50, currency: "diamonds", category: "exclusive" },
  { id: "gift_box", name: "Mystery Gift Box", description: "Open a mystery box containing random rare furni, credits, or special items!", price: 5000, currency: "credits", category: "items", popular: true },
  { id: "credit_pack", name: "Diamond Pack (50)", description: "Get 50 diamonds to spend on exclusive items in the store.", price: 100000, currency: "credits", category: "currency" },
  { id: "double_xp", name: "Double Rewards (7 Days)", description: "Earn double credits and pixels from all activities for 7 days.", price: 30000, currency: "credits", category: "perks" },
];

const categories = [
  { key: "all", label: "All Items" },
  { key: "membership", label: "Memberships" },
  { key: "perks", label: "Perks" },
  { key: "exclusive", label: "Exclusive" },
  { key: "items", label: "Items" },
  { key: "currency", label: "Currency" },
];

export function StorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const loggedIn = isLoggedIn();

  const filteredItems = activeCategory === "all" ? storeItems : storeItems.filter((item) => item.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="rounded overflow-hidden">
        <div className="bg-gradient-to-r from-pink-700 to-pink-600 px-4 py-2.5 text-white font-bold text-sm">Hotel Store</div>
        <div className="bg-zinc-900 p-4 border border-zinc-800 border-t-0">
          <p className="text-sm text-zinc-400">Spend your credits and diamonds on exclusive perks and items.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {categories.map((cat) => (
          <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`px-4 py-2 text-sm rounded transition-all ${activeCategory === cat.key ? "bg-emerald-700 text-white font-semibold" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700"}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="rounded overflow-hidden relative">
            {item.popular && (
              <div className="absolute top-2 right-2 z-10 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">Popular</div>
            )}
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

      {!loggedIn && (
        <div className="text-center text-sm text-zinc-500">You need to be logged in to purchase items from the store.</div>
      )}
    </div>
  );
}
