export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}
