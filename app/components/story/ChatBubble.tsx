"use client";

import { TypeAnimation } from "react-type-animation";

interface ChatBubbleProps {
  text: string;
  onComplete?: () => void;
  onClick: () => void;
  isLast?: boolean;
}

export default function ChatBubble({ text, onComplete, onClick, isLast }: ChatBubbleProps) {
  return (
    <div 
      onClick={onClick}
      className={`max-w-3xl w-full mx-4 mt-8 cursor-pointer group ${isLast ? 'cursor-default' : ''}`}
    >
      <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-[#A1E3F9]/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-h-[150px] relative transition-transform hover:scale-[1.01] hover:shadow-[0_8px_40px_rgb(161,227,249,0.3)]">
        {/* Name Tag */}
        <div className="absolute -top-4 left-6 bg-[#578FCA] text-white px-4 py-1 rounded-full font-heading uppercase text-lg border-2 border-[#A1E3F9] shadow-md">
          Nova
        </div>

        {/* Typing Text */}
        <div className="font-pixel text-[#3674B5] text-sm md:text-base leading-loose max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#578FCA] scrollbar-track-transparent">
          <TypeAnimation
            sequence={[
              text,
              () => { if (onComplete) onComplete() }
            ]}
            wrapper="p"
            cursor={true}
            speed={50}
            omitDeletionAnimation={true}
          />
        </div>

        {/* Continue Indicator */}
        {!isLast && (
          <div className="absolute bottom-4 right-4 text-[#578FCA] text-xs font-pixel animate-pulse opacity-0 group-hover:opacity-100 transition-opacity">
            Click to continue ▼
          </div>
        )}
      </div>
    </div>
  );
}
