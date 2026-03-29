export enum Plan {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export const PLAN_CONFIG = {
  [Plan.MONTHLY]: {
    label: 'Bulanan',
    price: 49000, // IDR
    durationDays: 30,
    description: 'Akses semua film selama 30 hari',
  },
  [Plan.YEARLY]: {
    label: 'Tahunan',
    price: 499000, // IDR
    durationDays: 365,
    description: 'Akses semua film selama 1 tahun — hemat 15%',
  },
} as const;
