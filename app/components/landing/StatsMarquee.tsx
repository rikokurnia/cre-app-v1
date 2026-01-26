"use client";

import Marquee from "react-fast-marquee";

export default function StatsMarquee() {
  return (
    <div className="w-full bg-[#578FCA] py-3 border-y border-[#3674B5] overflow-hidden">
      <Marquee gradient={false} speed={40} className="text-[#D1F8EF] font-body text-sm uppercase tracking-widest">
        <span className="mx-8">Total Volume: $2.4M</span>
        <span className="mx-8">✦</span>
        <span className="mx-8">Top Creator: @dwr (Rank #1)</span>
        <span className="mx-8">✦</span>
        <span className="mx-8">Active Predictions: 1,240</span>
        <span className="mx-8">✦</span>
        <span className="mx-8">Base Block: 18459203</span>
        <span className="mx-8">✦</span>
        <span className="mx-8">Thetanuts Options: LIVE</span>
        <span className="mx-8">✦</span>
      </Marquee>
    </div>
  );
}
