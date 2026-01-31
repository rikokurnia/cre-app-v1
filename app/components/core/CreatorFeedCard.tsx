'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Repeat, MessageCircle, ChevronDown, ChevronUp, Users } from 'lucide-react';
import Image from 'next/image';

interface Cast {
  hash: string;
  author: {
    name: string;
    username: string;
    pfp: string;
    followerCount: number;
  };
  text: string;
  timestamp: string;
  likes: number;
  recasts: number;
  replies: number;
  embeds: any[];
}

export default function CreatorFeedCard({ cast }: { cast: Cast }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = cast.text.length > 280; // Twitter/Farcaster standard length warning
  
  // Format followers smoothly (e.g. 527.4K)
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
  };

  // Extract first image if exists
  const imageEmbed = cast.embeds.find(e => e.url && (e.url.endsWith('.png') || e.url.endsWith('.jpg') || e.url.endsWith('.jpeg')));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex gap-3 mb-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image 
            src={cast.author.pfp} 
            alt={cast.author.username}
            fill
            className="rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 leading-tight">{cast.author.name}</h3>
            <span className="text-xs font-medium text-[#3674B5] bg-blue-50 px-1.5 py-0.5 rounded-full">
              {formatNumber(cast.author.followerCount)} followers
            </span>
          </div>
          <div className="text-xs text-gray-500 flex gap-2">
            <span>@{cast.author.username}</span>
            <span>·</span>
            <time dateTime={cast.timestamp}>
              {new Date(cast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="pl-[60px]">
        <motion.div 
          animate={{ height: isExpanded ? 'auto' : 'auto' }}
          className="relative"
        >
          <p className={`text-gray-800 text-[15px] leading-relaxed whitespace-pre-line ${!isExpanded && isLongText ? 'line-clamp-3' : ''}`}>
            {cast.text}
          </p>
          
          {/* Read More Trigger */}
          {isLongText && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#3674B5] text-sm font-medium hover:underline mt-1 flex items-center gap-1 focus:outline-none"
            >
              {isExpanded ? (
                <>Show less <ChevronUp size={14}/></>
              ) : (
                <>Read more <ChevronDown size={14}/></>
              )}
            </button>
          )}
        </motion.div>

        {/* Image Attachment (if any) */}
        {imageEmbed && (
          <div className="mt-3 relative h-64 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            <Image 
              src={imageEmbed.url} 
              alt="Cast media"
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between mt-4 max-w-[300px]">
          <div className="flex items-center gap-1.5 text-gray-500 hover:text-rose-500 transition-colors cursor-default group">
            <div className="p-1.5 rounded-full group-hover:bg-rose-50 transition-colors">
              <Heart size={16} />
            </div>
            <span className="text-xs font-medium">{formatNumber(cast.likes)}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-500 transition-colors cursor-default group">
            <div className="p-1.5 rounded-full group-hover:bg-emerald-50 transition-colors">
              <Repeat size={16} />
            </div>
            <span className="text-xs font-medium">{formatNumber(cast.recasts)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors cursor-default group">
            <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
              <MessageCircle size={16} />
            </div>
            <span className="text-xs font-medium">{formatNumber(cast.replies)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
