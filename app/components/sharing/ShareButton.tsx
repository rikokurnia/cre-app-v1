"use client";

import { Share2 } from "lucide-react";

interface ShareButtonProps {
  text: string;
  embeds?: string[];
  className?: string;
  label?: string;
  onShare?: () => void;
}

export default function ShareButton({ text, embeds, className, label = "Share on Warpcast", onShare }: ShareButtonProps) {
  const handleShare = () => {
    if (onShare) onShare();
    // Construct Warpcast intent URL
    const baseUrl = "https://warpcast.com/~/compose";
    const params = new URLSearchParams();
    params.append("text", text);
    
    if (embeds && embeds.length > 0) {
      embeds.forEach(embed => params.append("embeds[]", embed));
    }

    const intentUrl = `${baseUrl}?${params.toString()}`;
    window.open(intentUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-[#7C65C1] hover:bg-[#6952A3] text-white rounded-lg font-bold transition-all shadow-sm ${className}`}
    >
      <Share2 size={18} />
      {label}
    </button>
  );
}
