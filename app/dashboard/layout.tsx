"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, Trophy, Wallet, Layers, LogOut, Menu, X, Star } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const { virtualBalance, getOpenPositions } = useUserStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openPositions = getOpenPositions();

  // Protect Route
  useEffect(() => {
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected, router]);

  const NAV_ITEMS = [
    { name: "Market", path: "/dashboard", icon: LineChart },
    { name: "Leaderboard", path: "/dashboard/leaderboard", icon: Trophy },
    { name: "My Deck", path: "/dashboard/deck", icon: Layers },
    { name: "Portfolio", path: "/dashboard/portfolio", icon: Wallet },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#D1F8EF]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#3674B5] text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-gradient-to-b from-[#3674B5] to-[#2A598A] text-white flex-col fixed h-full shadow-2xl z-20">
        {/* Logo */}
        <div className="p-6 border-b border-[#578FCA]/30">
          <Link href="/" className="block">
            <h1 className="font-heading text-3xl tracking-widest text-[#D1F8EF] flex items-center gap-2">
              <Star className="text-amber-400" size={28} />
              ARENA
            </h1>
            <div className="text-xs text-[#A1E3F9]/70 font-pixel mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Free Mode
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading text-lg uppercase relative overflow-hidden ${
                  active 
                    ? "bg-white text-[#3674B5] shadow-lg" 
                    : "text-[#A1E3F9] hover:bg-[#578FCA]/50 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.name}
                {item.name === "Portfolio" && openPositions.length > 0 && (
                  <span className="ml-auto bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {openPositions.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Stats */}
        <div className="p-6 bg-black/20 border-t border-[#578FCA]/30">
          <div className="text-xs text-[#A1E3F9]/70 mb-1 uppercase tracking-wider">Virtual Balance</div>
          <div className="font-pixel text-2xl text-[#D1F8EF] mb-4">
            ${virtualBalance.toLocaleString()}
          </div>
          
          <button 
            onClick={() => { disconnect(); router.push("/login"); }}
            className="flex items-center gap-2 text-sm text-[#A1E3F9]/70 hover:text-white transition-colors w-full"
          >
            <LogOut size={16} /> Disconnect Wallet
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-30"
            />
            
            {/* Mobile Menu */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="md:hidden fixed left-0 top-0 w-72 h-full bg-gradient-to-b from-[#3674B5] to-[#2A598A] text-white z-40 shadow-2xl"
            >
              {/* Logo */}
              <div className="p-6 pt-16 border-b border-[#578FCA]/30">
                <h1 className="font-heading text-3xl tracking-widest text-[#D1F8EF] flex items-center gap-2">
                  <Star className="text-amber-400" size={28} />
                  ARENA
                </h1>
                <div className="text-xs text-[#A1E3F9]/70 font-pixel mt-1">Free Mode</div>
              </div>
              
              {/* Navigation */}
              <nav className="p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading text-lg uppercase ${
                        active 
                          ? "bg-white text-[#3674B5] shadow-lg" 
                          : "text-[#A1E3F9] hover:bg-[#578FCA]/50"
                      }`}
                    >
                      <Icon size={20} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Balance */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/20 border-t border-[#578FCA]/30">
                <div className="text-xs text-[#A1E3F9]/70 mb-1">Virtual Balance</div>
                <div className="font-pixel text-2xl text-[#D1F8EF]">
                  ${virtualBalance.toLocaleString()}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="md:ml-64 flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
