export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  coins?: number;
  avatar_url?: string | null;
  email_verified_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  coins?: number;
  avatar_url?: string | null;
}

