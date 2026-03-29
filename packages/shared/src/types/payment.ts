export interface Payment {
  id: number;
  order_id: string;
  userId: number;
  plan: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}
