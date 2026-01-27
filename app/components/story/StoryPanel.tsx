"use client";

import HeroGrid from "../landing/HeroGrid";

export default function StoryPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#D1F8EF]/20">
      {/* Reuse the 3D grid but maybe slightly dimmer or different gradient if needed. For now reuse HeroGrid for consistency */}
      <div className="absolute inset-0 z-0 opacity-50">
         <HeroGrid />
      </div>
      
      {/* Content Layer */}
      <div className="z-10 w-full h-full flex flex-col items-center justify-center relative">
        {children}
      </div>
    </div>
  );
}
