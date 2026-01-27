import { create } from 'zustand';

interface StoryState {
  currentPage: number;
  hasSeen: boolean;
  nextPage: () => void;
  prevPage: () => void;
  skipAll: () => void;
  setPage: (page: number) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  currentPage: 0,
  hasSeen: false,
  nextPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  prevPage: () => set((state) => ({ currentPage: Math.max(0, state.currentPage - 1) })),
  setPage: (page) => set({ currentPage: page }),
  skipAll: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasSeenStory', 'true');
      window.location.href = '/dashboard'; // Placeholder for now
    }
  },
}));
