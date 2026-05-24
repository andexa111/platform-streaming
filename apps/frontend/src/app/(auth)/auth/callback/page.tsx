"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/Icon";

function CallbackContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const status = searchParams.get("status");
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [state, setState] = useState<"loading" | "pending" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    // Token received — fetch profile and set auth
    const authenticate = async () => {
      try {
        const res = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuth(res.data, token);
        setState("success");
        setTimeout(() => {
          if (res.data.role === 'superadmin') {
            window.location.href = "/superadmin";
          } else if (res.data.role === 'admin') {
            window.location.href = "/admin";
          } else {
            window.location.href = "/home";
          }
        }, 1500);
      } catch {
        setState("error");
      }
    };

    authenticate();
  }, [token, status]);

  return (
    <div className="w-full max-w-[440px] mx-auto p-10 bg-card border border-border rounded-2xl shadow-2xl text-center space-y-6">
      {state === "loading" && (
        <>
          <div className="w-16 h-16 mx-auto border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-foreground">Memproses login...</h2>
        </>
      )}


      {state === "success" && (
        <>
          <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Login Berhasil!</h2>
          <p className="text-sm text-muted-foreground">Mengalihkan ke halaman utama...</p>
        </>
      )}

      {state === "error" && (
        <>
          <div className="w-20 h-20 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
            <Icon name="x" className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Login Gagal</h2>
          <p className="text-sm text-muted-foreground">Token tidak valid atau terjadi kesalahan.</p>
          <Button
            className="mt-4 h-12 px-8 rounded-xl bg-brand text-white font-bold"
            onClick={() => router.push("/login")}
          >
            Coba Login Lagi
          </Button>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <AuthLayout mode="login">
      <Suspense fallback={
        <div className="flex justify-center py-10">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </AuthLayout>
  );
}
