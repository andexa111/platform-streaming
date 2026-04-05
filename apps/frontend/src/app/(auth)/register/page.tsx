"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";


export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Left Panel: Visual/Artistic (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-neutral-950">
        <Image
          src="/login_bg.png"
          alt="Abstract Background"
          fill
          className="object-cover opacity-60 mix-blend-luminosity grayscale scale-105 hover:scale-100 transition-transform duration-[10000ms]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
              <Icon name="Film" className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">LALAKON</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-8xl font-black text-white leading-none tracking-tight">
              COMING <br />
              <span className="text-white/30 outline-text">SOON</span>
            </h1>
            <div className="flex items-center gap-8 text-white/50 text-sm font-medium tracking-widest uppercase mt-8">
              <span>XX . XX . XX</span>
              <div className="w-12 h-px bg-white/20" />
              <span>BY ANDEXA</span>
            </div>
          </div>

          <div className="text-white/30 text-xs font-mono uppercase tracking-widest">
            Photo Credit: Lalakon Creative Studio
          </div>
        </div>
      </div>

      {/* Right Panel: Functional Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Logo & Header */}
          <div className="space-y-3 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[#024D94] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icon name="UserPlus" className="w-6 h-6 text-white flex items-center justify-center" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-900">Bergabung dengan Lalakon</h2>
              <p className="text-neutral-500 mt-1">Buat akun untuk mulai menonton konten favorit Anda.</p>
            </div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <Input 
                type="text" 
                placeholder="Nama Anda" 
                className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white"
                icon={<Icon name="User" className="w-4 h-4" />}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Alamat Email</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white"
                icon={<Icon name="Mail" className="w-4 h-4" />}
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" 
                  className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white pr-12"
                  icon={<Icon name="Lock" className="w-4 h-4" />}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <Icon name={showPassword ? "EyeOff" : "Eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
              <div className="relative group">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" 
                  className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white pr-12"
                  icon={<Icon name="Lock" className="w-4 h-4" />}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-[#024D94] hover:bg-[#013d75] text-white font-bold text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Daftar Sekarang
            </Button>
          </form>
          
          <p className="text-center text-sm text-neutral-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-[#024D94] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
