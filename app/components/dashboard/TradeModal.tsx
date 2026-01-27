"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownRight, Info, Sparkles } from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";

interface Creator {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  score: number;
}

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator | null;
  tradeType: 'CALL' | 'PUT';
}

export default function TradeModal({ isOpen, onClose, creator, tradeType }: TradeModalProps) {
  const [amount, setAmount] = useState(100);
  const [showTutorial, setShowTutorial] = useState(true);
  const { virtualBalance, addPosition } = useUserStore();

  if (!creator) return null;

  const potentialPayout = tradeType === 'CALL' 
    ? amount * 1.8 // 80% profit on correct CALL
    : amount * 1.8; // 80% profit on correct PUT

  const handleTrade = () => {
    if (amount > virtualBalance) {
      alert('Not enough virtual balance!');
      return;
    }

    const position = {
      id: `${creator.fid}-${tradeType}-${Date.now()}`,
      creatorSymbol: creator.username,
      creatorFid: creator.fid,
      creatorName: creator.display_name,
      creatorPfp: creator.pfp_url,
      type: tradeType,
      entryPrice: creator.score,
      amount: amount,
      isOpen: true,
      createdAt: new Date().toISOString(),
    };

    addPosition(position);
    onClose();
    setAmount(100);
  };

  const presetAmounts = [50, 100, 250, 500, 1000];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className={`p-6 ${tradeType === 'CALL' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'} text-white relative`}>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <img 
                  src={creator.pfp_url} 
                  alt={creator.username}
                  className="w-14 h-14 rounded-full border-2 border-white shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${creator.username}`;
                  }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    {tradeType === 'CALL' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    <span className="font-heading text-2xl">{tradeType}</span>
                  </div>
                  <div className="text-white/80">@{creator.username}</div>
                </div>
              </div>
            </div>

            {/* Tutorial Tooltip */}
            {showTutorial && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 mt-4 p-3 bg-[#D1F8EF] rounded-lg border border-[#A1E3F9] text-sm text-[#3674B5] relative"
              >
                <button 
                  onClick={() => setShowTutorial(false)}
                  className="absolute top-2 right-2 text-[#3674B5]/50 hover:text-[#3674B5]"
                >
                  <X size={14} />
                </button>
                <div className="flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Paper Trading Mode</strong>
                    <p className="mt-1 text-xs opacity-80">
                      {tradeType === 'CALL' 
                        ? "You're predicting this creator's score will GO UP. If it rises, you win!"
                        : "You're predicting this creator's score will GO DOWN. If it drops, you win!"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Current Score */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500">Current Score</div>
                <div className="font-pixel text-2xl text-[#3674B5]">{creator.score}</div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">Trade Amount (Virtual USDC)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full pl-8 pr-4 py-3 bg-white border-2 border-[#A1E3F9] rounded-xl text-xl font-bold text-[#3674B5] focus:outline-none focus:border-[#3674B5] transition-colors"
                  />
                </div>
                
                {/* Preset Amounts */}
                <div className="flex gap-2 mt-3">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset)}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        amount === preset 
                          ? 'bg-[#3674B5] text-white border-[#3674B5]' 
                          : 'bg-white text-[#3674B5] border-[#A1E3F9] hover:bg-[#D1F8EF]'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potential Payout */}
              <div className="p-4 bg-gradient-to-r from-[#D1F8EF] to-[#A1E3F9]/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#3674B5]/70">Potential Payout</div>
                  <div className="flex items-center gap-1">
                    <Sparkles size={16} className="text-amber-500" />
                    <span className="font-pixel text-xl text-[#3674B5]">${potentialPayout.toFixed(0)}</span>
                  </div>
                </div>
                <div className="text-xs text-[#3674B5]/50 mt-1">+80% if your prediction is correct</div>
              </div>

              {/* Balance Warning */}
              {amount > virtualBalance && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm flex items-center gap-2">
                  <Info size={16} />
                  Not enough balance! You have ${virtualBalance.toLocaleString()}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleTrade}
                disabled={amount > virtualBalance || amount <= 0}
                className={`w-full py-4 rounded-xl font-heading text-xl uppercase transition-all ${
                  tradeType === 'CALL'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white disabled:bg-gray-300'
                    : 'bg-rose-500 hover:bg-rose-600 text-white disabled:bg-gray-300'
                } disabled:cursor-not-allowed`}
              >
                {amount > virtualBalance ? 'Insufficient Balance' : `Place ${tradeType} Trade`}
              </button>

              {/* Balance Info */}
              <div className="text-center text-sm text-gray-400">
                Your balance: <span className="font-bold text-[#3674B5]">${virtualBalance.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
