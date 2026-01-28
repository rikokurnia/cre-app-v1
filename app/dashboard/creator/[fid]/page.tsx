"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Users, MessageSquare, Heart, Repeat, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import TradeModal from "@/app/components/dashboard/TradeModal";

interface Cast {
  hash: string;
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
}

interface CreatorDetail {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  bio: string;
  follower_count: number;
  following_count: number;
  power_badge: boolean;
  score: number;
  recent_casts: Cast[];
}

export default function CreatorDetailPage({ params }: { params: Promise<{ fid: string }> }) {
  const resolvedParams = use(params);
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trade Modal
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'CALL' | 'PUT'>('CALL');

  useEffect(() => {
    async function fetchCreator() {
      try {
        setLoading(true);
        const res = await fetch(`/api/creators/${resolvedParams.fid}`);
        
        if (!res.ok) {
          throw new Error('Creator not found');
        }
        
        const data = await res.json();
        setCreator(data.creator);
      } catch (err) {
        setError('Could not load creator details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCreator();
  }, [resolvedParams.fid]);

  const handleTrade = (type: 'CALL' | 'PUT') => {
    setTradeType(type);
    setIsTradeModalOpen(true);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 w-24 bg-gray-200 rounded mb-8" />
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100" />
          <div className="p-8">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full -mt-16" />
              <div className="flex-1 pt-4">
                <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-heading text-[#3674B5] mb-2">Creator Not Found</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/dashboard" className="text-[#3674B5] hover:underline">
          ← Back to Market
        </Link>
      </div>
    );
  }

  const scoreColor = creator.score >= 800 ? 'text-emerald-500' : 
                     creator.score >= 500 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[#3674B5] hover:text-[#2A598A] mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Market
      </Link>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden border border-[#A1E3F9] shadow-lg mb-8"
      >
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#3674B5] via-[#578FCA] to-[#A1E3F9] relative">
          {creator.power_badge && (
            <div className="absolute top-4 right-4 bg-amber-400 text-amber-900 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-md">
              <Zap size={16} /> Power Badge
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-xl -mt-20 overflow-hidden bg-gray-100 flex-shrink-0">
              <img 
                src={creator.pfp_url} 
                alt={creator.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${creator.username}`;
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-heading text-[#3674B5]">{creator.display_name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-400">@{creator.username}</span>
                    <a 
                      href={`https://warpcast.com/${creator.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3674B5] hover:text-[#578FCA] transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Score</div>
                  <div className={`font-pixel text-4xl ${scoreColor}`}>{creator.score}</div>
                </div>
              </div>

              {/* Bio */}
              {creator.bio && (
                <p className="mt-4 text-gray-600 leading-relaxed">{creator.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-gray-400" />
                  <span className="font-bold text-[#3674B5]">{(creator.follower_count / 1000).toFixed(1)}K</span>
                  <span className="text-gray-400">followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#3674B5]">{(creator.following_count / 1000).toFixed(1)}K</span>
                  <span className="text-gray-400">following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trade Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <button 
              onClick={() => handleTrade('CALL')}
              className="flex items-center justify-center gap-2 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-heading text-xl transition-colors shadow-md"
            >
              <ArrowUpRight size={24} /> IGNITE
            </button>
            <button 
              onClick={() => handleTrade('PUT')}
              className="flex items-center justify-center gap-2 py-4 bg-rose-500 text-white rounded-xl hover:bg-rose-600 font-heading text-xl transition-colors shadow-md"
            >
              <ArrowDownRight size={24} /> ECLIPSE
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recent Casts */}
      <div>
        <h2 className="text-2xl font-heading text-[#3674B5] mb-4">Recent Casts</h2>
        
        {creator.recent_casts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">💬</div>
            <div className="text-gray-400">No recent casts found</div>
          </div>
        ) : (
          <div className="space-y-4">
            {creator.recent_casts.map((cast, index) => (
              <motion.div
                key={cast.hash}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-[#A1E3F9] transition-colors"
              >
                <p className="text-gray-700 leading-relaxed mb-3">{cast.text}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart size={14} /> {cast.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat size={14} /> {cast.recasts}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={14} /> {cast.replies}
                    </span>
                  </div>
                  <span className="text-gray-300">{formatDate(cast.timestamp)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        creator={creator ? {
          fid: creator.fid,
          username: creator.username,
          display_name: creator.display_name,
          pfp_url: creator.pfp_url,
          score: creator.score,
        } : null}
        tradeType={tradeType}
      />
    </div>
  );
}
