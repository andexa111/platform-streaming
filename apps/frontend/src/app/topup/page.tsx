"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCoinStore } from "@/lib/coin-store";

const PLANS = [
  {
    name: "Paket 1",
    coins: 50,
    price: "20.000",
    badge: "Pemula",
    imageSrc: "/coin 1.png",
    color: "text-amber-500",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    bgColor: "bg-amber-500/5",
    glowColor: "group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)]",
    buttonText: "Beli Sekarang",
    popular: false,
    buttonClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-white hover:border-amber-500",
  },
  {
    name: "Paket 2",
    coins: 120,
    price: "45.000",
    badge: "Populer (+20 Koin Bonus)",
    imageSrc: "/coin 2.png",
    color: "text-blue-500",
    borderColor: "border-blue-500/40 hover:border-blue-500/80",
    bgColor: "bg-blue-500/5",
    glowColor: "group-hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]",
    buttonText: "Beli Sekarang",
    popular: true,
    buttonClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white hover:border-blue-500",
  },
  {
    name: "Paket 3",
    coins: 300,
    price: "100.000",
    badge: "Hemat (+100 Koin Bonus)",
    imageSrc: "/coin 3.png",
    color: "text-purple-500",
    borderColor: "border-purple-500/30 hover:border-purple-500/60",
    bgColor: "bg-purple-500/5",
    glowColor: "group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]",
    buttonText: "Beli Sekarang",
    popular: false,
    buttonClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500 hover:text-white hover:border-purple-500",
  },
  {
    name: "Paket 4",
    coins: 620,
    price: "200.000",
    badge: "Best Value (+220 Koin Bonus)",
    imageSrc: "/coin 4.png",
    color: "text-[#FFD700]",
    borderColor: "border-[#FFD700]/40 hover:border-[#FFD700]/80",
    bgColor: "bg-[#FFD700]/5",
    glowColor: "group-hover:shadow-[0_0_60px_-10px_rgba(255,215,0,0.6)]",
    buttonText: "Beli Sekarang",
    popular: false,
    buttonClass: "bg-gradient-to-r from-[#FFD700]/20 to-amber-500/20 text-[#B8860B] dark:text-[#FFD700] border border-[#FFD700]/30 hover:from-[#FFD700] hover:to-amber-500 hover:text-neutral-950 hover:border-[#FFD700]",
  },
];

