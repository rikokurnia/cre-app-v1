'use client';
import { useAccount, useBalance } from 'wagmi';
import { Wallet, PieChart, TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';
import { THETANUTS_CONFIG } from '@/config/thetanuts';
import { fetchUserHistory } from '@/app/services/thetanuts-v4';
import { useEffect, useState } from 'react';

import { useMode } from "@/app/store/ModeContext";
import { useUserStore } from "@/app/store/useUserStore";
import MyPositionsView from "./MyPositionsView";
import CreatorPortfolioView from '../creator/CreatorPortfolioView';

export default function PortfolioView() {
  const { mode } = useMode();

  // Redirect to Creator Portfolio View if in Creator Mode (FREE)
  if (mode === 'FREE') {
    return <CreatorPortfolioView />;
  }

  // --- CORE MODE LOGIC BELOW ---
  
  const { address } = useAccount();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { virtualBalance, portfolio } = useUserStore();

  const { data: usdcBalance } = useBalance({
      address,
      token: THETANUTS_CONFIG.ASSETS.USDC.address as `0x${string}`,
  });
  
  // Core Mode uses mock balance (virtualBalance) as requested in previous tasks
  const displayBalance = virtualBalance;
  const activePositionsCount = portfolio.filter(p => p.isOpen).length;

  useEffect(() => {
    async function loadHistory() {
        if (!address) {
            setLoading(false);
            return;
        }
        const data = await fetchUserHistory(address);
        setHistory(data || []);
        setLoading(false);
    }
    loadHistory();
  }, [address]);
  
  return (
    <div className="space-y-6">
        
        {/* Mock Portfolio Value Card (Core Mode) */}
        <div className="bg-linear-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Mock Portfolio Value</span>
                <div className="text-4xl font-black font-mono mt-2 mb-1">
                    ${displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                    <TrendingUp size={14} />
                    +12.5% vs last week
                </div>
            </div>
            {/* Decoration */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3">
                    <Wallet size={20} />
                </div>
                <span className="text-gray-400 text-xs font-bold uppercase block">Available Cash</span>
                <span className="text-xl font-bold text-gray-900 font-mono">
                     {displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                </span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-3">
                    <PieChart size={20} />
                </div>
                <span className="text-gray-400 text-xs font-bold uppercase block">Active Positions</span>
                <span className="text-xl font-bold text-gray-900 font-mono">{activePositionsCount}</span>
            </div>
        </div>
        
        {/* Core Positions Container */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Your Positions</h3>
             </div>
             
             <div className="p-4">
                 <MyPositionsView />
             </div>
        </div>

    </div>
  );
}
