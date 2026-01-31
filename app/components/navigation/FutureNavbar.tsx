"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Trophy, 
  Layers, 
  Wallet, 
  Sparkles,
  Zap,
  Droplets
} from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";
import { useMode } from "@/app/store/ModeContext";
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/app/config/contracts";
import { formatUnits } from "viem";

export default function FutureNavbar() {
  const pathname = usePathname();
  const { virtualBalance, coreBalance } = useUserStore();
  const { mode, setMode } = useMode();
  const { address, isConnected, connector } = useAccount();
  const isSmartWallet = connector?.id === 'coinbaseWalletSDK';
  
  // Fetch Arena Token Balance (Base Sepolia) - REMOVED for Hybrid Mode
  // We now use virtualBalance for consistency + Real Hash for "Proof"

  // Reset Store if Address Changes (New User Logic)
  const { currentAddress, setCurrentAddress, resetBalance: resetStore } = useUserStore();
  
  useEffect(() => {
    if (address && currentAddress !== address) {
        console.log("New user detected, resetting store...");
        resetStore();
        setCurrentAddress(address);
    }
  }, [address, currentAddress, resetStore, setCurrentAddress]);
  
  const NAV_ITEMS = mode === 'CORE' 
    ? [
        { name: "Home", path: "/dashboard", icon: LineChart },
        { name: "Portfolio", path: "/dashboard/portfolio", icon: Wallet },
      ]
    : [
        { name: "Home", path: "/dashboard", icon: LineChart },
        { name: "Leaderboard", path: "/dashboard/leaderboard", icon: Trophy },
        { name: "My Deck", path: "/dashboard/deck", icon: Layers },
        { name: "Portfolio", path: "/dashboard/portfolio", icon: Wallet },
      ];

  const toggleMode = () => {
    if (mode === 'FREE') {
      if (!isConnected) {
        // Could trigger wallet connect here
        return;
      }
      setMode('CORE');
    } else {
      setMode('FREE');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        
        {/* Main Dock Container */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-auto relative p-[2px] rounded-full overflow-hidden"
        >
          {/* Animated Gradient Border */}
          <div className={`absolute inset-0 ${
            mode === 'CORE' 
              ? 'bg-[conic-gradient(from_0deg_at_50%_50%,#F59E0B_0%,#EF4444_25%,#F59E0B_50%,#EF4444_75%,#F59E0B_100%)]' 
              : 'bg-[conic-gradient(from_0deg_at_50%_50%,#A1E3F9_0%,#3674B5_25%,#A1E3F9_50%,#3674B5_75%,#A1E3F9_100%)]'
          } animate-[spin_4s_linear_infinite]`} />
          
          {/* Inner Content Container */}
          <div className="bg-white/70 backdrop-blur-md relative rounded-full flex items-center gap-1 md:gap-2 px-2 py-2 shadow-2xl border border-white/50">
            
            {/* Mode Toggle Button */}
            <button
              onClick={toggleMode}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border mr-2 transition-all ${
                mode === 'CORE'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
              }`}
            >
              {mode === 'CORE' ? (
                <>
                  <Zap size={12} className="fill-white" />
                  <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">CORE MODE</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-[#3674B5] tracking-tight whitespace-nowrap">CREATOR MODE</span>
                </>
              )}
            </button>
            
            <div className="w-px h-6 bg-gray-200 hidden md:block" />

            {/* Nav Items */}
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className="relative px-4 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all group min-w-[50px] md:min-w-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-full shadow-md ${
                        mode === 'CORE'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                          : 'bg-gradient-to-br from-[#3674B5] to-[#578FCA]'
                      }`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  <span className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#3674B5]'}`}>
                    <item.icon size={18} className={isActive ? "fill-current" : ""} />
                  </span>
                  
                  <span className={`relative z-10 text-xs font-bold transition-all duration-300 ${isActive ? 'text-white block ml-1' : 'text-gray-500 group-hover:text-[#3674B5] hidden md:block'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

             {/* Balance Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-full transition-colors cursor-default">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                  {mode === 'CORE' ? 'USDC' : 'Arena USD'}
                </span>
                <span className={`font-mono text-sm font-bold ${mode === 'CORE' ? 'text-amber-600' : 'text-[#3674B5]'}`}>
                   ${(mode === 'CORE' ? coreBalance : virtualBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>


              
              {/* Wallet Type Badge */}
              {isConnected && (
                <div className={`ml-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter shadow-sm ${
                  isSmartWallet 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isSmartWallet ? 'SMART' : 'EOA'}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
}
