'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, Zap, Radio } from 'lucide-react';
import ChannelSignalCard from './ChannelSignalCard';

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

interface Mood {
  overall: string;
  bullishPercent: number;
  eth: { count: number; bullish: number };
  btc: { count: number; bullish: number };
}

export default function CoreModeView() {
  const [signals, setSignals] = useState<ChannelSignal[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ETH' | 'BTC'>('ALL');
  const [source, setSource] = useState<string>('');

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/core/channels');
      const data = await res.json();
      setSignals(data.signals || []);
      setMood(data.mood || null);
      setSource(data.source || '');
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const handleTrade = (asset: 'ETH' | 'BTC', direction: 'CALL' | 'PUT') => {
    // TODO: Open Thetanuts trade modal
    console.log(`Trade ${asset} ${direction}`);
    alert(`Opening Thetanuts: ${asset} ${direction}`);
  };

  const filteredSignals = signals.filter(s => {
    if (filter === 'ALL') return true;
    return s.asset === filter;
  });

  const bullishCount = signals.filter(s => s.sentiment === 'BULLISH').length;
  const bearishCount = signals.filter(s => s.sentiment === 'BEARISH').length;

  return (
    <div className="space-y-6">
      {/* Simulation Warning */}
      {source === 'simulation_fallback' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <Zap className="text-amber-500" size={16} />
          <span>
            <strong>Simulation Mode Active:</strong> Live Farcaster API quota exceeded (402). Showing real-time market simulations.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="text-purple-600" size={24} />
            Community Signals
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Live crypto sentiment from Farcaster channels
          </p>
        </div>
        <button
          onClick={fetchSignals}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Mood Meters */}
      {mood && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Mood */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-5 text-white"
          >
            <p className="text-sm opacity-80 mb-1">Community Mood</p>
            <div className="flex items-center gap-3">
              {mood.overall === 'BULLISH' ? (
                <TrendingUp size={32} />
              ) : (
                <TrendingDown size={32} />
              )}
              <div>
                <p className="text-3xl font-bold">{mood.bullishPercent}%</p>
                <p className="text-sm opacity-80">Bullish</p>
              </div>
            </div>
          </motion.div>

          {/* ETH Mood */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-5 text-white"
          >
            <p className="text-sm opacity-80 mb-1">ETH Sentiment</p>
            <div className="flex items-center gap-3">
              <Zap size={32} />
              <div>
                <p className="text-3xl font-bold">{mood.eth.bullish}/{mood.eth.count}</p>
                <p className="text-sm opacity-80">Bullish Signals</p>
              </div>
            </div>
          </motion.div>

          {/* BTC Mood */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white"
          >
            <p className="text-sm opacity-80 mb-1">BTC Sentiment</p>
            <div className="flex items-center gap-3">
              <Zap size={32} />
              <div>
                <p className="text-3xl font-bold">{mood.btc.bullish}/{mood.btc.count}</p>
                <p className="text-sm opacity-80">Bullish Signals</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'ETH', 'BTC'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {bullishCount} bullish · {bearishCount} bearish
        </div>
      </div>

      {/* Signals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <Radio size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No signals found. Try refreshing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSignals.map((signal, i) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ChannelSignalCard signal={signal} onTrade={handleTrade} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Trade Buttons */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-3 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTrade('ETH', 'CALL')}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-full shadow-lg flex items-center gap-2"
        >
          <TrendingUp size={18} />
          ETH CALL
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTrade('BTC', 'CALL')}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full shadow-lg flex items-center gap-2"
        >
          <TrendingUp size={18} />
          BTC CALL
        </motion.button>
      </div>
    </div>
  );
}
