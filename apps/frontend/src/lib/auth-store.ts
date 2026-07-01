import { create } from 'zustand';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: 'guest' | 'user' | 'subscriber' | 'admin' | 'superadmin';
  email_verified_at: string | null;
  ip?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: (fetchProfile: () => Promise<User | null>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!Cookies.get('token'), // Initial state based on cookie presence
  isLoading: true, // Initially loading until checkAuth completes

  setAuth: (user, token) => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const cookieOptions: Cookies.CookieAttributes = { path: '/' };
    if (hostname.endsWith('sinea.id')) {
      cookieOptions.domain = '.sinea.id';
    }
    Cookies.set('token', token, cookieOptions);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const cookieOptions: Cookies.CookieAttributes = { path: '/' };
    if (hostname.endsWith('sinea.id')) {
      cookieOptions.domain = '.sinea.id';
    }
    Cookies.remove('token', cookieOptions);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async (fetchProfile) => {
    const token = Cookies.get('token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const user = await fetchProfile();
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
      const cookieOptions: Cookies.CookieAttributes = { path: '/' };
      if (hostname.endsWith('sinea.id')) {
        cookieOptions.domain = '.sinea.id';
      }
      Cookies.remove('token', cookieOptions);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
