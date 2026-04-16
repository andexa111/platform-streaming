"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@lalakon/shared";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import AuthLayout from "@/components/layout/AuthLayout";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError(null);
      const response = await api.post("/auth/login", data);
      
      // Save token to store and cookie
      setAuth(response.data.user, response.data.access_token);
      
      // Redirect using Next.js router
      router.push("/home");
      router.refresh();
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal. Periksa kembali email dan password Anda.");
    }
  };

  return (
    <AuthLayout mode="login">
      <div className="w-full max-w-[440px] mx-auto p-10 bg-[#0A0A0A] border border-white/5 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl font-bold text-white">Selamat datang kembali</h2>
          <p className="text-sm text-neutral-400">Kami merindukan Anda. Lanjutkan menonton dari tempat terakhir Anda berhenti.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-500/10 text-red-500 rounded-xl text-xs font-medium border border-red-500/20">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Alamat Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              className="bg-[#141414] border-white/5 text-white focus:bg-[#1A1A1A] placeholder:text-neutral-600 h-12"
              {...register("email")}
            />
            {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Kata Sandi</label>
              <Link href="#" className="text-xs font-medium text-neutral-500 hover:text-white transition-colors">
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan kata sandi Anda"
                className="bg-[#141414] border-white/5 text-white focus:bg-[#1A1A1A] placeholder:text-neutral-600 h-12 pr-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password.message}</p>}
          </div>

          <Button 
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-brand hover:brightness-110 text-white font-bold text-base mt-4 transition-all border-0 ring-0 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
            <span className="bg-[#0A0A0A] px-4 text-neutral-500 font-bold">Atau</span>
          </div>
        </div>

        {/* Google Sign In */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 rounded-xl border-white/5 bg-[#141414] text-white hover:bg-[#1a1a1a] hover:text-brand hover:border-white/10 gap-3 font-semibold transition-all hover:scale-[1.02]"
          onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Lanjutkan dengan Google
        </Button>

        {/* Switch to Register */}
        <p className="text-center text-sm text-neutral-500 mt-8">
          Baru di LALAKON?{" "}
          <Link href="/register" className="font-semibold text-brand hover:brightness-125 transition-colors">
            Buat akun baru
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
