'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TrendingUp, TrendingDown, ExternalLink, ThumbsUp, Repeat2, Zap } from 'lucide-react';

interface ChannelSignal {
  id: string;
  channel: string;
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  text: string;
  asset: 'ETH' | 'BTC' | null;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  likes: number;
  recasts: number;
  timestamp: string;
  warpcastUrl: string;
}

interface Props {
  signal: ChannelSignal;
  onTrade: (asset: 'ETH' | 'BTC', direction: 'CALL' | 'PUT') => void;
}

export default function ChannelSignalCard({ signal, onTrade }: Props) {
  const isBullish = signal.sentiment === 'BULLISH';
  const timeAgo = getTimeAgo(signal.timestamp);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Header - Channel + Sentiment */}
      <div className={`px-4 py-2 flex items-center justify-between ${
        isBullish ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-gradient-to-r from-red-500 to-rose-500'
      }`}>
        <span className="text-white text-xs font-bold uppercase tracking-wider">
          /{signal.channel}
        </span>
        <div className="flex items-center gap-1.5 text-white">
          {isBullish ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span className="text-xs font-bold">{signal.sentiment}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-100">
            <Image
              src={signal.author.pfpUrl}
              alt={signal.author.displayName}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{signal.author.displayName}</p>
            <p className="text-xs text-gray-500">@{signal.author.username} · {timeAgo}</p>
          </div>
          {/* Asset Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            signal.asset === 'ETH' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {signal.asset}
          </div>
        </div>

        {/* Post Text */}
        <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
          {signal.text}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} />
            {signal.likes}
          </span>
          <span className="flex items-center gap-1">
            <Repeat2 size={12} />
            {signal.recasts}
          </span>
          <span className="flex items-center gap-1">
            <Zap size={12} className="text-yellow-500" />
            {signal.confidence}% confidence
          </span>
          <a 
            href={signal.warpcastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-purple-600 hover:text-purple-800"
          >
            View <ExternalLink size={10} />
          </a>
        </div>

        {/* Trade Button */}
        {signal.asset && (
          <button
            onClick={() => onTrade(signal.asset!, isBullish ? 'CALL' : 'PUT')}
            className={`w-full py-2.5 rounded-xl font-bold text-white transition-all ${
              isBullish 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
            }`}
          >
            Trade {signal.asset} {isBullish ? 'CALL' : 'PUT'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
