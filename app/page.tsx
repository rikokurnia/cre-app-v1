"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Zap, Shield, Users } from "lucide-react";

import HeroGrid from "./components/landing/HeroGrid";
import StatsMarquee from "./components/landing/StatsMarquee";
import RealTimeClock from "./components/landing/RealTimeClock";
import HowItWorks from "./components/landing/HowItWorks";

export default function Home() {
  
  // Auto-redirect Removed per user request

  return (
    <main className="min-h-screen bg-[#A1E3F9] text-[#3674B5] overflow-hidden selection:bg-[#3674B5] selection:text-[#A1E3F9]">
      
      {/* SECTION 1: HERO */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <HeroGrid /> {/* 3D Floor Background */}
        
        <div className="z-10 flex flex-col items-center gap-6 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <RealTimeClock />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-heading leading-[0.85] uppercase tracking-tighter"
          >
            Ignite Your Star in <span className="text-white drop-shadow-[0_4px_0_rgba(54,116,181,1)]">Nova's Kingdom</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl font-body max-w-2xl text-[#3674B5]/80"
          >
            Enter Nova's New City. Collect Star Cards, cast <span className="font-bold">Ignite</span> & <span className="font-bold">Eclipse</span> spells, and rule the Kingdom of Stars.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 mt-8"
          >
            <Link href="/story" className="px-8 py-4 bg-[#3674B5] text-[#D1F8EF] font-heading text-2xl uppercase border-b-4 border-[#2A598A] hover:translate-y-[2px] hover:border-b-2 active:border-b-0 active:translate-y-[4px] transition-all shadow-lg rounded-lg inline-block">
              Launch App
            </Link>
            <button className="px-8 py-4 bg-[#D1F8EF] text-[#3674B5] font-heading text-2xl uppercase border-b-4 border-[#3674B5]/30 hover:bg-white transition-all shadow-lg rounded-lg">
              Read Docs
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: STATS TICKER */}
      <StatsMarquee />

      {/* SECTION 3: CONCEPT (FLY WHEEL) */}
      <section className="py-24 px-6 md:px-12 bg-[#578FCA] text-[#D1F8EF] pattern-grid">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-6">
            <h2 className="text-5xl md:text-6xl font-heading uppercase leading-none">
              Collect Cards <br/>
              <span className="text-[#A1E3F9]">Cast Spells</span> <br/>
              Rule the Stars
            </h2>
            <p className="text-xl font-body opacity-90 leading-relaxed">
              Combine the magic of card collecting with the power of prediction. 
              Summon Creator Cards, use Ignite & Eclipse spells to predict their path, and rise as a legend in Nova's City.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="bg-[#3674B5]/50 p-4 rounded-lg flex items-center gap-3">
                <Trophy size={32} />
                <div>
                  <div className="font-heading text-xl">Star Collection</div>
                  <div className="text-sm">Summon & Upgrade</div>
                </div>
              </div>
              <div className="bg-[#3674B5]/50 p-4 rounded-lg flex items-center gap-3">
                <Zap size={32} />
                <div>
                  <div className="font-heading text-xl">Magic Spells</div>
                  <div className="text-sm">Ignite & Eclipse</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-[500px] w-full flex items-center justify-center">
             {/* Abstract Graphic: Card floating over a graph */}
             <div className="w-64 h-96 bg-[#D1F8EF] rounded-xl border-4 border-[#3674B5] shadow-[20px_20px_0px_0px_#3674B5] relative z-10 rotate-[-6deg] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-[#578FCA] rounded-full mb-4 animate-pulse"></div>
                <div className="font-heading text-3xl text-[#3674B5]">@dwr</div>
                <div className="font-body text-[#3674B5]">Hero Card</div>
             </div>
             <div className="w-64 h-96 bg-[#3674B5] rounded-xl border-4 border-[#D1F8EF] shadow-xl absolute z-0 rotate-[6deg] opacity-80 flex flex-col items-center justify-center text-[#D1F8EF]">
                 <div className="font-heading text-2xl">IGNITE SPELL</div>
                 <div className="text-4xl mt-2">+420%</div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="py-32 bg-[#A1E3F9] relative overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-heading text-[#3674B5] mb-4">How To Play</h2>
          <p className="font-body text-[#3674B5]/70 text-lg">Three simple steps to mastery.</p>
        </div>
        <HowItWorks />
      </section>

      {/* SECTION 5: FEATURES DEEP DIVE */}
      <section className="py-24 bg-[#D1F8EF] border-y border-[#3674B5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-12">
                 <div className="group">
                   <h3 className="text-3xl font-heading text-[#3674B5] mb-2 group-hover:translate-x-2 transition-transform cursor-default">
                     Immutable Star Ledger
                   </h3>
                   <p className="text-[#3674B5]/70 leading-relaxed border-l-4 border-[#578FCA] pl-4">
                     Recorded eternally on the Base L2 scrolls. Transparent, immutable, and gas-efficient magic.
                   </p>
                 </div>
                 <div className="group">
                   <h3 className="text-3xl font-heading text-[#3674B5] mb-2 group-hover:translate-x-2 transition-transform cursor-default">
                     Live Star Signals
                   </h3>
                   <p className="text-[#3674B5]/70 leading-relaxed border-l-4 border-[#578FCA] pl-4">
                     We channel the celestial energy of Farcaster directly via Neynar, ensuring your predictions are based on live truth.
                   </p>
                 </div>
                 <div className="group">
                   <h3 className="text-3xl font-heading text-[#3674B5] mb-2 group-hover:translate-x-2 transition-transform cursor-default">
                     Instant Magic Swaps
                   </h3>
                   <p className="text-[#3674B5]/70 leading-relaxed border-l-4 border-[#578FCA] pl-4">
                     Instant execution for your spells via Thetanuts liquidity. No more waiting for a counterparty to accept your magic.
                   </p>
                 </div>
              </div>
              <div className="bg-[#3674B5] p-8 rounded-2xl rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl">
                 <div className="border-2 border-dashed border-[#A1E3F9] p-8 rounded-xl h-full flex flex-col justify-center items-center text-[#D1F8EF] text-center">
                    <Shield size={64} className="mb-6 opacity-80" />
                    <h4 className="font-heading text-3xl mb-4">Protected by Guardians</h4>
                    <p className="font-body text-sm opacity-70">
                      Fortified by the strongest magic in DeFi. Your funds are safe in the Kingdom of Base.
                    </p>
                 </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ECOSYSTEM (TRUST) */}
      <section className="py-24 bg-[#A1E3F9] text-center">
        <h2 className="text-2xl font-body font-bold text-[#3674B5]/50 uppercase tracking-widest mb-12">Forged With</h2>
        <div className="flex flex-wrap justify-center items-center gap-16 px-6 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Placeholders for partner logos - using Text for now */}
           <div className="text-4xl font-heading text-[#3674B5]">BASE</div>
           <div className="text-4xl font-heading text-[#3674B5]">THETANUTS</div>
           <div className="text-4xl font-heading text-[#3674B5]">NEYNAR</div>
           <div className="text-4xl font-heading text-[#3674B5]">FARCASTER</div>
        </div>
      </section>

      {/* SECTION 7: FOOTER */}
      <footer className="bg-[#3674B5] text-[#D1F8EF] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
           <h2 className="text-6xl font-heading uppercase">Ready to Enter the Kingdom?</h2>
           <p className="font-body text-xl max-w-xl mx-auto opacity-80">
             Join thousands of citizens building the brightest future of SocialFi on Base.
           </p>
           <Link href="/story" className="px-12 py-5 bg-[#A1E3F9] text-[#3674B5] font-heading text-2xl uppercase hover:scale-105 transition-transform shadow-[0_0_20px_rgba(161,227,249,0.5)] rounded-lg inline-block">
             Launch App
           </Link>
           <div className="pt-20 flex justify-between items-end border-t border-[#D1F8EF]/20 mt-20">
              <div className="text-left">
                <div className="font-heading text-2xl mb-2">Creator Predict</div>
                <div className="text-sm opacity-60">© 2024 All Rights Reserved.</div>
              </div>
              <div className="flex gap-6">
                 <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
                 <Link href="#" className="hover:text-white transition-colors">Discord</Link>
                 <Link href="#" className="hover:text-white transition-colors">Docs</Link>
              </div>
           </div>
        </div>
      </footer>

    </main>
  );
}
