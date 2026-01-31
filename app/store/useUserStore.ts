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

interface UserHistoryData {
  virtualBalance: number;
  coreBalance: number;
  portfolio: Position[];
  watchlist: number[];
}

interface UserState {
  virtualBalance: number; // For Creator Mode (Arena USD)
  coreBalance: number;    // For Core Mode (Mock USDC)
  portfolio: Position[];
  watchlist: number[]; // FIDs of favorite creators
  userHistory: Record<string, UserHistoryData>;
  currentAddress: string | null;
  
  addPosition: (position: Position) => void;
  closePosition: (id: string, exitPrice: number) => void;
  addToWatchlist: (fid: number) => void;
  removeFromWatchlist: (fid: number) => void;
  resetBalance: () => void;
  setCurrentAddress: (address: string | null) => void;
  
  getOpenPositions: () => Position[];
  getClosedPositions: () => Position[];
  getTotalPnL: () => number;
}

const INITIAL_BALANCE = 10000;

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      virtualBalance: INITIAL_BALANCE,
      coreBalance: INITIAL_BALANCE,
      portfolio: [],
      watchlist: [],
      userHistory: {},
      currentAddress: null,
      
      setCurrentAddress: (address: string | null) => set((state) => {
        // If address is null, just unset it
        if (!address) return { currentAddress: null };
        
        // If same address, do nothing
        if (address === state.currentAddress) return {};

        const oldAddress = state.currentAddress;
        const history = { ...state.userHistory };

        // 1. Save PREVIOUS user state if it exists
        if (oldAddress) {
          history[oldAddress] = {
            virtualBalance: state.virtualBalance,
            coreBalance: state.coreBalance,
            portfolio: state.portfolio,
            watchlist: state.watchlist
          };
        }

        // 2. Load NEW user state if it exists in history
        if (history[address]) {
          const userData = history[address];
          return {
            currentAddress: address,
            userHistory: history,
            virtualBalance: userData.virtualBalance,
            coreBalance: userData.coreBalance,
            portfolio: userData.portfolio,
            watchlist: userData.watchlist || [] // Fallback for persistence compatibility
          };
        }

        // 3. If new user, RESET to defaults
        return {
          currentAddress: address,
          userHistory: history, // Update history with the saved old user
          virtualBalance: INITIAL_BALANCE,
          coreBalance: INITIAL_BALANCE,
          portfolio: [],
          watchlist: []
        };
      }),
      
      addPosition: (position) => set((state) => {
        const isCoreMode = !position.creatorFid || position.creatorFid === 0;

        if (isCoreMode) {
            return {
                portfolio: [...state.portfolio, position],
                coreBalance: state.coreBalance - position.amount
            };
        } else {
            return {
                portfolio: [...state.portfolio, position],
                virtualBalance: state.virtualBalance - position.amount
            };
        }
      }),
      
      closePosition: (id, exitPrice) => set((state) => {
        const position = state.portfolio.find(p => p.id === id);
        if (!position || !position.isOpen) return state;
        
        // Payout: 1.8x if win, 0 if lose (binary options style)
        // CALL wins if exitPrice > entryPrice
        // PUT wins if exitPrice < entryPrice
        const priceChange = exitPrice - position.entryPrice;
        const isWin = (position.type === 'CALL' && priceChange > 0) || 
                      (position.type === 'PUT' && priceChange < 0);
        
        const payout = isWin ? position.amount * 1.8 : 0;
        const pnl = payout - position.amount;
        
        // Determine balance to credit
        const isCoreMode = !position.creatorFid || position.creatorFid === 0;

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
          // Credit the correct balance
          ...(isCoreMode 
                ? { coreBalance: state.coreBalance + payout }
                : { virtualBalance: state.virtualBalance + payout }
            )
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
        coreBalance: INITIAL_BALANCE,
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
