"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, CheckCircle, ChevronLeft } from "lucide-react";
import { useQuestStore } from "@/utils/store/questStore";

export default function QuestWidget() {
  const { xp, level, quests, checkDailyReset, claimReward } = useQuestStore();
  const [isOpen, setIsOpen] = useState(false);

  // Check reset on mount
  useEffect(() => {
    checkDailyReset();
  }, [checkDailyReset]);

  // Calculate progress
  const nextLevelXp = Math.pow(level, 2) * 100;
  const prevLevelXp = Math.pow(level - 1, 2) * 100;
  const levelProgress = ((xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100;
  
  const completedCount = quests.filter(q => q.completed).length;
  const hasUnclaimedBy = quests.some(q => q.completed && !q.claimed);

  return (
    <>
      {/* Floating Orb (Trigger) - Hidden on mobile to prevent overlap */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden md:block fixed right-0 top-[35%] -translate-y-1/2 z-40 bg-white border-y border-l border-[#A1E3F9] p-2 rounded-l-xl shadow-lg hover:bg-[#D1F8EF] transition-all group ${
          isOpen ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }`}
      >
        <div className="flex flex-col items-center gap-1 relative">
          {/* Notification Dot */}
          {hasUnclaimedBy && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          )}
          {hasUnclaimedBy && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          )}

          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center border border-amber-300 shadow-sm group-hover:scale-110 transition-transform">
             <Trophy size={16} className="text-amber-600" />
          </div>
          <span className="text-[10px] font-heading text-[#3674B5] writing-vertical mt-1">LVL {level}</span>
          <ChevronLeft size={16} className="text-[#3674B5]" />
        </div>
      </button>

      {/* Expanded Panel (Floating) - Adjusted to top-[35%] to match Orb */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (Click outside to close) */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 100, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-4 top-[35%] -translate-y-1/2 z-50 w-72 bg-white rounded-2xl shadow-2xl border border-[#A1E3F9] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                  <Trophy size={80} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-heading text-2xl drop-shadow-sm">Level {level}</h3>
                      <p className="text-xs text-yellow-100 font-bold opacity-90">{xp} / {nextLevelXp} XP</p>
                    </div>
                    <div className="bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm text-xs font-bold border border-white/30">
                      Rank #42
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="relative w-full h-3 bg-black/20 rounded-full overflow-hidden border border-white/20">
                    <motion.div 
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(levelProgress, 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <div className="text-[10px] text-right mt-1 font-mono opacity-80">
                    {Math.floor(nextLevelXp - xp)} XP to next level
                  </div>
                </div>
              </div>

              {/* Quests List */}
              <div className="p-4 bg-gradient-to-b from-white to-gray-50 max-h-[300px] overflow-y-auto">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-amber-500" /> Daily Missions
                </h4>

                <div className="space-y-3">
                  {quests.map((quest) => (
                    <div key={quest.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#A1E3F9] transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className={`text-sm font-bold ${quest.completed ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {quest.title}
                          </p>
                          <p className="text-xs text-gray-400">{quest.description}</p>
                        </div>
                        <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                          +{quest.rewardXP} XP
                        </div>
                      </div>

                      <div className="relative">
                         <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div 
                                className={`h-full ${quest.completed ? 'bg-emerald-500' : 'bg-[#3674B5]'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((quest.current / quest.target) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {Math.min(quest.current, quest.target)}/{quest.target}
                            </span>
                         </div>

                         {/* Claim Button (Overlay) */}
                         {quest.completed && !quest.claimed && (
                           <motion.button
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             whileHover={{ scale: 1.05 }}
                             whileTap={{ scale: 0.95 }}
                             onClick={(e) => {
                               e.stopPropagation();
                               claimReward(quest.id);
                             }}
                             className="absolute top-0 right-0 -mt-8 px-3 py-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1 animate-bounce"
                           >
                             <Star size={12} className="fill-white" /> Claim
                           </motion.button>
                         )}
                      </div>
                    </div>
                  ))}
                </div>

                {quests.every(q => q.claimed) && (
                   <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                     <div className="text-2xl mb-1">🎉</div>
                     <p className="text-emerald-700 font-bold text-sm">All Daily Quests Completed!</p>
                     <p className="text-[10px] text-emerald-600">Come back tomorrow for new missions.</p>
                   </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
