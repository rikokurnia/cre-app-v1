"use client";

import { useMode } from "@/app/store/ModeContext";
import { motion } from "framer-motion";
import { Sparkles, Zap, Info } from "lucide-react";
import { useState } from "react";

export default function ModeToggle() {
  const { mode, setMode } = useMode();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center gap-3 relative">
      {/* Toggle Container */}
      <div className="bg-white/80 backdrop-blur-sm border border-[#A1E3F9] p-1 rounded-full flex relative shadow-sm">
        
        {/* Animated Background Pill */}
        <motion.div
          className="absolute top-1 bottom-1 bg-linear-to-r from-[#3674B5] to-[#578FCA] rounded-full shadow-md z-0"
          initial={false}
          animate={{
            left: mode === "FREE" ? 4 : "50%",
            width: "calc(50% - 4px)",
            x: mode === "FREE" ? 0 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* FREE Mode Button */}
        <button
          onClick={() => setMode("FREE")}
          className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === "FREE" ? "text-white" : "text-[#3674B5] hover:bg-black/5"
          }`}
        >
          <Sparkles size={14} />
          <span className="font-heading">CREATOR MODE</span>
        </button>

        {/* CORE Mode Button */}
        <button
          onClick={() => setMode("CORE")}
          className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            mode === "CORE" ? "text-white" : "text-[#3674B5] hover:bg-black/5"
          }`}
        >
          <Zap size={14} className={mode === "CORE" ? "fill-current" : ""} />
          <span className="font-heading">CORE MODE</span>
        </button>
      </div>

      {/* Info Tooltip Icon */}
      <button 
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="text-[#3674B5]/60 hover:text-[#3674B5] transition-colors"
      >
        <Info size={18} />
      </button>

      {/* Tooltip Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: showTooltip ? 1 : 0, scale: showTooltip ? 1 : 0.9, y: showTooltip ? 0 : 10 }}
        className="absolute top-full mt-3 right-0 w-64 bg-white border border-[#A1E3F9] rounded-xl shadow-xl p-4 z-50 pointer-events-none"
      >
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
              <Sparkles size={12} /> CREATOR MODE
            </div>
            <p className="text-xs text-gray-500">
              Paper trading with virtual money. Predict creator performance risk-free.
            </p>
          </div>
          <div className="h-px bg-gray-100" />
          <div>
            <div className="flex items-center gap-2 text-[#3674B5] font-bold text-xs mb-1">
              <Zap size={12} /> CORE MODE
            </div>
            <p className="text-xs text-gray-500">
              Real options trading on Base Mainnet. Follow creator signals to trade ETH/BTC options.
            </p>
            <div className="mt-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded inline-block">
              Requires Wallet + USDC
            </div>
          </div>
        </div>
        
        {/* Arrow */}
        <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-[#A1E3F9] transform rotate-45" />
      </motion.div>
    </div>
  );
}
