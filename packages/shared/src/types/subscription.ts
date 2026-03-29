export interface Subscription {
  id: number;
  userId: number;
  plan: string;
  status: 'inactive' | 'active' | 'expired';
  expired_at: string | null;
  reminder_sent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string | null;
  expired_at: string | null;
  reminder_sent: boolean;
}
