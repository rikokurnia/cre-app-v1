import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Quest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
  type: 'TRADE_COUNT' | 'TRADE_VOLUME' | 'SHARE_ACTION';
}

interface QuestState {
  xp: number;
  level: number;
  quests: Quest[];
  lastReset: string; // ISO date string YYYY-MM-DD
  
  // Actions
  addXp: (amount: number) => void;
  checkDailyReset: () => void;
  trackEvent: (type: Quest['type'], amount?: number) => void;
  claimReward: (questId: string) => void;
}

const DAILY_QUESTS: Quest[] = [
  {
    id: 'daily_trades',
    title: 'Daily Trader',
    description: 'Place 3 trades today',
    target: 3,
    current: 0,
    rewardXP: 100,
    completed: false,
    claimed: false,
    type: 'TRADE_COUNT',
  },
  {
    id: 'daily_volume',
    title: 'High Roller',
    description: 'Trade volume over $500',
    target: 500,
    current: 0,
    rewardXP: 150,
    completed: false,
    claimed: false,
    type: 'TRADE_VOLUME',
  },
  {
    id: 'daily_share',
    title: 'Influencer',
    description: 'Share a position or trade',
    target: 1,
    current: 0,
    rewardXP: 50,
    completed: false,
    claimed: false,
    type: 'SHARE_ACTION',
  },
];

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      quests: DAILY_QUESTS,
      lastReset: new Date().toISOString().split('T')[0],

      addXp: (amount) => {
        const { xp } = get();
        const newXp = xp + amount;
        // Simple level formula: Level = floor(sqrt(XP / 100)) + 1
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
        set({ xp: newXp, level: newLevel });
      },

      checkDailyReset: () => {
        const { lastReset } = get();
        const today = new Date().toISOString().split('T')[0];
        
        if (lastReset !== today) {
          set({
            quests: DAILY_QUESTS.map(q => ({ ...q })), // Reset to default
            lastReset: today
          });
        }
      },

      trackEvent: (type, amount = 1) => {
        const { quests, addXp } = get();
        // Check reset strictly before tracking? Or just let it happen in UI mount.
        // Let's assume UI calls checkDailyReset on mount.

        const newQuests = quests.map(quest => {
          if (quest.type !== type || quest.completed) return quest;

          const newCurrent = quest.current + amount;
          const isCompleted = newCurrent >= quest.target;

          // Optional: Auto-claim or manual claim? Manual is more engaging.
          return {
            ...quest,
            current: newCurrent,
            completed: isCompleted,
          };
        });

        set({ quests: newQuests });
      },

      claimReward: (questId) => {
        const { quests, addXp } = get();
        const quest = quests.find(q => q.id === questId);
        
        if (quest && quest.completed && !quest.claimed) {
          addXp(quest.rewardXP);
          set({
            quests: quests.map(q => 
              q.id === questId ? { ...q, claimed: true } : q
            )
          });
        }
      }
    }),
    {
      name: 'creator-arena-quests', // LocalStorage key
    }
  )
);
