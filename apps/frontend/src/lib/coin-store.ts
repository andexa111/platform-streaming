import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CoinState {
  coins: number;
  unlockedFilmIds: string[];
  purchasedFilms: Record<string, string>; // filmId -> purchasedAt (ISO String)
  addCoins: (amount: number) => void;
  unlockFilm: (id: string, price: number) => boolean;
  hasUnlocked: (id: string) => boolean;
  getPurchasedAt: (id: string) => string | undefined;
  setPurchasedFilms: (purchasedMap: Record<string, string>) => void;
}

export const useCoinStore = create<CoinState>()(
  persist(
    (set, get) => ({
      coins: 0,
      unlockedFilmIds: [],
      purchasedFilms: {},
      addCoins: (amount) =>
        set((state) => ({
          coins: state.coins + amount,
        })),
      unlockFilm: (id, price) => {
        const state = get();
        if (state.coins >= price && !state.hasUnlocked(id)) {
          // Save exact purchase timestamp (ISO String)
          const nowISO = new Date().toISOString();
          set((state) => ({
            coins: state.coins - price,
            unlockedFilmIds: state.unlockedFilmIds.includes(id) ? state.unlockedFilmIds : [...state.unlockedFilmIds, id],
            purchasedFilms: {
              ...state.purchasedFilms,
              [id]: nowISO,
            },
          }));
          return true;
        }
        return false;
      },
      hasUnlocked: (id) => {
        const state = get();
        const purchasedAt = state.purchasedFilms[id];
        if (purchasedAt) {
          const purchaseDate = new Date(purchasedAt).getTime();
          const expireDate = purchaseDate + 30 * 24 * 60 * 60 * 1000;
          if (Date.now() >= expireDate) {
            return false; // Expiration reached
          }
          return true;
        }
        // Legacy fallback
        return state.unlockedFilmIds.includes(id);
      },
      getPurchasedAt: (id) => get().purchasedFilms[id],
      setPurchasedFilms: (purchasedMap) =>
        set((state) => ({
          purchasedFilms: { ...state.purchasedFilms, ...purchasedMap },
          unlockedFilmIds: Array.from(new Set([...state.unlockedFilmIds, ...Object.keys(purchasedMap)])),
        })),
    }),
    {
      name: 'lalakon-coin-storage', // name of the item in local storage
    }
  )
);

export function getFilmRemainingTime(purchasedAt: string | undefined) {
  if (!purchasedAt) {
    return { days: 30, hours: 0, minutes: 0, text: "Tersisa 30 Hari", isExpired: false };
  }
  const purchaseDate = new Date(purchasedAt).getTime();
  const expireDate = purchaseDate + 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  const diffMs = expireDate - now;

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, text: "Kedaluwarsa", isExpired: true };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays >= 1) {
    return {
      days: diffDays,
      hours: remainingHours,
      minutes: remainingMinutes,
      text: `Tersisa ${diffDays} Hari`,
      isExpired: false,
    };
  } else {
    return {
      days: 0,
      hours: remainingHours,
      minutes: remainingMinutes,
      text: `Tersisa ${remainingHours}j ${remainingMinutes}m`,
      isExpired: false,
    };
  }
}
