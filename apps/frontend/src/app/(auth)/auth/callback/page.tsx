"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useAuthStore } from "@/lib/auth-store";
import { api } from "@/lib/api";
import AuthLayout from "@/components/layout/AuthLayout";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Fetch user profile using the token
      const fetchProfile = async () => {
        try {
          const response = await api.get("/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Save to store and redirect
          setAuth(response.data, token);
          router.push("/home");
          router.refresh();
        } catch (error) {
          console.error("Failed to fetch profile after OAuth:", error);
          router.push("/login?error=oauth_failed");
        }
      };

      fetchProfile();
    } else {
      router.push("/login?error=no_token");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900">Menyelesaikan Autentikasi</h2>
        <p className="text-neutral-500 mt-2">Mohon tunggu sebentar, kami sedang menyiapkan akun Anda...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <AuthLayout mode="login">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </AuthLayout>
  );
}
