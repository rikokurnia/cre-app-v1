"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Zap, RefreshCw, Target, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useMode } from "@/app/store/ModeContext";
import { useSignals } from "@/utils/hooks/useSignals";

interface LeaderboardEntry {
  rank: number;
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  score: number;
  follower_count: number;
  power_badge: boolean;
  change_24h: number;
}

interface TokenCaller {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  total_calls: number;
  accuracy: number;
  last_call: { asset: 'ETH' | 'BTC'; type: 'BULLISH' | 'BEARISH' };
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const { mode } = useMode();

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/creators/leaderboard?limit=20');
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-linear-to-r from-amber-400 to-yellow-300 text-amber-900';
    if (rank === 2) return 'bg-linear-to-r from-gray-300 to-gray-200 text-gray-700';
    if (rank === 3) return 'bg-linear-to-r from-orange-400 to-orange-300 text-orange-900';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-amber-500" size={32} />
            <h2 className="text-4xl font-heading text-[#3674B5]">Leaderboard</h2>
          </div>
          <p className="text-[#3674B5]/60">
            Top performing Farcaster creators by engagement score
          </p>
        </div>
        <button 
          onClick={fetchLeaderboard}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#A1E3F9] rounded-full hover:bg-[#D1F8EF] transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs font-medium text-[#3674B5] hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* Content: Single Ranking Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-[#A1E3F9] shadow-sm overflow-hidden"
      >
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-linear-to-r from-[#3674B5] to-[#578FCA] text-white text-sm font-medium uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Creator</div>
          <div className="col-span-2 text-center">Score</div>
          <div className="col-span-2 text-center">24h Change</div>
          <div className="col-span-2 text-center">Followers</div>
        </div>

        {/* Creators List */}
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 animate-pulse">
              <div className="col-span-1"><div className="h-8 w-8 bg-gray-200 rounded-full" /></div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
              <div className="col-span-2 flex justify-center"><div className="h-4 w-12 bg-gray-200 rounded" /></div>
              <div className="col-span-2 flex justify-center"><div className="h-4 w-16 bg-gray-200 rounded" /></div>
              <div className="col-span-2 flex justify-center"><div className="h-4 w-16 bg-gray-200 rounded" /></div>
            </div>
          ))
        ) : (
          leaderboard.map((entry, index) => (
            <motion.div
              key={entry.fid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-[#D1F8EF]/30 transition-colors"
            >
              <Link href={`/dashboard/creator/${entry.fid}`} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                {/* Rank */}
                <div className="col-span-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(entry.rank)}`}>
                    {entry.rank}
                  </div>
                </div>

                {/* Creator */}
                <div className="col-span-5 flex items-center gap-3">
                  <img 
                    src={entry.pfp_url} 
                    alt={entry.username}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${entry.username}`;
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-lg text-[#3674B5]">{entry.display_name}</span>
                      {entry.power_badge && (
                        <Zap size={14} className="text-amber-500" />
                      )}
                    </div>
                    <span className="text-sm text-gray-400">@{entry.username}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="font-pixel text-xl text-[#3674B5]">{entry.score}</span>
                </div>

                {/* 24h Change */}
                <div className="col-span-2 flex items-center justify-center">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                    entry.change_24h >= 0 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-rose-50 text-rose-600'
                  }`}>
                    {entry.change_24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {entry.change_24h >= 0 ? '+' : ''}{entry.change_24h}
                  </div>
                </div>

                {/* Followers */}
                <div className="col-span-2 flex items-center justify-center text-gray-500">
                  {(entry.follower_count / 1000).toFixed(1)}K
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Total Count */}
      <div className="mt-4 text-center text-sm text-gray-400">
        Showing {leaderboard.length} of {total} creators
      </div>
    </div>
  );
}
