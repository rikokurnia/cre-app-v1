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
            className="text-6xl md:text-8xl font-heading leading-[0.85] uppercase tracking-tighter"
          >
            Predict Creators on <span className="text-white drop-shadow-[0_4px_0_rgba(54,116,181,1)]">Farcaster</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl font-body max-w-2xl text-[#3674B5]/80"
          >
            The first prediction market powered by <span className="font-bold">Thetanuts</span> & <span className="font-bold">Base</span>. Build your deck, trade options, and win rewards.
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
              Fantasy Cards <br/>
              <span className="text-[#A1E3F9]">Meets</span> <br/>
              Options Trading
            </h2>
            <p className="text-xl font-body opacity-90 leading-relaxed">
              We merged the addictiveness of card collecting with the depth of financial derivatives. 
              Buy NFT cards of your favorite creators on Base, then use Thetanuts RFQ options to bet on their engagement metrics.
            </p>
            <div className="flex gap-4 pt-4">
              <div className="bg-[#3674B5]/50 p-4 rounded-lg flex items-center gap-3">
                <Trophy size={32} />
                <div>
                  <div className="font-heading text-xl">Fantasy</div>
                  <div className="text-sm">Collect & Compete</div>
                </div>
              </div>
              <div className="bg-[#3674B5]/50 p-4 rounded-lg flex items-center gap-3">
                <Zap size={32} />
                <div>
                  <div className="font-heading text-xl">Options</div>
                  <div className="text-sm">Bet & Hedge</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 relative h-[500px] w-full flex items-center justify-center">
             {/* Abstract Graphic: Card floating over a graph */}
             <div className="w-64 h-96 bg-[#D1F8EF] rounded-xl border-4 border-[#3674B5] shadow-[20px_20px_0px_0px_#3674B5] relative z-10 rotate-[-6deg] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-[#578FCA] rounded-full mb-4 animate-pulse"></div>
                <div className="font-heading text-3xl text-[#3674B5]">@dwr</div>
                <div className="font-body text-[#3674B5]">Rare Card</div>
             </div>
             <div className="w-64 h-96 bg-[#3674B5] rounded-xl border-4 border-[#D1F8EF] shadow-xl absolute z-0 rotate-[6deg] opacity-80 flex flex-col items-center justify-center text-[#D1F8EF]">
                 <div className="font-heading text-2xl">CALL OPTION</div>
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
                    On-Chain Settlement
                  </h3>
                  <p className="text-[#3674B5]/70 leading-relaxed border-l-4 border-[#578FCA] pl-4">
                    All specific trades and payouts are settled on Base L2. Transparent, immutable, and gas-efficient.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-3xl font-heading text-[#3674B5] mb-2 group-hover:translate-x-2 transition-transform cursor-default">
                    Real-Time Neynar Data
                  </h3>
                  <p className="text-[#3674B5]/70 leading-relaxed border-l-4 border-[#578FCA] pl-4">
                    We fetch engagement metrics directly from the Farcaster protocol via Neynar, ensuring your predictions are based on live truth.
                  </p>
                </div>
                <div className="group">
                  <h3 className="text-3xl font-heading text-[#3674B5] mb-2 group-hover:translate-x-2 transition-transform cursor-default">
                    Liquid Options via Thetanuts
                  </h3>
                  <p className="text-[#3674B5]/70 leading-relaxed border-l-4 border-[#578FCA] pl-4">
                    Leverage RFQ-powered liquidity for instant execution on your calls and puts. No more waiting for a counterparty.
                  </p>
                </div>
             </div>
             <div className="bg-[#3674B5] p-8 rounded-2xl rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl">
                <div className="border-2 border-dashed border-[#A1E3F9] p-8 rounded-xl h-full flex flex-col justify-center items-center text-[#D1F8EF] text-center">
                   <Shield size={64} className="mb-6 opacity-80" />
                   <h4 className="font-heading text-3xl mb-4">Secure & Audited</h4>
                   <p className="font-body text-sm opacity-70">
                     Smart contracts audited and secured by the best in DeFi. Your funds are safe on Base.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ECOSYSTEM (TRUST) */}
      <section className="py-24 bg-[#A1E3F9] text-center">
        <h2 className="text-2xl font-body font-bold text-[#3674B5]/50 uppercase tracking-widest mb-12">Powered By</h2>
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
           <h2 className="text-6xl font-heading uppercase">Ready to enter the Arena?</h2>
           <p className="font-body text-xl max-w-xl mx-auto opacity-80">
             Join thousands of predictors and creators building the future of SocialFi on Base.
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
