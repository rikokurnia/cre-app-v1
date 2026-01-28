"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, TrendingDown, RotateCcw, ArrowUpRight, ArrowDownRight, History, AlertCircle } from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import { useAccount } from "wagmi";
import ShareButton from "@/app/components/sharing/ShareButton";

function ConnectedAddress() {
  const { address } = useAccount();
  if (!address) return <span>Not Connected</span>;
  return <span>{address.slice(0, 6)}...{address.slice(-4)}</span>;
}

// VIP Avatars Map (Ensures consistency with API fallback)
const VIP_AVATARS: Record<string, string> = {
  'dwr.eth': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/67b67035-71bb-459f-d34e-722131923200/rectcrop3',
  'v': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7c37617b-0563-445e-d25a-113aa074f700/rectcrop3',
  'vitalik.eth': 'https://i.imgur.com/3pX1G9m.jpg',
  'sriramk': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/9132c324-4f04-45e0-84a1-8d264df91500/rectcrop3',
  'betashop': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/fe2f1906-8c90-449e-cc4c-68740c064900/rectcrop3',
  'jessepollak': 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/f47738f7-0d04-4e4b-6f6a-4c28f6424a00/rectcrop3',
};

export default function PortfolioPage() {
  const { virtualBalance, portfolio, resetBalance, closePosition, getTotalPnL } = useUserStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const openPositions = portfolio.filter(p => p.isOpen);
  const closedPositions = portfolio.filter(p => !p.isOpen);
  const totalPnL = getTotalPnL();

  const handleClosePosition = async (positionId: string) => {
    // In a real app, we'd fetch the current score. For now, simulate with random change
    const position = portfolio.find(p => p.id === positionId);
    if (!position) return;
    
    // Simulate score change: -50 to +100 points
    const scoreChange = Math.floor(Math.random() * 150) - 50;
    const currentScore = position.entryPrice + scoreChange;
    
    closePosition(positionId, currentScore);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="text-[#3674B5]" size={32} />
          <h2 className="text-4xl font-heading text-[#3674B5]">Portfolio</h2>
        </div>
        <p className="text-[#3674B5]/60">
          Track your paper trading positions and performance
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        {/* Virtual Balance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 md:col-span-1 bg-gradient-to-br from-[#3674B5] to-[#578FCA] p-4 md:p-6 rounded-2xl text-white shadow-lg"
        >
          <div className="text-white/70 text-xs md:text-sm mb-1">Virtual Balance</div>
          <div className="font-pixel text-xl md:text-3xl text-white">${virtualBalance.toLocaleString()}</div>
          <div className="mt-2 md:mt-4 text-[10px] md:text-xs text-white/50">Paper trading only</div>
        </motion.div>

        {/* Connected Wallet */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#A1E3F9]"
        >
          <div className="text-gray-500 text-xs md:text-sm mb-2 md:mb-3">Wallet</div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#3674B5] to-[#578FCA] flex items-center justify-center text-white font-bold">
              <Wallet size={16} className="md:w-5 md:h-5" />
            </div>
            <div>
              <div className="font-heading text-xs md:text-base text-[#3674B5]">
                <ConnectedAddress />
              </div>
              <div className="text-[10px] md:text-xs text-green-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                Active
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total P&L */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 md:p-6 rounded-2xl shadow-sm border ${
            totalPnL >= 0 
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="text-gray-500 text-xs md:text-sm mb-1">Total P&L</div>
          <div className={`font-pixel text-xl md:text-3xl flex items-center gap-1 md:gap-2 ${
            totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {totalPnL >= 0 ? <TrendingUp size={18} className="md:w-6 md:h-6" /> : <TrendingDown size={18} className="md:w-6 md:h-6" />}
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(0)}
          </div>
          <div className="mt-2 md:mt-4 text-[10px] md:text-xs text-gray-400">{closedPositions.length} closed</div>
        </motion.div>

        {/* Open Positions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-[#A1E3F9]"
        >
          <div className="text-gray-500 text-xs md:text-sm mb-1">Open</div>
          <div className="font-pixel text-xl md:text-3xl text-[#3674B5]">{openPositions.length}</div>
          <div className="mt-2 md:mt-4">
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="text-[10px] md:text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RotateCcw size={10} className="md:w-3 md:h-3" /> Reset
            </button>
          </div>
        </motion.div>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-rose-500 mt-0.5" size={20} />
            <div className="flex-1">
              <div className="font-medium text-rose-700">Reset your account?</div>
              <p className="text-sm text-rose-600 mt-1">This will reset your balance to $10,000 and clear all positions.</p>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => { resetBalance(); setShowResetConfirm(false); }}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
                >
                  Yes, Reset
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-white text-gray-600 rounded-lg text-sm font-medium border hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Positions */}
      <div className="mb-8">
        <h3 className="text-xl font-heading text-[#3674B5] mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          Open Positions
        </h3>
        
        {openPositions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">📊</div>
            <div className="text-gray-400">No open positions yet. Start trading!</div>
          </div>
        ) : (
          <div className="space-y-3">
            {openPositions.map((position) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl border border-[#A1E3F9] p-3 md:p-4 hover:shadow-md transition-shadow"
              >
                {/* Mobile: Stack layout */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  {/* Creator info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={VIP_AVATARS[position.creatorSymbol] || position.creatorPfp} 
                      alt={position.creatorSymbol}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${position.creatorSymbol}`;
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          position.type === 'CALL' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {position.type === 'CALL' ? <ArrowUpRight size={10} className="inline" /> : <ArrowDownRight size={10} className="inline" />}
                          {position.type === 'CALL' ? 'IGNITE' : 'ECLIPSE'}
                        </span>
                        <span className="font-heading text-sm md:text-lg text-[#3674B5]">{position.creatorName}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Entry: {position.entryPrice} • ${position.amount}
                      </div>
                    </div>
                  </div>
                  
                  {/* Buttons - horizontal on all sizes */}
                  <div className="flex gap-2 ml-13 md:ml-0">
                    <ShareButton 
                      text={`I'm holding a ${position.type} position on @${position.creatorSymbol} in CreatorArena! 📊`}
                      className="px-3 py-1.5 text-xs"
                      label="Share"
                    />
                    <button
                      onClick={() => handleClosePosition(position.id)}
                      className="px-3 py-1.5 bg-[#3674B5] text-white rounded-lg text-xs font-medium hover:bg-[#2A598A] transition-colors whitespace-nowrap"
                    >
                      Close Position
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Positions */}
      <div>
        <h3 className="text-xl font-heading text-[#3674B5] mb-4 flex items-center gap-2">
          <History size={20} />
          Trade History
        </h3>
        
        {closedPositions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">📜</div>
            <div className="text-gray-400">No trade history yet.</div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Creator</th>
                    <th className="px-2 py-2 text-center">Type</th>
                    <th className="px-2 py-2 text-center">Entry</th>
                    <th className="px-2 py-2 text-center">Exit</th>
                    <th className="px-2 py-2 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {closedPositions.slice().reverse().map((position) => (
                    <tr key={position.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={VIP_AVATARS[position.creatorSymbol] || position.creatorPfp} 
                            alt={position.creatorSymbol}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${position.creatorSymbol}`;
                            }}
                          />
                          <span className="font-medium text-xs text-[#3674B5]">@{position.creatorSymbol}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          position.type === 'CALL' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {position.type === 'CALL' ? 'IGNITE' : 'ECLIPSE'}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center font-mono text-xs">{position.entryPrice}</td>
                      <td className="px-2 py-2 text-center font-mono text-xs">{position.exitPrice}</td>
                      <td className={`px-2 py-2 text-right font-bold text-xs ${
                        (position.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {(position.pnl || 0) >= 0 ? '+' : ''}${(position.pnl || 0).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
