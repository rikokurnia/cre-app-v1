"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LineChart, 
  Trophy, 
  Layers, 
  Wallet, 
  Sparkles
} from "lucide-react";
import { useUserStore } from "@/app/store/useUserStore";

export default function FutureNavbar() {
  const pathname = usePathname();
  const { virtualBalance } = useUserStore();

  const NAV_ITEMS = [
    { name: "Market", path: "/dashboard", icon: LineChart },
    { name: "Leaderboard", path: "/dashboard/leaderboard", icon: Trophy },
    { name: "My Deck", path: "/dashboard/deck", icon: Layers },
    { name: "Portfolio", path: "/dashboard/portfolio", icon: Wallet },
  ];

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
          {/* Animated Gradient Border (Looping Outline) */}
          <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#A1E3F9_0%,#3674B5_25%,#A1E3F9_50%,#3674B5_75%,#A1E3F9_100%)] animate-[spin_4s_linear_infinite]" />
          
          {/* Inner Content Container */}
          <div className="bg-white/70 backdrop-blur-md relative rounded-full flex items-center gap-1 md:gap-2 px-2 py-2 shadow-2xl border border-white/50">
            
            {/* Free Mode Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 mr-2">
               <Sparkles size={12} className="text-amber-500 fill-amber-500 animate-pulse" />
               <span className="text-[10px] font-bold text-[#3674B5] tracking-tight whitespace-nowrap">FREE MODE</span>
            </div>
            
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
                      className="absolute inset-0 bg-gradient-to-br from-[#3674B5] to-[#578FCA] rounded-full shadow-md"
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

            {/* Balance Pill (Unified) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-full transition-colors cursor-default">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Balance</span>
                <span className="font-mono text-sm text-[#3674B5] font-bold">${virtualBalance.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </>
  );
}
