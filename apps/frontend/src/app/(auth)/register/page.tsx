"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AuthLayout from "@/components/layout/AuthLayout";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthLayout mode="register">
      {/* Header */}
      <div className="space-y-3 flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Icon name="user-plus" className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-neutral-900">Bergabung dengan Lalakon</h2>
          <p className="text-neutral-500 mt-1">Buat akun untuk mulai menonton konten favorit Anda.</p>
        </div>
      </div>

      {/* Registration Form */}
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
          <Input
            type="text"
            placeholder="Nama Anda"
            className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white"
            icon={<Icon name="user" className="w-4 h-4" />}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Alamat Email</label>
          <Input
            type="email"
            placeholder="name@example.com"
            className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white"
            icon={<Icon name="mail" className="w-4 h-4" />}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative group">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white pr-12"
              icon={<Icon name="lock" className="w-4 h-4" />}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Icon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
          <div className="relative group">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white pr-12"
              icon={<Icon name="lock" className="w-4 h-4" />}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <Button className="w-full h-12 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
          Daftar Sekarang
        </Button>
      </form>

      {/* Switch to Login */}
      <p className="text-center text-sm text-neutral-500 mt-6 hidden lg:block">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">Masuk</Link>
      </p>
    </AuthLayout>
  );
}
