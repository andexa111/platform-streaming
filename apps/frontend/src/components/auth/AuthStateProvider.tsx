"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile");
        return response.data;
      } catch (error) {
        return null;
      }
    };

    checkAuth(fetchProfile);
  }, [checkAuth]);

  return <>{children}</>;
}
