import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Position {
  id: string;
  creatorSymbol: string;
  creatorFid: number;
  creatorName: string;
  creatorPfp: string;
  type: 'CALL' | 'PUT';
  entryPrice: number;
  amount: number;
  isOpen: boolean;
  createdAt: string;
  closedAt?: string;
  exitPrice?: number;
  pnl?: number;
}

interface UserState {
  virtualBalance: number;
  portfolio: Position[];
  watchlist: number[]; // FIDs of favorite creators
  addPosition: (position: Position) => void;
  closePosition: (id: string, exitPrice: number) => void;
  addToWatchlist: (fid: number) => void;
  removeFromWatchlist: (fid: number) => void;
  resetBalance: () => void;
  getOpenPositions: () => Position[];
  getClosedPositions: () => Position[];
  getTotalPnL: () => number;
}

const INITIAL_BALANCE = 10000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      virtualBalance: INITIAL_BALANCE,
      portfolio: [],
      watchlist: [],
      
      addPosition: (position) => set((state) => ({ 
        portfolio: [...state.portfolio, position],
        virtualBalance: state.virtualBalance - position.amount
      })),
      
      closePosition: (id, exitPrice) => set((state) => {
        const position = state.portfolio.find(p => p.id === id);
        if (!position || !position.isOpen) return state;
        
        // Paper trading P&L calculation:
        // CALL wins if exitPrice > entryPrice
        // PUT wins if exitPrice < entryPrice
        const priceChange = exitPrice - position.entryPrice;
        const isWin = (position.type === 'CALL' && priceChange > 0) || 
                      (position.type === 'PUT' && priceChange < 0);
        
        // Payout: 1.8x if win, 0 if lose (binary options style)
        const payout = isWin ? position.amount * 1.8 : 0;
        const pnl = payout - position.amount;
        
        return {
          portfolio: state.portfolio.map(p => 
            p.id === id 
              ? { 
                  ...p, 
                  isOpen: false, 
                  closedAt: new Date().toISOString(),
                  exitPrice,
                  pnl,
                } 
              : p
          ),
          virtualBalance: state.virtualBalance + payout
        };
      }),
      
      addToWatchlist: (fid) => set((state) => ({
        watchlist: state.watchlist.includes(fid) 
          ? state.watchlist 
          : [...state.watchlist, fid]
      })),
      
      removeFromWatchlist: (fid) => set((state) => ({
        watchlist: state.watchlist.filter(f => f !== fid)
      })),
      
      resetBalance: () => set({ 
        virtualBalance: INITIAL_BALANCE, 
        portfolio: [],
        watchlist: [],
      }),
      
      getOpenPositions: () => get().portfolio.filter(p => p.isOpen),
      
      getClosedPositions: () => get().portfolio.filter(p => !p.isOpen),
      
      getTotalPnL: () => get().portfolio
        .filter(p => !p.isOpen && p.pnl !== undefined)
        .reduce((acc, p) => acc + (p.pnl || 0), 0),
    }),
    {
      name: 'user-store-free-mode',
    }
  )
);
