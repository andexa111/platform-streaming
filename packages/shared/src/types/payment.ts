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

export interface CoinPackage {
  id: number;
  slug: string;
  name: string;
  coins_amount: number;
  price: number;
  description: string | null;
  is_active: boolean;
}

