"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function NovaGuardian() {
  return (
    <motion.div 
      animate={{ y: [0, -10, 0] }} 
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#A1E3F9] overflow-hidden shadow-[0_0_20px_rgba(161,227,249,0.5)] z-20 bg-[#D1F8EF]"
    >
      <Image 
        src="/onboarding/nova-icon.png" 
        width={160} 
        height={160} 
        alt="Nova Guardian" 
        className="w-full h-full object-cover"
        priority
      />
    </motion.div>
  );
}
