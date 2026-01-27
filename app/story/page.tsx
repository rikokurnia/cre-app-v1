"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStoryStore } from "../store/useStoryStore";
import StoryPanel from "../components/story/StoryPanel";
import NovaGuardian from "../components/story/NovaGuardian";
import ChatBubble from "../components/story/ChatBubble";
import PixelImage from "../components/story/PixelImage";
import { motion, AnimatePresence } from "framer-motion";

// Content Framework from PRD
const STORY_CONTENT = [
  {
    id: 1,
    image: null, // Page 1 is special (Nova only)
    text: (time: string) => `Welcome to Creator Predict Base! I'm Nova, guardian of the Kingdom of Stars.\n\nRight now in Jakarta: ${time}.\n\nReady to help light up this kingdom with your smart predictions? Let's start the adventure!`
  },
  {
    id: 2,
    image: "/onboarding/page2.png",
    text: () => "Look at our Kingdom of Stars... it's so quiet and dark right now.\n\nThe creators in Farcaster used to light up the sky with their energy, but things have dimmed.\n\nYou are the new builder we need! Your predictions will bring the stars back to life."
  },
  {
    id: 3,
    image: "/onboarding/page3.png",
    text: () => "These are our Star Heroes – amazing creators from Farcaster!\n\nPick your favorites and collect their glowing cards.\n\nThe more energy they create (casts, likes, replies), the brighter their stars shine in the kingdom!"
  },
  {
    id: 4,
    image: "/onboarding/page4.png",
    text: () => "Now build your Star Deck! Combine your hero cards to make a powerful team.\n\nPredict which creators will shine the brightest this week – your guesses will light up the kingdom even more!\n\nEvery smart prediction adds new stars to our sky."
  },
  {
    id: 5,
    image: "/onboarding/page5.png",
    text: () => "Join the Weekly Star Festival competitions – weekly events, head-to-head challenges, and big leaderboards!\n\nThe better your predictions, the more rewards you earn for the kingdom (tokens and treasures).\n\nKeep predicting and watch the whole kingdom celebrate your wins!"
  },
  {
    id: 6,
    image: "/onboarding/page6.png", // Nova waving + wallet
    text: () => "The adventure starts right now! Connect your Base wallet and join me in lighting up the Kingdom of Stars.\n\nYour predictions can make you a legend here – let's make this kingdom the brightest in all of Base!\n\n❤️ Nova",
    isLast: true
  }
];

export default function StoryPage() {
  const router = useRouter();
  const { currentPage, nextPage, skipAll } = useStoryStore();
  const [jakartaTime, setJakartaTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Real-time Jakarta Clock for Page 1
    const updateTime = () => {
      setJakartaTime(new Date().toLocaleTimeString("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit", 
        hour12: true 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (currentPage < STORY_CONTENT.length - 1) {
      nextPage();
    } else {
      skipAll(); // Finish
      // router.push("/dashboard"); // Redirect handled by skipAll logic or here
    }
  };

  // Auto-redirect logic could go here if needed, but manual click is better for reading story
  
  if (!mounted) return null;

  const content = STORY_CONTENT[currentPage];
  const displayText = typeof content.text === 'function' ? content.text(jakartaTime) : content.text;

  return (
    <StoryPanel>
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4">
        
        {/* Progress Dots */}
        <div className="flex gap-2 mb-6">
          {STORY_CONTENT.map((_, idx) => (
             <div 
               key={idx} 
               className={`w-3 h-3 rounded-full transition-all ${idx === currentPage ? 'bg-[#578FCA] w-8' : 'bg-[#3674B5]/30'}`}
             />
          ))}
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPage} 
            className="flex flex-col items-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Nova is always present on Page 1, or maybe subtly present on all? 
                PRD says "Page 1: Splash + Hook", others have Pixel Images.
                Let's show Nova prominently on Page 1, and smaller or inside images on others if needed.
                But based on PRD "Foto pop-up", let's render Image if exists. 
             */}
            
            {content.isLast ? (
              // Splitted Layout for Final Page (Right Side Button)
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                {/* Left Side: Content */}
                <div className="flex-1 flex flex-col items-center w-full">
                  {content.image && <PixelImage src={content.image} alt={`Story Page ${content.id}`} />}
                  <ChatBubble 
                    text={displayText} 
                    onClick={handleNext} 
                    isLast={true}
                  />
                </div>

                {/* Right Side: CTA */}
                <div className="flex-1 flex flex-col items-center justify-center mt-8 md:mt-0">
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 2.5 }}
                     className="font-pixel text-[#3674B5] text-sm mb-4 text-center animate-bounce"
                   >
                     Now it's time to Click this 👇
                   </motion.div>
                   <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 3 }}
                    onClick={skipAll}
                    className="bg-[#578FCA] text-white px-8 py-4 rounded-full font-heading text-xl shadow-lg border-b-4 border-[#3674B5] hover:translate-y-1 active:border-b-0 hover:shadow-xl transition-all"
                  >
                    Connect Wallet
                  </motion.button>
                </div>
              </div>
            ) : (
              // Standard Layout for Pages 1-5
              <>
                {content.id === 1 ? (
                  <div className="mb-8 scale-125">
                    <NovaGuardian />
                  </div>
                ) : (
                  content.image && <PixelImage src={content.image} alt={`Story Page ${content.id}`} />
                )}

                <ChatBubble 
                  text={displayText} 
                  onClick={handleNext} 
                  isLast={false}
                />
              </>
            )}

          </motion.div>
        </AnimatePresence>
        
        {/* Skip Button */}
        <button 
          onClick={skipAll}
          className="fixed bottom-6 right-6 text-[#578FCA] font-pixel text-xs hover:underline opacity-50 hover:opacity-100"
        >
          SKIP STORY
        </button>

      </div>
    </StoryPanel>
  );
}
