"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Zap } from "lucide-react";
import Image from "next/image";

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
  const scoreColor = creator.score >= 800 ? 'text-emerald-500' : 
                     creator.score >= 500 ? 'text-amber-500' : 'text-rose-500';
  
  const change = creator.change_24h || 0;
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl overflow-hidden border border-[#A1E3F9] shadow-sm hover:shadow-xl transition-all group"
    >
      {/* Header Gradient */}
      <div className="h-20 bg-gradient-to-r from-[#3674B5] via-[#578FCA] to-[#A1E3F9] relative">
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-[#3674B5] shadow-sm">
            #{rank}
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

        {/* Score */}
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

        {/* Follower Count */}
        {creator.follower_count && (
          <div className="text-xs text-gray-400 mb-4">
            {(creator.follower_count / 1000).toFixed(1)}K followers
          </div>
        )}

        {/* Trade Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onTrade(creator, 'CALL')}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-bold text-sm border border-emerald-100 transition-colors group-hover:scale-[1.02]"
          >
            <ArrowUpRight size={16} /> IGNITE
          </button>
          <button 
            onClick={() => onTrade(creator, 'PUT')}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-sm border border-rose-100 transition-colors group-hover:scale-[1.02]"
          >
            <ArrowDownRight size={16} /> ECLIPSE
          </button>
        </div>
      </div>
    </motion.div>
  );
}
