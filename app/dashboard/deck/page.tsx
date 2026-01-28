"use client";

import { motion } from "framer-motion";
import { Layers, ArrowUpRight, ArrowDownRight, Star, TrendingUp, TrendingDown } from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import Link from "next/link";
import { calculateRarity, RARITY_STYLES } from "@/utils/game/rarity";

// VIP Avatars Map (Ensures consistency with API fallback)
const VIP_AVATARS: Record<string, string> = {
  'dwr.eth': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/67b67035-71bb-459f-d34e-722131923200/rectcrop3',
  'v': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7c37617b-0563-445e-d25a-113aa074f700/rectcrop3',
  'vitalik.eth': 'https://i.imgur.com/3pX1G9m.jpg',
  'sriramk': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/9132c324-4f04-45e0-84a1-8d264df91500/rectcrop3',
  'betashop': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fe2f1906-8c90-449e-cc4c-68740c064900/rectcrop3',
  'jessepollak': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f47738f7-0d04-4e4b-6f6a-4c28f6424a00/rectcrop3',
};

export default function DeckPage() {
  const { portfolio } = useUserStore();

  // Get unique creators from positions
  const creatorCards = new Map<number, {
    fid: number;
    username: string;
    name: string;
    pfp: string;
    totalInvested: number;
    activePositions: number;
    closedPositions: number;
    totalPnL: number;
  }>();

  portfolio.forEach((position) => {
    const fid = position.creatorFid;
    if (creatorCards.has(fid)) {
      const card = creatorCards.get(fid)!;
      card.totalInvested += position.amount;
      if (position.isOpen) {
        card.activePositions += 1;
      } else {
        card.closedPositions += 1;
        card.totalPnL += position.pnl || 0;
      }
    } else {
      creatorCards.set(fid, {
        fid,
        username: position.creatorSymbol,
        name: position.creatorName,
        pfp: position.creatorPfp,
        totalInvested: position.amount,
        activePositions: position.isOpen ? 1 : 0,
        closedPositions: position.isOpen ? 0 : 1,
        totalPnL: position.pnl || 0,
      });
    }
  });

  const cards = Array.from(creatorCards.values()).map(card => {
    // Calculate Rarity (based on hypothetical entry price vs current price logic, 
    // or just PnL percentage for Deck view since we aggregate positions)
    const invested = card.totalInvested;
    const current = invested + card.totalPnL;
    const rarity = calculateRarity(invested, current, 'CALL'); // Treat as generic ROI
    
    return { ...card, rarity, style: RARITY_STYLES[rarity] };
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="text-[#3674B5]" size={32} />
          <h2 className="text-4xl font-heading text-[#3674B5]">My Deck</h2>
        </div>
        <p className="text-[#3674B5]/60">
          Your collection of creator cards from paper trading
        </p>
      </header>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-white rounded-xl border border-[#A1E3F9]">
        <div className="flex items-center gap-2">
          <Star className="text-amber-500" size={20} />
          <span className="font-heading text-lg text-[#3674B5]">{cards.length}</span>
          <span className="text-gray-400">Unique Creators</span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex items-center gap-2">
          <TrendingUp className="text-emerald-500" size={20} />
          <span className="font-heading text-lg text-[#3674B5]">{portfolio.length}</span>
          <span className="text-gray-400">Total Trades</span>
        </div>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🃏</div>
          <h3 className="text-xl font-heading text-[#3674B5] mb-2">Your Deck is Empty</h3>
          <p className="text-gray-400 mb-6">Start trading to collect creator cards!</p>
          <Link 
            href="/dashboard" 
            className="inline-block px-6 py-3 bg-[#3674B5] text-white rounded-lg font-heading hover:bg-[#2A598A] transition-colors"
          >
            Start Trading
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <motion.div
              key={card.fid}
              initial={{ opacity: 0, y: 20, rotateY: -10 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, rotateY: 5, transition: { duration: 0.3 } }}
              className="relative group perspective-1000"
            >
              {/* Rarity Glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-50 blur-xl transition-all duration-500 group-hover:opacity-80 -z-10 ${card.style.bgGradient}`} />

              {/* Card Container */}
              <div className={`p-1 rounded-2xl shadow-xl transition-all duration-300 border-2 ${card.style.borderColor} ${card.style.bgGradient}`}>
                <div className="bg-white rounded-xl overflow-hidden h-full relative">
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase border border-white/20">
                     {card.style.icon} {card.rarity}
                  </div>
                  {/* Card Header */}
                  <div className="h-24 bg-gradient-to-r from-[#D1F8EF] to-[#A1E3F9] relative">
                    {/* Decorative Stars */}
                    <div className="absolute top-3 right-3 flex gap-1">
                      {[...Array(Math.min(5, Math.ceil(card.activePositions + card.closedPositions / 2)))].map((_, i) => (
                        <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    
                    {/* Avatar */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                        <img 
                          src={VIP_AVATARS[card.username] || card.pfp} 
                          alt={card.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${card.username}`;
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="pt-12 px-5 pb-5 text-center">
                    <h3 className={`font-heading text-xl ${card.style.color}`}>{card.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">@{card.username}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-400 uppercase">Invested</div>
                        <div className="font-pixel text-lg text-[#3674B5]">${card.totalInvested}</div>
                      </div>
                      <div className={`rounded-lg p-3 ${card.totalPnL >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        <div className="text-xs text-gray-400 uppercase">P&L</div>
                        <div className={`font-pixel text-lg flex items-center justify-center gap-1 ${
                          card.totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {card.totalPnL >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {card.totalPnL >= 0 ? '+' : ''}${card.totalPnL.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Position Badges */}
                    <div className="flex justify-center gap-2">
                      {card.activePositions > 0 && (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                          {card.activePositions} Active
                        </span>
                      )}
                      {card.closedPositions > 0 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                          {card.closedPositions} Closed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing Effect on Hover (Custom per rarity) */}
              <div className={`absolute inset-0 rounded-2xl ${card.style.bgGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity -z-20`} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
