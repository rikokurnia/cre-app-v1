"use client";

import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NovaSidebar from "../components/dashboard/NovaSidebar";
import QuestWidget from "../components/gamification/QuestWidget";
import FutureNavbar from "../components/navigation/FutureNavbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const router = useRouter();

  // Protect Route
  useEffect(() => {
    if (!isConnected) {
      router.push("/login");
    }
  }, [isConnected, router]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F0F9FF] to-[#D1F8EF] selection:bg-[#3674B5] selection:text-white">
      
      {/* Top Navigation - actually Bottom now */}
      <FutureNavbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-8 px-4 md:px-8 pb-28 overflow-y-auto min-h-screen max-w-7xl mx-auto">
        {/* Creative Grid Background - Kingdom of Stars Theme */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          {/* SVG Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#3674B5" strokeWidth="0.5"/>
              </pattern>
              <linearGradient id="gridFade" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3674B5" stopOpacity="0.1"/>
                <stop offset="50%" stopColor="#578FCA" stopOpacity="0.05"/>
                <stop offset="100%" stopColor="#A1E3F9" stopOpacity="0.08"/>
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>
          
          {/* Floating Star Particles */}
          <div className="absolute inset-0">
            {/* Star 1 */}
            <div className="absolute w-1 h-1 bg-[#3674B5] rounded-full animate-pulse" 
                 style={{ top: '15%', left: '10%', animationDelay: '0s', animationDuration: '3s' }} />
            {/* Star 2 */}
            <div className="absolute w-1.5 h-1.5 bg-[#578FCA] rounded-full animate-pulse" 
                 style={{ top: '25%', right: '20%', animationDelay: '1s', animationDuration: '4s' }} />
            {/* Star 3 */}
            <div className="absolute w-1 h-1 bg-[#A1E3F9] rounded-full animate-pulse" 
                 style={{ top: '60%', left: '25%', animationDelay: '0.5s', animationDuration: '3.5s' }} />
            {/* Star 4 */}
            <div className="absolute w-2 h-2 bg-gradient-to-br from-[#3674B5] to-transparent rounded-full animate-pulse opacity-40" 
                 style={{ top: '40%', right: '35%', animationDelay: '2s', animationDuration: '5s' }} />
            {/* Star 5 */}
            <div className="absolute w-1 h-1 bg-[#578FCA] rounded-full animate-pulse" 
                 style={{ top: '75%', right: '15%', animationDelay: '1.5s', animationDuration: '4.5s' }} />
            {/* Star 6 (Corner Glow) */}
            <div className="absolute w-32 h-32 bg-gradient-radial from-[#A1E3F9]/20 to-transparent rounded-full blur-3xl" 
                 style={{ top: '-5%', right: '-5%' }} />
            {/* Star 7 (Bottom Glow) */}
            <div className="absolute w-40 h-40 bg-gradient-radial from-[#3674B5]/10 to-transparent rounded-full blur-3xl" 
                 style={{ bottom: '10%', left: '5%' }} />
          </div>
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {/* AI Assistant (Fixed Right) */}
      <NovaSidebar />
      
      {/* Gamification Widget (Floating Orb) */}
      <QuestWidget />
    </div>
  );
}
