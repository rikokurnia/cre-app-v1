export type Rarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface RarityConfig {
  color: string;
  borderColor: string;
  shadow: string;
  bgGradient: string;
  icon: string;
}

export const RARITY_STYLES: Record<Rarity, RarityConfig> = {
  COMMON: {
    color: 'text-gray-500',
    borderColor: 'border-gray-200',
    shadow: 'shadow-sm',
    bgGradient: 'bg-white',
    icon: '',
  },
  RARE: {
    color: 'text-blue-500',
    borderColor: 'border-blue-400',
    shadow: 'shadow-blue-200 dark:shadow-blue-900',
    bgGradient: 'bg-gradient-to-br from-white to-blue-50',
    icon: '💎',
  },
  EPIC: {
    color: 'text-purple-600',
    borderColor: 'border-purple-500',
    shadow: 'shadow-lg shadow-purple-200',
    bgGradient: 'bg-gradient-to-br from-white to-purple-100',
    icon: '🔮',
  },
  LEGENDARY: {
    color: 'text-amber-500',
    borderColor: 'border-amber-400',
    shadow: 'shadow-xl shadow-amber-200 ring-2 ring-amber-200 ring-opacity-50',
    bgGradient: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    icon: '👑',
  },
};

export function calculateRarity(entryPrice: number, currentPrice: number, type: 'CALL' | 'PUT'): Rarity {
  let profitPercent = 0;
  
  if (type === 'CALL') {
    profitPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  } else {
    profitPercent = ((entryPrice - currentPrice) / entryPrice) * 100;
  }

  if (profitPercent >= 100) return 'LEGENDARY';
  if (profitPercent >= 50) return 'EPIC';
  if (profitPercent >= 10) return 'RARE';
  
  return 'COMMON';
}
