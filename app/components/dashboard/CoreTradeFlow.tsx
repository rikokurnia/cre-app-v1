"use client";

import { useState, useEffect } from "react";
import { useThetanuts } from "@/utils/hooks/useThetanuts";
import { useAccount, useReadContract, useWriteContract, useBalance } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, Zap, Wallet, ArrowRightLeft } from "lucide-react";
import { ERC20_ABI } from "@/utils/contracts/thetanuts";
import SwapModal from "./SwapModal";
import { useUserStore } from "@/app/store/useUserStore";

interface CoreTradeFlowProps {
  signal?: any;
  onClose: () => void;
}

export default function CoreTradeFlow({ signal, onClose }: CoreTradeFlowProps) {
  const { orders, fetchOrders, loading: ordersLoading, fillOrder, OPTION_BOOK_ADDRESS, USDC_ADDRESS } = useThetanuts();
  const { address } = useAccount();
  const { coreBalance, addPosition } = useUserStore();
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [amount, setAmount] = useState<string>("0.001");
  const [step, setStep] = useState<'SELECT' | 'TRADE' | 'SUCCESS'>('SELECT');
  const [txHash, setTxHash] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter relevant orders based on signal
  const relevantOrders = orders.filter(o => 
    o.asset === signal?.asset && 
    o.type === (signal?.type === 'BULLISH' ? 'CALL' : 'PUT')
  ).slice(0, 3); // Just take top 3 for simplicity

  // Use coreBalance for checks in Core Mode (Mock Trading)
  const usdcBalance = coreBalance; 
  const tradeCost = selectedOrder ? parseFloat(amount) * selectedOrder.premium : 0;
  const hasInsufficientBalance = tradeCost > usdcBalance;

  const handleTrade = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const randomHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTxHash(randomHash);
      
      // Update Local Store (Deduct Balance)
      addPosition({
          id: `core-${Date.now()}`,
          creatorSymbol: signal?.asset || 'ETH',
          creatorFid: 0, // 0 = Core Mode
          creatorName: `Option ${selectedOrder.type} ${selectedOrder.strike}`,
          creatorPfp: 'https://avatar.vercel.sh/core',
          type: selectedOrder.type === 'CALL' ? 'CALL' : 'PUT',
          entryPrice: selectedOrder.strike,
          amount: tradeCost,
          isOpen: true,
          createdAt: new Date().toISOString(),
      });

      setStep('SUCCESS');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };


  if (ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#3674B5] mb-2" />
        <p className="text-sm text-gray-500">Scanning option book...</p>
      </div>
    );
  }

  if (step === 'SUCCESS') {
    return (
      <div className="text-center py-8">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 size={32} />
        </motion.div>
        <h3 className="font-heading text-xl text-green-600 mb-2">Trade Executed!</h3>
        <p className="text-gray-500 text-sm mb-6">
          You have successfully followed the signal.
        </p>
        <div className="text-xs text-center text-gray-400 mb-4 bg-gray-50 py-2 rounded">
            Transaction Hash: <span className="font-mono text-gray-600">{txHash}</span>
        </div>
        <button 
            onClick={onClose}
            className="mt-6 w-full py-3 bg-gray-100 rounded-lg font-bold text-gray-600"
        >
            Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Swap Modal Overlay */}
      <SwapModal 
        isOpen={showSwap} 
        onClose={() => setShowSwap(false)}
        onSuccess={() => {
            setShowSwap(false);
        }}
      />

      {/* Signal Summary */}
      <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3">
        <div className={`p-2 rounded-full ${signal?.type === 'BULLISH' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
            <Zap size={16} />
        </div>
        <div>
            <div className="text-xs text-gray-400 font-bold">SIGNAL</div>
            <div className="font-heading text-sm text-[#3674B5]">
                {signal?.type} on {signal?.asset}
            </div>
        </div>
      </div>

      {/* Step 1: Select Option */}
      {step === 'SELECT' && (
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-500">Available Options</h4>
            {relevantOrders.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-sm">
                    No matching liquidity found for this signal.
                </div>
            ) : (
                relevantOrders.map((order, i) => (
                    <div 
                        key={i}
                        onClick={() => {
                            setSelectedOrder(order);
                            setStep('TRADE'); // Skip APPROVE since we use mock balance
                        }}
                        className="border border-[#A1E3F9] p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors flex justify-between items-center"
                    >
                        <div>
                            <div className="font-bold text-[#3674B5]">${order.strike} Strike</div>
                            <div className="text-xs text-gray-400">Exp: {new Date(parseInt(order.expiry) * 1000).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-emerald-600">${order.premium.toFixed(2)}</div>
                            <div className="text-xs text-gray-400">Premium</div>
                        </div>
                    </div>
                ))
            )}
        </div>
      )}

      {/* Step 2: Trade (Approve skipped) */}
      {step === 'TRADE' && (
        <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
                 <div className="flex justify-between mb-2">
                    <span className="text-gray-500 text-sm">Option</span>
                    <span className="font-bold">{signal?.asset} {signal?.type} @ ${selectedOrder?.strike}</span>
                 </div>
                 <div className="flex justify-between mb-4">
                    <span className="text-gray-500 text-sm">Premium</span>
                    <span className="font-bold text-emerald-600">${selectedOrder?.premium.toFixed(2)}</span>
                 </div>
                 
                 <label className="block text-xs font-bold text-gray-400 mb-1">Contracts Amount</label>
                 <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border rounded p-2 mb-2 font-mono text-sm"
                 />
                 <div className="text-xs text-gray-400 text-right mb-2">
                    Total Cost: ${tradeCost.toFixed(2)} USDC
                 </div>

                 {/* Balance Check */}
                 <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <span className="text-xs text-gray-400">Your Balance</span>
                    <span className={`text-xs font-bold ${hasInsufficientBalance ? 'text-rose-500' : 'text-gray-600'}`}>
                        {usdcBalance.toFixed(2)} USDC
                    </span>
                 </div>
            </div>

            {hasInsufficientBalance ? (
                <button 
                  onClick={() => setShowSwap(true)}
                  className="w-full py-3 bg-amber-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-amber-600 animate-pulse"
                >
                  <ArrowRightLeft size={18} />
                  Swap ETH for USDC
                </button>
            ) : (
                 <button 
                    onClick={handleTrade}
                    disabled={isProcessing}
                    className="w-full py-3 bg-emerald-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                 >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    CONFIRM TRADE
                 </button>
            )}
            
            <button onClick={() => setStep('SELECT')} className="w-full text-xs text-gray-400 hover:text-gray-600">
                Back to Selection
            </button>
        </div>
      )}

    </div>
  );
}
