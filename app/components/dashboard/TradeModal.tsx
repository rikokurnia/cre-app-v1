"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, ArrowDownRight, Info, Sparkles, ReceiptText, Loader2 } from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import { useQuestStore } from "@/utils/store/questStore";
import ShareButton from "../sharing/ShareButton";
import { useMode } from "@/app/store/ModeContext";
import { useSignals } from "@/utils/hooks/useSignals";
import CoreTradeFlow from "./CoreTradeFlow";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/app/config/contracts";
import { parseUnits, formatUnits } from "viem";

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
  const { mode } = useMode();
  const { getSignalForCreator } = useSignals();
  
  // Free/Creator Mode State
  const [amount, setAmount] = useState(100);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Mock Store (Still used for UI consistency)
  const { addPosition } = useUserStore();
  const { trackEvent } = useQuestStore();

  // Wagmi / On-Chain State
  const { address } = useAccount();
  const { virtualBalance } = useUserStore();
  
  // New Hybrid Logic: Send a 0 ETH Transaction to self for "Proof of Trade"
  const { sendTransaction, data: tradeTxHash, isPending: isTradePending } = useSendTransaction();
  const { isLoading: isTradeLoading, isSuccess: isTradeSuccess } = useWaitForTransactionReceipt({ hash: tradeTxHash });

  // Post-Tx Effects
  useEffect(() => {
    if (isTradeSuccess && creator) {
        // Optimistic UI Update: Add to local store so Portfolio updates instantly
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
            txHash: tradeTxHash // Store Tx Hash!
          };
      
          addPosition(position);
          trackEvent('TRADE_COUNT');
          trackEvent('TRADE_VOLUME', amount);
          setIsSuccess(true);
          setAmount(100);
    }
  }, [isTradeSuccess, creator, tradeType, amount, tradeTxHash, addPosition, trackEvent]);

  const presetAmounts = [50, 100, 250, 500, 1000];

  if (!isOpen || !creator) return null;

  const signal = getSignalForCreator(creator.fid);

  // --- FREE MODE LOGIC ---
  const potentialPayout = tradeType === 'CALL' ? amount * 1.8 : amount * 1.8;
  const isInsufficientBalance = amount > virtualBalance;

  const handleAction = () => {
    if (isInsufficientBalance) return;
    if (!address) return;

    // Trigger a 0 ETH transaction to self as "Proof of Trade"
    sendTransaction({
        to: address, 
        value: parseUnits('0', 18), 
    });
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  }

  // Loading State Helper
  // Loading State Helper
  const isProcessing = isTradePending || isTradeLoading;
  const processingText = "Broadcasting Transaction...";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isProcessing ? undefined : handleClose}
          className="ABSOLUTE inset-0 bg-black/60 backdrop-blur-sm fixed"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#A1E3F9] z-[101]"
        >
          {/* Header */}
          <div className={`px-6 py-4 flex items-center justify-between border-b ${
            mode === 'CORE' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white border-[#A1E3F9]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img src={creator.pfp_url} alt={creator.username} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className={`font-heading text-lg ${mode === 'CORE' ? 'text-white' : 'text-[#3674B5]'}`}>
                  {mode === 'CORE' ? 'Follow Signal' : 'Place Prediction'}
                </h3>
                <p className={`text-xs ${mode === 'CORE' ? 'text-slate-400' : 'text-gray-400'}`}>@{creator.username}</p>
              </div>
            </div>
            {!isProcessing && (
                <button onClick={onClose} className={`p-1 rounded-full transition-colors ${
                    mode === 'CORE' ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'
                }`}>
                <X size={20} />
                </button>
            )}
          </div>

          {/* Body */}
          <div className="p-0">
            {mode === 'CORE' ? (
                // --- CORE MODE UI ---
                <div className="p-6">
                    <CoreTradeFlow signal={signal} onClose={onClose} />
                </div>
            ) : (
                // --- FREE/CREATOR MODE UI ---
                  isSuccess ? (
                   <div className="p-8 text-center">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${tradeType === 'CALL' ? 'bg-[#D1F8EF]' : 'bg-[#1E293B]/10'}`}>
                       <Sparkles className={tradeType === 'CALL' ? 'text-[#3674B5]' : 'text-[#1E293B]'} size={40} />
                     </div>
                     <h2 className="text-2xl font-heading text-[#3674B5] mb-2">Trade Scored!</h2>
                     <p className="text-gray-500 mb-2">
                       You successfully placed a ${amount} {tradeType === 'CALL' ? 'IGNITE' : 'ECLIPSE'} on @{creator.username}.
                     </p>
                     
                     <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-400 font-mono bg-gray-50 py-1 px-2 rounded-lg mx-auto w-fit">
                        <ReceiptText size={12} />
                        Tx: {tradeTxHash?.slice(0, 6)}...{tradeTxHash?.slice(-4)}
                     </div>

                     <div className="space-y-3">
                       <ShareButton 
                         text={`Just placed a $${amount} ${tradeType} trade on @${creator.username} in CreatorArena! 🔮 My entry: ${creator.score}. See on Base Sepolia!`}
                         className="w-full justify-center py-4 text-lg"
                         label="Share on Warpcast"
                         onShare={() => trackEvent('SHARE_ACTION')}
                       />
                       <button
                         onClick={handleClose}
                         className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                       >
                         Done
                       </button>
                     </div>
                   </div>
                ) : (
                  <div className="p-6">
                    {/* Header Gradient Strip for Free Mode */}
                    <div className={`-mx-6 -mt-6 mb-6 p-4 ${tradeType === 'CALL' ? 'bg-[#A1E3F9] text-[#3674B5]' : 'bg-[#1E293B] text-white'} relative flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                            {tradeType === 'CALL' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                            <span className="font-heading text-2xl">{tradeType === 'CALL' ? 'IGNITE' : 'ECLIPSE'}</span>
                        </div>
                    </div>

                    {showTutorial && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-[#D1F8EF] rounded-lg border border-[#A1E3F9] text-sm text-[#3674B5] relative"
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
                            <strong>On-Chain Prediction (Base Sepolia)</strong>
                            <p className="mt-1 text-xs opacity-80">
                              {tradeType === 'CALL' 
                                ? "You're betting this creator will IGNITE 🔥"
                                : "You're predicting an ECLIPSE 🌑"}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
      
                    <div className="space-y-6">
                      {/* Current Score */}
                      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-sm text-gray-500">Current Score</div>
                        <div className="font-pixel text-2xl text-[#3674B5]">{creator.score}</div>
                      </div>
        
                      {/* Amount Input */}
                      <div>
                        <label className="block text-sm text-gray-500 mb-2">Trade Amount (Arena USD)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                            disabled={isProcessing}
                            className="w-full pl-8 pr-4 py-3 bg-white border-2 border-[#A1E3F9] rounded-xl text-xl font-bold text-[#3674B5] focus:outline-none focus:border-[#3674B5] transition-colors disabled:bg-gray-100"
                          />
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {presetAmounts.map((preset) => (
                            <button
                              key={preset}
                              onClick={() => setAmount(preset)}
                              disabled={isProcessing}
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
                      {isInsufficientBalance && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm flex items-center gap-2">
                          <Info size={16} />
                          Insufficient Balance: ${virtualBalance.toFixed(2)}
                        </div>
                      )}
        
                      {/* Action Button */}
                      <button
                        onClick={handleAction}
                        disabled={isInsufficientBalance || amount <= 0 || isProcessing}
                        className={`w-full py-4 rounded-xl font-heading text-xl uppercase transition-all flex items-center justify-center gap-2 ${
                          tradeType === 'CALL'
                            ? 'bg-[#A1E3F9] hover:bg-[#8CDCF8] text-[#3674B5] disabled:bg-gray-300 disabled:text-gray-500'
                            : 'bg-[#1E293B] hover:bg-[#334155] text-white disabled:bg-gray-300 disabled:text-gray-500'
                        } disabled:cursor-not-allowed`}
                      >
                         {isProcessing ? (
                             <>
                                <Loader2 className="animate-spin" size={24} />
                                {processingText}
                             </>
                         ) : (
                             `Place ${tradeType === 'CALL' ? 'IGNITE' : 'ECLIPSE'} Trade`
                         )}
                      </button>
        
                      {/* Balance Info */}
                      <div className="text-center text-sm text-gray-400">
                        Balance: <span className="font-bold text-[#3674B5]">${virtualBalance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )
            )}
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
