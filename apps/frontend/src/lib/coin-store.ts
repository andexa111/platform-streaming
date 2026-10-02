import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CoinState {
  coins: number;
  unlockedFilmIds: string[];
  addCoins: (amount: number) => void;
  unlockFilm: (id: string, price: number) => boolean;
  hasUnlocked: (id: string) => boolean;
}

export const useCoinStore = create<CoinState>()(
  persist(
    (set, get) => ({
      coins: 0,
      unlockedFilmIds: [],
      addCoins: (amount) =>
        set((state) => ({
          coins: state.coins + amount,
        })),
      unlockFilm: (id, price) => {
        const state = get();
        if (state.coins >= price && !state.unlockedFilmIds.includes(id)) {
          set((state) => ({
            coins: state.coins - price,
            unlockedFilmIds: [...state.unlockedFilmIds, id],
          }));
          return true;
        }
        return false;
      },
      hasUnlocked: (id) => get().unlockedFilmIds.includes(id),
    }),
    {
      name: 'lalakon-coin-storage', // name of the item in local storage
    }
  )
);
