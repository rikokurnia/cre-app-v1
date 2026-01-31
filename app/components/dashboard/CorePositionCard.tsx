"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Clock, DollarSign, Gift } from "lucide-react";
import { useState, useEffect } from "react";
import { formatUnits } from "viem";

interface CorePositionCardProps {
  position: any; // Thetanuts position object
}

export default function CorePositionCard({ position }: CorePositionCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const expiry = parseInt(position.expiry);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        setIsExpired(true);
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const mins = Math.floor((diff % 3600) / 60);
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [position.expiry]);

  const isCall = position.isCall; // Assuming API returns this boolean or type string

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#A1E3F9] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${isCall ? 'bg-emerald-500' : 'bg-rose-500'}`} />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCall ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            {isCall ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
          </div>
          <div>
            <h4 className="font-heading text-[#3674B5] text-lg">
                {position.asset} {isCall ? 'CALL' : 'PUT'}
            </h4>
            <div className="text-xs text-gray-500 font-mono">
                Strike: ${position.strike}
            </div>
          </div>
        </div>
        
        <div className="text-right">
             <div className="text-xs text-gray-400 uppercase font-bold">Size</div>
             <div className="font-bold text-slate-700">
                {position.collateralAmount ? formatUnits(position.collateralAmount, 6) : '0'} Contracts
             </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
            <Clock size={16} className="text-[#3674B5]" />
            <div>
                <div className="text-[10px] text-gray-400 uppercase">Expiry</div>
                <div className={`text-sm font-bold ${isExpired ? 'text-rose-500' : 'text-slate-600'}`}>
                    {timeLeft}
                </div>
            </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-500" />
            <div>
                <div className="text-[10px] text-gray-400 uppercase">Premium Paid</div>
                <div className="text-sm font-bold text-slate-600">
                    N/A {/* API needs to return cost basis if stored */}
                </div>
            </div>
        </div>
      </div>

      {isExpired && (
        <button 
            className="w-full mt-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
            <Gift size={16} /> Claim Payout
        </button>
      )}
    </motion.div>
  );
}
