"use client";

import { useEffect, useState, useCallback, useMemo } from "react";

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

interface UseSignalsReturn {
  signals: Signal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getSignalForCreator: (fid: number) => Signal | undefined;
  getSignalsForAsset: (asset: 'ETH' | 'BTC') => Signal[];
  ethSignals: Signal[];
  btcSignals: Signal[];
}

export function useSignals(): UseSignalsReturn {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/signals');
      const data = await res.json();
      
      if (data.error) {
        console.warn('Signals API warning:', data.error);
      }
      
      setSignals(data.signals || []);
    } catch (err) {
      console.error('Failed to fetch signals:', err);
      setError('Failed to load signals');
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchSignals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const getSignalForCreator = useCallback((fid: number) => {
    return signals.find(s => s.fid === fid);
  }, [signals]);

  const getSignalsForAsset = useCallback((asset: 'ETH' | 'BTC') => {
    return signals.filter(s => s.asset === asset);
  }, [signals]);

  const ethSignals = useMemo(() => signals.filter(s => s.asset === 'ETH'), [signals]);
  const btcSignals = useMemo(() => signals.filter(s => s.asset === 'BTC'), [signals]);

  return {
    signals,
    loading,
    error,
    refetch: fetchSignals,
    getSignalForCreator,
    getSignalsForAsset,
    ethSignals,
    btcSignals,
  };
}
