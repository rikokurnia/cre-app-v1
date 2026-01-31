"use client";

import { useAccount } from 'wagmi';
import { Wallet, PieChart, TrendingUp, TrendingDown, RefreshCw, Share2, X, AlertCircle } from 'lucide-react';
import { useUserStore } from "@/app/store/useUserStore";
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function CreatorPortfolioView() {
  const { address } = useAccount();
  const { 
    virtualBalance, 
    portfolio, 
    closePosition, 
    resetBalance,
    getTotalPnL 
  } = useUserStore();

  const openPositions = portfolio.filter(p => p.isOpen);
  const closedPositions = portfolio.filter(p => !p.isOpen).sort((a, b) => 
    new Date(b.closedAt!).getTime() - new Date(a.closedAt!).getTime()
  );
  
  const totalPnL = getTotalPnL();

  // Helper to shorten address
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x00...0000';

  // Handle closing a position (Mock logic for demo: Win a bit or lose a bit)
  const handleClosePosition = (id: string, entryPrice: number, type: 'CALL' | 'PUT') => {
    // For demo purposes, we'll simulate a random movement
    // 60% chance of winning
    const isWin = Math.random() > 0.4;
    const movement = isWin ? 1.1 : 0.9;
    const exitPrice = type === 'CALL' 
      ? entryPrice * movement 
      : entryPrice * (isWin ? 0.9 : 1.1); // For PUT, lower price is better
      
    closePosition(id, exitPrice);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Wallet className="text-[#3674B5]" size={32} />
          <h2 className="text-3xl font-heading text-[#3674B5] uppercase">Portfolio</h2>
        </div>
        <p className="text-[#3674B5]/60 text-sm">
          Track your active trading positions and performance
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Virtual Balance Card */}
        <div className="bg-[#4F86C6] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-blue-100/80 text-xs font-bold uppercase tracking-wide">Available Balance</span>
            <div className="text-3xl font-pixel mt-2 mb-1">
              ${virtualBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <span className="text-blue-100/60 text-xs">Trading Credits</span>
          </div>
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        </div>

        {/* Wallet Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#A1E3F9] shadow-sm relative overflow-hidden">
           <div className="flex flex-col h-full justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Wallet</span>
              <div className="flex items-center gap-3 my-2">
                 <div className="w-10 h-10 rounded-full bg-[#3674B5] flex items-center justify-center text-white">
                    <Wallet size={20} />
                 </div>
                 <div>
                    <div className="text-[#3674B5] font-mono font-bold text-sm">{shortAddress}</div>
                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Active
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Total PnL Card */}
        <div className={`rounded-2xl p-6 border shadow-sm relative overflow-hidden ${totalPnL >= 0 ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
           <div className="flex flex-col h-full justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Total P&L</span>
              <div className="flex items-center gap-2 mt-1">
                 {totalPnL >= 0 ? <TrendingUp className="text-emerald-500" size={24} /> : <TrendingDown className="text-rose-500" size={24} />}
                 <div className={`text-3xl font-pixel ${totalPnL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {totalPnL >= 0 ? '+' : ''}${Math.abs(totalPnL).toLocaleString()}
                 </div>
              </div>
              <span className="text-gray-400 text-xs mt-1">{closedPositions.length} closed</span>
           </div>
        </div>

        {/* Open Positions Count Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#A1E3F9] shadow-sm relative overflow-hidden">
           <div className="flex flex-col h-full justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wide">Open</span>
              <div className="text-4xl font-pixel text-[#3674B5] mt-1">
                 {openPositions.length}
              </div>
              <button 
                onClick={resetBalance}
                className="flex items-center gap-1 text-rose-400 hover:text-rose-600 text-xs font-bold mt-1 transition-colors group"
              >
                 <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> Reset
              </button>
           </div>
        </div>

      </div>

      {/* Open Positions Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
            <div className={`w-3 h-3 rounded-full bg-emerald-400 animate-pulse`} />
            <h3 className="font-heading text-[#3674B5] uppercase text-lg">Open Positions</h3>
        </div>

        {openPositions.length === 0 ? (
            <div className="bg-white/50 border border-dashed border-[#A1E3F9] rounded-2xl p-8 text-center">
                <p className="text-[#3674B5]/40 font-heading text-lg">No active positions</p>
                <p className="text-sm text-gray-400">Go to Leaderboard to start trading</p>
            </div>
        ) : (
            <div className="space-y-3">
                {openPositions.map((pos) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={pos.id}
                        className="bg-white border border-[#A1E3F9] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100 flex-shrink-0">
                                <img src={pos.creatorPfp} alt={pos.creatorName} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        pos.type === 'CALL' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        Make it {pos.type === 'CALL' ? 'Fly' : 'Dump'}
                                    </span>
                                    <span className="font-heading text-[#3674B5] text-lg">{pos.creatorName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span>Entry: <b className="text-gray-600">{pos.entryPrice}</b></span>
                                    <span>•</span>
                                    <span>Amount: <b className="text-gray-600">${pos.amount}</b></span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button className="flex items-center gap-2 px-4 py-2 bg-[#9B7EBD] text-white rounded-lg hover:bg-[#8A6DAD] transition-colors text-sm font-bold">
                                <Share2 size={16} /> Share
                            </button>
                            <button 
                                onClick={() => handleClosePosition(pos.id, pos.entryPrice, pos.type)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#3674B5] text-white rounded-lg hover:bg-[#2A598A] transition-colors text-sm font-bold"
                            >
                                <X size={16} /> Close Position
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        )}
      </div>

      {/* Trade History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="text-[#3674B5]" size={20} />
            <h3 className="font-heading text-[#3674B5] uppercase text-lg">Trade History</h3>
        </div>

        <div className="bg-white rounded-2xl border border-[#A1E3F9] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#f0f9ff] text-[#3674B5] font-bold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Creator</th>
                            <th className="px-6 py-4 text-center">Type</th>
                            <th className="px-6 py-4 text-center">Entry</th>
                            <th className="px-6 py-4 text-center">Exit</th>
                            <th className="px-6 py-4 text-right">P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {closedPositions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">No trade history yet</td>
                            </tr>
                        ) : (
                            closedPositions.map((pos) => (
                                <tr key={pos.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={pos.creatorPfp} alt="" className="w-8 h-8 rounded-full border border-gray-200" />
                                            <div>
                                                <div className="font-bold text-gray-700">@{pos.creatorSymbol}</div>
                                                <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(pos.closedAt!), { addSuffix: true })}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            pos.type === 'CALL' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {pos.type === 'CALL' ? 'IGNITE' : 'DUMP'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-gray-600">
                                        {pos.entryPrice}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono text-gray-600">
                                        {pos.exitPrice?.toFixed(0)}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${
                                        (pos.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                        {(pos.pnl || 0) >= 0 ? '+' : ''}${(pos.pnl || 0).toFixed(0)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    
    </div>
  );
}
