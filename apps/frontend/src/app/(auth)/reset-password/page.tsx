"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import AuthLayout from "@/components/layout/AuthLayout";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Token tidak valid atau sudah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
          <Icon name="x" className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Token Tidak Valid</h2>
        <p className="text-sm text-muted-foreground">
          Link reset password tidak valid. Silakan minta link baru.
        </p>
        <Button
          className="mt-4 h-12 px-8 rounded-xl bg-brand text-white font-bold"
          onClick={() => router.push("/forgot-password")}
        >
          Minta Link Baru
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] mx-auto p-10 bg-card border border-border rounded-2xl shadow-2xl">
      {!success ? (
        <>
          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-foreground">Reset Kata Sandi</h2>
            <p className="text-sm text-muted-foreground">
              Masukkan kata sandi baru untuk akun Anda.
            </p>
          </div>

          {error && (
            <div className="p-3 mb-6 bg-red-500/10 text-red-500 rounded-xl text-xs font-medium border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border text-foreground focus:bg-muted/70 placeholder:text-muted-foreground/50 h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
                Konfirmasi Kata Sandi
              </label>
              <Input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-muted/50 border-border text-foreground focus:bg-muted/70 placeholder:text-muted-foreground/50 h-12"
                required
              />
            </div>

            <Button
              disabled={loading}
              className="w-full h-12 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-base transition-all border-0 ring-0 hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
            </Button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Berhasil Direset!</h2>
          <p className="text-sm text-muted-foreground">
            Kata sandi Anda berhasil diubah. Silakan login dengan kata sandi baru.
          </p>
          <Button
            className="mt-4 h-12 px-8 rounded-xl bg-brand text-white font-bold"
            onClick={() => router.push("/login")}
          >
            Login Sekarang
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout mode="login">
      <Suspense fallback={
        <div className="flex justify-center py-10">
          <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
