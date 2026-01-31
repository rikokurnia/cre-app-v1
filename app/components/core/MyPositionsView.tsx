'use client';
import { useUserStore } from '@/app/store/useUserStore';
import { Loader2, TrendingUp, TrendingDown, Clock, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MyPositionsView() {
  const { portfolio } = useUserStore();
  const [loading, setLoading] = useState(true);

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
      return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" /></div>;
  }

  const activePositions = portfolio.filter(p => p.isOpen);

  if (activePositions.length === 0) {
      return (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Positions</h3>
              <p className="text-gray-500">You haven't made any predictions yet. Go to Home to start predicting!</p>
          </div>
      );
  }

  return (
    <div className="space-y-4">
        {activePositions.map((pos) => {
             const isCall = pos.type === 'CALL';
             
             return (
                <div key={pos.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex justify-between items-center transition-all hover:bg-blue-50/30">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCall ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {isCall ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900">
                                {pos.creatorSymbol} ${pos.entryPrice.toLocaleString()} {isCall ? 'Call' : 'Put'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                                <span className="flex items-center gap-1 text-blue-500">
                                    <Clock size={10} /> Active Sequence
                                </span>
                                <span>•</span>
                                <span>Opened: {new Date(pos.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-bold text-gray-900">{(pos.amount / pos.entryPrice).toFixed(4)} Contracts</div>
                        <div className="text-[10px] font-black uppercase tracking-widest mt-1 text-blue-600">
                             On-Chain
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
  );
}
