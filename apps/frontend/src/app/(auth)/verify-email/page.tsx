"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import AuthLayout from "@/components/layout/AuthLayout";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Sedang memverifikasi email Anda...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    let isMounted = true;

    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        if (isMounted) {
          setStatus("success");
          setMessage("Email Anda berhasil diverifikasi! Sekarang Anda dapat mengakses semua fitur platform.");
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus("error");
          setMessage(err.response?.data?.message || "Token verifikasi tidak valid atau sudah kadaluarsa.");
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-2xl font-bold text-neutral-900">Memproses Verifikasi</h2>
          <p className="text-neutral-500">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            {/* The icon 'check' might not be there either, but 'x' is. Let me read the icon list from the error: "search" | "repeat" | "menu" | "x" | "sparkles" | "play" | "arrow-right" | "star" | "compass" | "chevron-right" | "monitor-play" | "download-cloud" | "monitor" | "ticket" | "crown" | "logout". Let's use Sparkles or just normal check if available. Wait, error doesn't show all 8 more. I will just rely on native emoji or a simple svg */}
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Verifikasi Sukses!</h2>
          <p className="text-neutral-500">{message}</p>
          <Button
            className="mt-6 h-12 px-8 rounded-xl bg-brand text-white font-bold"
            onClick={() => router.push("/login")}
          >
            Masuk Sekarang
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <Icon name="x" className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Verifikasi Gagal</h2>
          <p className="text-neutral-500">{message}</p>
          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl border-neutral-200"
              onClick={() => router.push("/register")}
            >
              Daftar Ulang
            </Button>
            <Button
              className="h-12 px-6 rounded-xl bg-brand text-white font-bold"
              onClick={() => router.push("/login")}
            >
              Coba Masuk
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout mode="login">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