export default function TopUpPage() {
  const router = useRouter();
  const addCoins = useCoinStore((state) => state.addCoins);
  const currentCoins = useCoinStore((state) => state.coins);
  const [buying, setBuying] = useState<string | null>(null);

  const handleBuy = (coins: number, planName: string) => {
    setBuying(planName);
    setTimeout(() => {
      addCoins(coins);
      setBuying(null);
      alert(`Berhasil Top Up ${coins} Koin! Saldo Anda sekarang: ${currentCoins + coins} Koin`);
    }, 1000);
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen text-neutral-900 dark:text-white pb-32 selection:bg-brand/30 font-sans transition-colors duration-300">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex items-center gap-4 relative z-50">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white dark:bg-white/5 hover:bg-neutral-100 dark:hover:bg-white/10 border border-neutral-200 dark:border-white/10 transition-all group backdrop-blur-sm">
          <Icon name="arrow-right" className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
          <span className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors" onClick={() => router.push("/")}>
            Home
          </span>
          <Icon name="chevron-right" className="w-3 h-3" />
          <span className="text-brand">Top-Up Koin</span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative pt-24 pb-20 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl px-6 space-y-6 relative z-10">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-xs font-bold text-brand uppercase tracking-widest shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <Icon name="coins" className="w-4 h-4" />
            Top-Up Saldo Koin
          </div> */}

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-400">Pilih Paket Koin</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-purple-500 pb-2">Tanpa Batas</span>
          </h1>

          {/* <p className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Dapatkan koin sekarang dan nikmati kebebasan menonton film favorit secara eksklusif. Transaksi cepat dan aman.
          </p> */}

          <div className="mt-8 inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 shadow-lg backdrop-blur-md">
            <div className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Koin Kamu Saat Ini</div>
            <div className="flex items-center gap-2 text-2xl font-black text-neutral-900 dark:text-white">
              <div className="relative w-28 h-28 flex-shrink-0 -my-4">
                <Image src="/coin 1.png" alt="Koin" fill className="object-contain drop-shadow-xl" sizes="112px" />
              </div>
              {currentCoins}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {PLANS.map((plan, index) => (
            <div
              key={plan.name}
              className={cn(
                "group relative p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 flex flex-col bg-neutral-100/70 dark:bg-neutral-900/40 backdrop-blur-md",
                plan.borderColor,
                plan.glowColor
              )}
            >
              {/* Background Layer with Overflow Hidden (Patterns & Glows) */}
              <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden pointer-events-none z-0">
                {/* Geometric Hexagon / Glass Grid Pattern Background */}
                <div className="absolute inset-0 opacity-25 dark:opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                  <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`hex-grid-${index}`} width="28" height="49" patternUnits="userSpaceOnUse">
                        <path
                          d="M14 0 L28 8.08 L28 24.25 L14 32.33 L0 24.25 L0 8.08 Z M14 49 L28 40.92 L28 24.75 L14 16.67 L0 24.75 L0 40.92 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.75"
                          className="text-neutral-400 dark:text-neutral-500"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#hex-grid-${index})`} />
                  </svg>
                </div>

                {/* Ambient Glows Inside Container */}
                <div className={cn("absolute -top-16 -right-16 w-32 sm:w-44 h-32 sm:h-44 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity duration-500", plan.bgColor.replace("/5", "/40"))} />
                <div className={cn("absolute -bottom-16 -left-16 w-32 sm:w-44 h-32 sm:h-44 rounded-full blur-3xl opacity-25 group-hover:opacity-60 transition-opacity duration-500", plan.bgColor.replace("/5", "/30"))} />

                {/* Decorative Corner Tech Brackets */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 border-t-2 border-l-2 border-neutral-400/30 dark:border-white/20 rounded-tl-sm group-hover:border-brand/60 transition-colors" />
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 border-t-2 border-r-2 border-neutral-400/30 dark:border-white/20 rounded-tr-sm group-hover:border-brand/60 transition-colors" />
                <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 w-2.5 h-2.5 sm:w-3 sm:h-3 border-b-2 border-l-2 border-neutral-400/30 dark:border-white/20 rounded-bl-sm group-hover:border-brand/60 transition-colors" />
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 w-2.5 h-2.5 sm:w-3 sm:h-3 border-b-2 border-r-2 border-neutral-400/30 dark:border-white/20 rounded-br-sm group-hover:border-brand/60 transition-colors" />
              </div>

              {plan.popular && (
                <div className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-brand text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full z-20 shadow-lg shadow-brand/20 whitespace-nowrap">
                  Paling Laris
                </div>
              )}

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  {/* 3D Image Presentation */}
                  <div className="relative w-20 h-20 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    {/* Subtle shadow underneath image */}
                    <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-3 sm:h-4 bg-black/20 dark:bg-black/40 blur-xl rounded-full" />
                    <Image src={plan.imageSrc} alt={plan.name} fill className="object-contain drop-shadow-2xl" sizes="(max-w-768px) 80px, 128px" />
                  </div>

                  {/* Content */}
                  <div className="text-center space-y-2 sm:space-y-4 mb-4 sm:mb-8">
                    <div className="space-y-0.5 sm:space-y-1">
                      <h3 className="text-sm sm:text-xl font-bold uppercase tracking-wider sm:tracking-widest text-neutral-500 dark:text-neutral-400">{plan.name}</h3>
                      <div className="flex items-center justify-center gap-1">
                        <span className={cn("text-2xl sm:text-4xl font-black tracking-tight", plan.color)}>{plan.coins}</span>
                        <span className="text-xs sm:text-lg font-bold text-neutral-400">Koin</span>
                      </div>
                    </div>

                    <div className="inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-neutral-200/60 dark:bg-white/5 border border-neutral-300 dark:border-white/10 text-[10px] sm:text-xs font-semibold text-neutral-700 dark:text-neutral-300 max-w-full truncate">{plan.badge}</div>
                  </div>

                  <div className="text-center mb-4 sm:mb-8">
                    <span className="text-base sm:text-2xl md:text-3xl font-black text-neutral-900 dark:text-white">Rp {plan.price}</span>
                  </div>

                  {/* Features Divider */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-white/10 to-transparent mb-4 sm:mb-6" />
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleBuy(plan.coins, plan.name)}
                  disabled={buying === plan.name}
                  className={cn(
                    "mt-2 sm:mt-8 w-full py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-wider sm:tracking-widest text-[10px] sm:text-xs transition-all active:scale-95 shadow-xl flex items-center justify-center gap-1.5",
                    plan.buttonClass,
                    buying === plan.name ? "opacity-75 cursor-not-allowed" : "",
                  )}
                >
                  {buying === plan.name ? (
                    <>
                      <Icon name="loader-2" className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                      <span className="hidden sm:inline">Memproses...</span>
                      <span className="sm:hidden">Proses...</span>
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Information Section */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6 mt-16 sm:mt-28 mb-20">
        <div className="relative p-4 sm:p-8 md:p-12 rounded-[1.5rem] sm:rounded-[2.5rem] bg-neutral-100/80 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Ambient Background Glows & Pattern */}
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-brand/10 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

          <div className="relative z-10 space-y-6 sm:space-y-10 text-center">
            {/* Header Badge & Title */}
            <div className="space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-brand/10 text-brand border border-brand/20 text-[9px] sm:text-[11px] font-black uppercase tracking-widest">
                <Icon name="info" className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Ketentuan Layanan
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">Informasi Koin Sinea</h2>
            </div>

            {/* Feature Cards Grid (Always 1 row on mobile: grid-cols-3) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6">
              {[
                {
                  icon: "zap",
                  title: "Proses Instan",
                  desc: "Koin langsung masuk otomatis setelah pembayaran.",
                  color: "text-amber-500",
                  bgColor: "bg-amber-500/10 border-amber-500/20",
                  glow: "group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
                },
                {
                  icon: "infinity",
                  title: "Tanpa Hangus",
                  desc: "Koin tidak akan expired dan dapat dipakai kapan saja.",
                  color: "text-brand",
                  bgColor: "bg-brand/10 border-brand/20",
                  glow: "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
                },
                {
                  icon: "shield-check",
                  title: "100% Aman",
                  desc: "Transaksi diproses dengan enkripsi tingkat tinggi.",
                  color: "text-emerald-500",
                  bgColor: "bg-emerald-500/10 border-emerald-500/20",
                  glow: "group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "group p-2.5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-white/5 border border-neutral-200/80 dark:border-white/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center space-y-2 sm:space-y-4 shadow-sm",
                    item.glow,
                  )}
                >
                  <div className={cn("w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm", item.bgColor, item.color)}>
                    <Icon name={item.icon as any} className="w-4 h-4 sm:w-7 sm:h-7" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <h4 className="font-bold text-[10px] sm:text-sm md:text-base uppercase tracking-tight sm:tracking-wider text-neutral-900 dark:text-white leading-tight">{item.title}</h4>
                    <p className="text-[8px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-normal leading-tight sm:leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
