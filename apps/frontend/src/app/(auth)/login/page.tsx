"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

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
              <Icon  name="User" className="w-6 h-6 text-white flex items-center justify-center" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-neutral-900">Selamat datang di Lalakon</h2>
              <p className="text-neutral-500 mt-1">Silahkan masukkan detail akun anda untuk masuk.</p>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
              <Input 
                type="email" 
                placeholder="name@example.com" 
                className="bg-neutral-50 border-neutral-200 text-neutral-900 focus:bg-white"
                icon={<Icon name="Mail" className="w-4 h-4" />}
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-xs font-bold text-[#024D94] hover:underline">Forgot password?</Link>
              </div>
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

            <div className="flex items-center">
              <Switch label="Remember me for 30 days" />
            </div>

            <Button className="w-full h-12 rounded-xl bg-[#024D94] hover:bg-[#013d75] text-white font-bold text-lg shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Sign In
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-neutral-400 font-medium">or</span>
            </div>
          </div>

           {/* Social Sign In */}
          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 gap-3 font-semibold transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-[#024D94] hover:underline">
              Sign up now
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
