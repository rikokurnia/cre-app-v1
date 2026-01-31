'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Wallet, Repeat, Info } from 'lucide-react';

const TOKENS = [
  { id: 'ETH', name: 'Ethereum', icon: '/logo_token/eth-icon.png', price: 3450.20 },
  { id: 'BTC', name: 'Bitcoin', icon: '/logo_token/btc-icon.png', price: 67200.50 },
  { id: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png', price: 145.20 }, // Placeholder icon
  { id: 'DOGE', name: 'Dogecoin', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png', price: 0.12 }, // Placeholder icon
];

export default function CoreSwapView() {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simple mock calculation
  const usdcAmount = amount ? (parseFloat(amount) * fromToken.price).toFixed(2) : '0.00';

  const handleSwap = () => {
    if (!amount) return;
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Successfully swapped ${amount} ${fromToken.id} to ${usdcAmount} USDC!`);
      setAmount('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
        <div className="bg-blue-100 p-2 rounded-lg h-fit text-blue-600">
          <Info size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-800">Prepare for Ignition</h4>
          <p className="text-xs text-blue-600 mt-1">
            Trading options requires USDC as collateral. Swap your assets here to fund your account.
          </p>
        </div>
      </div>

      {/* SWAP CARD */}
      <div className="bg-white border-2 border-gray-100 rounded-3xl p-2 shadow-sm relative">
        
        {/* FROM SECTION */}
        <div className="bg-gray-50 rounded-2xl p-4 transition-colors hover:bg-gray-100">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">From</span>
            <span className="text-xs font-bold text-gray-400">Balance: 2.45 {fromToken.id}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
               <select 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 value={fromToken.id}
                 onChange={(e) => setFromToken(TOKENS.find(t => t.id === e.target.value) || TOKENS[0])}
               >
                 {TOKENS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
               </select>
               <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-200 group-hover:border-blue-300 transition-all font-bold min-w-[120px]">
                 <img src={fromToken.icon} alt={fromToken.name} className="w-6 h-6 rounded-full" />
                 {fromToken.id}
               </button>
            </div>

            <input 
              type="number" 
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-right text-3xl font-mono font-bold text-gray-900 outline-none placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* SWAP ICON (Floating) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-white p-2 rounded-xl border-4 border-white shadow-sm">
            <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
              <ArrowDown size={20} />
            </div>
          </div>
        </div>

        {/* TO SECTION (USDC FIXED) */}
        <div className="bg-white rounded-2xl p-4 mt-2">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">To (Collateral)</span>
            <span className="text-xs font-bold text-gray-400">Balance: $120.50</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-100 font-bold min-w-[120px] text-blue-800">
               {/* USDC Icon placeholder using emoji/text for now or generic dollar */}
               <div className="w-6 h-6 rounded-full bg-[#2775CA] flex items-center justify-center text-white text-[10px] font-bold">$</div>
               USDC
            </div>

            <div className="w-full text-right text-3xl font-mono font-bold text-gray-900">
              {usdcAmount}
            </div>
          </div>
        </div>

      </div>

      {/* SWAP BUTTON */}
      <button 
        onClick={handleSwap}
        disabled={isLoading || !amount}
        className="w-full bg-[#3674B5] hover:bg-[#2A598A] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Repeat size={20} />
            Convert to USDC
          </>
        )}
      </button>

      <div className="text-center text-xs text-gray-400 font-mono">
        1 {fromToken.id} ≈ ${fromToken.price.toLocaleString()} USDC
      </div>

    </div>
  );
}
