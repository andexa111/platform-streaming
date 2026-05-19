"use client";

import React, { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import AuthLayout from "@/components/layout/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <div className="w-full max-w-[440px] mx-auto p-10 bg-card border border-border rounded-2xl shadow-2xl">
        {!sent ? (
          <>
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Lupa Kata Sandi?</h2>
              <p className="text-sm text-muted-foreground">
                Masukkan email yang terdaftar. Kami akan mengirimkan link untuk mereset kata sandi Anda.
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
                  Alamat Email
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted/50 border-border text-foreground focus:bg-muted/70 placeholder:text-muted-foreground/50 h-12"
                  required
                />
              </div>

              <Button
                disabled={loading}
                className="w-full h-12 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-base transition-all border-0 ring-0 hover:scale-[1.02] disabled:opacity-70"
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
              <Icon name="mail" className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Email Terkirim!</h2>
            <p className="text-sm text-muted-foreground">
              Jika email <strong>{email}</strong> terdaftar, Anda akan menerima link untuk mereset kata sandi.
              Cek inbox dan folder spam Anda.
            </p>
            <p className="text-xs text-muted-foreground">Link berlaku selama 1 jam.</p>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Ingat kata sandi?{" "}
          <Link href="/login" className="font-semibold text-brand hover:brightness-125 transition-colors">
            Kembali ke Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
