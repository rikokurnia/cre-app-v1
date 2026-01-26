"use client";

import { motion } from "framer-motion";

export default function HeroGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Horizon Fade */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#A1E3F9] to-transparent z-10" />
      
      {/* 3D Grid Floor */}
      <div className="grid-floor" />
      
      {/* Optional: Add some floating particles or retro sun if needed later */}
    </div>
  );
}
