"use client";

import { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, AlertCircle, Zap, Sparkles } from "lucide-react";
import CreatorCard from "../components/dashboard/CreatorCard";
import TradeModal from "../components/dashboard/TradeModal";
import TokenCard from "../components/market/TokenCard";
import CoreFeedView from "../components/core/CoreFeedView";
import { useMode } from "@/app/store/ModeContext";
import { useSignals } from "@/utils/hooks/useSignals";

// Types
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

export default function DashboardPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  
  // Mode & Signals
  const { mode } = useMode();
  const { signals, ethSignals, btcSignals, loading: signalsLoading } = useSignals();
  
  // Mock prices (in production, fetch from CoinGecko/Chainlink)
  const [ethPrice] = useState(3250.42);
  const [btcPrice] = useState(62150.80);
  const [ethChange] = useState(2.34);
  const [btcChange] = useState(-1.15);

  // Trade Modal State
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedTradeType, setSelectedTradeType] = useState<'CALL' | 'PUT'>('CALL');
  const [selectedAsset, setSelectedAsset] = useState<'ETH' | 'BTC'>('ETH');

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/creators/trending');
      
      if (!res.ok) {
        throw new Error('Failed to fetch creators');
      }
      
      const data = await res.json();
      setCreators(data.creators || []);
      setLastUpdated(data.lastUpdated);
    } catch (err) {
      console.error("Failed to fetch creators", err);
      setError("Could not load creators. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch Creator data if we are in Creator Mode
    if (mode === 'FREE') {
        fetchCreators();
        const interval = setInterval(fetchCreators, 120000);
        return () => clearInterval(interval);
    }
  }, [mode]);

  const handleTrade = (creator: Creator, type: 'CALL' | 'PUT') => {
    setSelectedCreator(creator);
    setSelectedTradeType(type);
    setIsTradeModalOpen(true);
  };
  
  const handleTokenTrade = (asset: 'ETH' | 'BTC', type: 'CALL' | 'PUT', signal?: Signal) => {
    setSelectedAsset(asset);
    setSelectedTradeType(type);
    // Create a mock creator from signal for the modal
    if (signal) {
      setSelectedCreator({
        fid: signal.fid,
        username: signal.username,
        display_name: signal.display_name,
        pfp_url: signal.pfp_url,
        score: signal.confidence,
      });
    } else {
      setSelectedCreator({
        fid: 0,
        username: asset.toLowerCase(),
        display_name: asset === 'ETH' ? 'Ethereum' : 'Bitcoin',
        pfp_url: `/logo_token/${asset.toLowerCase()}-icon.png`,
        score: 0,
      });
    }
    setIsTradeModalOpen(true);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Render CoreFeedView when in CORE mode */}
      {mode === 'CORE' ? (
        <CoreFeedView />
      ) : (
        <>
          {/* Header */}
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-blue-500" size={28} />
            <h2 className="text-4xl font-heading text-[#3674B5]">
              Market View
            </h2>
          </div>
          <p className="text-[#3674B5]/60">
            Predict which Farcaster creators will shine brightest. Live Market Analysis.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="text-xs text-gray-400">
              Updated: {formatTime(lastUpdated)}
            </div>
          )}
          <button 
            onClick={fetchCreators}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#A1E3F9] rounded-full hover:bg-[#D1F8EF] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium text-[#3674B5]">Refresh</span>
          </button>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={fetchCreators}
            className="ml-auto text-sm underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Creator Signals Section */}
      <section>
        <h3 className="text-lg font-heading text-[#3674B5] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Trending Creators
        </h3>
        
        {/* Creator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-20 bg-linear-to-r from-gray-200 to-gray-100" />
                <div className="pt-10 px-5 pb-5">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 bg-gray-100 rounded" />
                    <div className="h-10 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : creators.length === 0 ? (
            // Empty State
            <div className="col-span-full text-center py-16">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-heading text-[#3674B5] mb-2">No Creators Found</h3>
              <p className="text-gray-400">Check back later for trending Farcaster creators.</p>
            </div>
          ) : (
            // Creator Cards
            creators.map((creator, index) => (
              <CreatorCard
                key={creator.fid}
                creator={creator}
                onTrade={handleTrade}
                rank={index + 1}
              />
            ))
          )}
        </div>
      </section>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        creator={selectedCreator}
        tradeType={selectedTradeType}
      />
        </>
      )}
    </div>
  );
}
