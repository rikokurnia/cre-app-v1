"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Zap, SignalHigh, ExternalLink } from "lucide-react";
import { useMode } from "@/app/store/ModeContext";
import { useSignals } from "@/utils/hooks/useSignals";

interface Creator {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  score: number;
  follower_count?: number;
  power_badge?: boolean;
  trending_rank?: number;
  change_24h?: number;
}

interface CreatorCardProps {
  creator: Creator;
  onTrade: (creator: Creator, type: 'CALL' | 'PUT') => void;
  rank?: number;
}

export default function CreatorCard({ creator, onTrade, rank }: CreatorCardProps) {
  const { mode } = useMode();
  const { getSignalForCreator } = useSignals();
  const signal = getSignalForCreator(creator.fid);

  const scoreColor = creator.score >= 800 ? 'text-emerald-500' : 
                     creator.score >= 500 ? 'text-amber-500' : 'text-rose-500';
  
  const change = creator.change_24h || 0;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-xl transition-all group ${
        mode === 'CORE' && signal ? 'border-[#3674B5] ring-1 ring-[#3674B5]/20' : 'border-[#A1E3F9]'
      }`}
    >
      {/* Header Gradient */}
      <div className={`h-20 relative ${
        mode === 'CORE' 
          ? 'bg-linear-to-r from-[#1E293B] via-[#334155] to-[#475569]' // Darker for Core
          : 'bg-linear-to-r from-[#3674B5] via-[#578FCA] to-[#A1E3F9]'
      }`}>
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-[#3674B5] shadow-sm">
            #{rank}
          </div>
        )}
        
        {/* Signal Badge for Core Mode with Token Icon */}
        {mode === 'CORE' && signal && (
          <div className="absolute top-3 left-14 flex items-center gap-1">
            <div className="relative w-6 h-6">
              <Image
                src={`/logo_token/${signal.asset.toLowerCase()}-icon.png`}
                alt={signal.asset}
                fill
                className="object-contain"
              />
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
              signal.type === 'BULLISH' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {signal.type === 'BULLISH' ? '🚀' : '📉'}
            </div>
          </div>
        )}
        
        {/* Power Badge */}
        {creator.power_badge && (
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <Zap size={12} /> Power
          </div>
        )}
        
        {/* Avatar */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 border-4 border-white rounded-full overflow-hidden w-16 h-16 shadow-lg bg-gray-100">
          <img 
            src={creator.pfp_url} 
            alt={creator.username}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${creator.username}`;
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 px-5 pb-5 text-center">
        {/* Name */}
        <h3 className="font-heading text-xl text-[#3674B5] truncate">
          {creator.display_name}
        </h3>
        <p className="text-sm text-gray-400 mb-3">@{creator.username}</p>

        {/* Core Mode: Show Signal Info with Evidence Link */}
        {mode === 'CORE' && signal ? (
           <div className="mb-4 bg-gray-50 rounded-lg p-2 border border-dashed border-gray-200">
             <div className="flex items-center justify-between mb-1">
               <span className="text-xs text-gray-500 font-medium">Latest Signal</span>
               <a 
                 href={signal.cast_url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
               >
                 Evidence <ExternalLink size={10} />
               </a>
             </div>
             <div className="text-sm font-bold text-[#3674B5] leading-tight">
               &quot;{signal.reasoning}&quot;
             </div>
             <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
               <span>Target: {signal.asset}</span>
               <span>•</span>
               <span>Conf: {signal.confidence}%</span>
             </div>
           </div>
        ) : (
          /* Free Mode: Standard Score */
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
              <div className={`font-pixel text-2xl ${scoreColor}`}>
                {creator.score}
              </div>
            </div>
            
            {/* 24h Change */}
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider">24h</div>
              <div className={`flex items-center justify-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{change}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {mode === 'CORE' ? (
             <button 
                onClick={() => {
                   if (signal) {
                      onTrade(creator, signal.type === 'BULLISH' ? 'CALL' : 'PUT');
                   }
                }}
                disabled={!signal}
                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 ${
                  signal 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
             >
                <Zap size={18} />
                {signal ? 'Follow Signal' : 'No Signal'}
             </button>
          ) : (
            <>
              <button 
                onClick={() => onTrade(creator, 'CALL')}
                className="flex-1 py-3 bg-[#A1E3F9] hover:bg-[#8CDCF8] text-[#3674B5] rounded-xl font-bold shadow-lg shadow-[#A1E3F9]/20 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <TrendingUp size={18} />
                IGNITE
              </button>
              <button 
                onClick={() => onTrade(creator, 'PUT')}
                className="flex-1 py-3 bg-[#1E293B] hover:bg-[#334155] text-white rounded-xl font-bold shadow-lg shadow-[#1E293B]/20 transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <TrendingDown size={18} className="text-gray-400" />
                ECLIPSE
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
