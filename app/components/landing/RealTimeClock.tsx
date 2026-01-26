"use client";

import { useEffect, useState } from "react";

export default function RealTimeClock() {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Component mounted, safe to show
    setMounted(true);
    
    // Initial set
    const updateTime = () => {
      const now = new Date();
      // Format: "Jakarta: 10:42:05 PM"
      const formatted = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Jakarta",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(`JAKARTA: ${formatted}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch by rendering nothing on server

  return (
    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[#3674B5]/30 bg-[#D1F8EF]/50 backdrop-blur-sm text-[#3674B5] font-body text-xs font-bold tracking-widest uppercase">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      {time}
    </div>
  );
}
