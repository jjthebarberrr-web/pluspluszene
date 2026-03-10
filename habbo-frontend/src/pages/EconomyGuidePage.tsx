export function EconomyGuidePage() {
  return (
    <div className="space-y-6">
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
            <img src="https://fresh-hotel.org/assets/images/hotel/purses/credits-icon.png" alt="Credits" className="w-6 h-6" style={{imageRendering: 'pixelated'}} />
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
            <img src="https://fresh-hotel.org//nitro-assets-new/images/wallet/5.png" alt="Diamonds" className="w-6 h-6" style={{imageRendering: 'pixelated'}} />
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
    </div>
  );
}
