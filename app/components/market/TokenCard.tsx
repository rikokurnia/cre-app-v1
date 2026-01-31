"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { useMode } from "@/app/store/ModeContext";

interface Signal {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  type: 'BULLISH' | 'BEARISH';
  asset: 'ETH' | 'BTC';
  confidence: number;
  reasoning: string;
  cast_hash: string;
  cast_text: string;
  cast_url: string;
  created_at: string;
  accuracy?: number;
}

interface TokenCardProps {
  asset: 'ETH' | 'BTC';
  price: number;
  change24h: number;
  signals: Signal[];
  onTrade: (asset: 'ETH' | 'BTC', type: 'CALL' | 'PUT', signal?: Signal) => void;
}

export default function TokenCard({ asset, price, change24h, signals, onTrade }: TokenCardProps) {
  const { mode } = useMode();
  const isPositive = change24h >= 0;
  
  const iconPath = asset === 'ETH' 
    ? '/logo_token/eth-icon.png' 
    : '/logo_token/btc-icon.png';
  
  const assetName = asset === 'ETH' ? 'Ethereum' : 'Bitcoin';
  
  // Get the strongest signal for this asset
  const strongestSignal = signals.length > 0 
    ? signals.reduce((a, b) => a.confidence > b.confidence ? a : b)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      {/* Header with Token Icon */}
      <div className={`p-6 ${asset === 'ETH' ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10' : 'bg-gradient-to-r from-orange-500/10 to-amber-500/10'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14">
              <Image
                src={iconPath}
                alt={asset}
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-2xl font-heading text-gray-900">{asset}</h3>
              <p className="text-sm text-gray-500">{assetName}</p>
            </div>
          </div>
          
          {/* 24h Change Badge */}
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${
            isPositive 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-rose-100 text-rose-700'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{change24h.toFixed(2)}%
          </div>
        </div>
        
        {/* Price Display */}
        <div className="mt-4">
          <span className="text-3xl font-mono font-bold text-gray-900">
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Signal Section (if any) */}
      {strongestSignal && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-gray-400">Top Signal</span>
            <a 
              href={strongestSignal.cast_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              View Evidence <ExternalLink size={10} />
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <img 
              src={strongestSignal.pfp_url} 
              alt={strongestSignal.username}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 truncate">@{strongestSignal.username}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  strongestSignal.type === 'BULLISH' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {strongestSignal.type === 'BULLISH' ? '🚀 BULLISH' : '📉 BEARISH'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{strongestSignal.reasoning}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Confidence</div>
              <div className="font-bold text-gray-900">{strongestSignal.confidence}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Trade Buttons */}
      <div className="p-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onTrade(asset, 'CALL', strongestSignal || undefined)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${
              mode === 'CORE'
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            <ArrowUpRight size={18} />
            {mode === 'CORE' ? 'BUY CALL' : 'IGNITE 🔥'}
          </button>
          
          <button
            onClick={() => onTrade(asset, 'PUT', strongestSignal || undefined)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${
              mode === 'CORE'
                ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            }`}
          >
            <ArrowDownRight size={18} />
            {mode === 'CORE' ? 'BUY PUT' : 'ECLIPSE 🌑'}
          </button>
        </div>
        
        {mode === 'CORE' && (
          <p className="text-xs text-gray-400 text-center mt-3">
            Real options trading on Thetanuts (Base mainnet)
          </p>
        )}
      </div>
    </motion.div>
  );
}
