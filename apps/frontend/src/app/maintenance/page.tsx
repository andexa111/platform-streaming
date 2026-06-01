"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");

  useEffect(() => {
    // Jalankan timer untuk menghitung mundur
    const timer = setInterval(() => {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const jktHour = (utcHours + 7) % 24;
      const jktMinutes = now.getUTCMinutes();
      const jktSeconds = now.getUTCSeconds();

      // Hitung sisa waktu sampai jam 07:00 WIB
      if (jktHour >= 5 && jktHour < 7) {
        const hoursLeft = 6 - jktHour;
        const minutesLeft = 59 - jktMinutes;
        const secondsLeft = 59 - jktSeconds;
        setTimeLeft(
          `${hoursLeft.toString().padStart(2, '0')}:${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`
        );
      } else {
        // Jika sudah lewat jam 07:00, otomatis balik ke beranda
        window.location.href = "/";
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-foreground font-sans relative overflow-hidden flex flex-col items-center justify-center">
      {/* Dynamic Background with Deep Blues */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(2,77,148,0.2),rgba(0,0,0,1))]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/10 blur-[150px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Logo SINEA */}
        <div className="flex justify-center">
          <img 
            src="/SINEA - Logo Horisontal.webp" 
            alt="SINEA" 
            className="h-10 md:h-14 w-auto object-contain brightness-[1.5] contrast-125 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]" 
          />
        </div>

        {/* Premium Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-14 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
          {/* Shine effect on top border */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          {/* Animated Settings Icon */}
          <div className="w-20 h-20 md:w-24 md:h-24 mx-auto bg-brand/20 rounded-full flex items-center justify-center mb-8 border border-brand/30 shadow-[0_0_30px_rgba(2,77,148,0.3)]">
            <Icon name="settings" className="w-10 h-10 md:w-12 md:h-12 text-brand animate-[spin_4s_linear_infinite]" />
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 uppercase italic">
            Sedang Pemeliharaan
          </h1>
          
          <p className="text-sm md:text-lg text-neutral-300/80 leading-relaxed max-w-xl mx-auto">
            Sinea sedang melakukan optimalisasi server harian dari pukul <strong className="text-white drop-shadow-md">05:00 - 07:00 WIB</strong> untuk memastikan pengalaman streaming karya favorit Anda tetap maksimal.
          </p>

          {/* Countdown Box */}
          <div className="mt-10 p-6 bg-black/40 rounded-3xl border border-white/5 w-fit mx-auto min-w-[280px] shadow-inner shadow-black/50">
            <p className="text-[10px] md:text-xs font-bold text-brand uppercase tracking-[0.3em] mb-2">Estimasi Selesai Dalam</p>
            <p className="text-4xl md:text-5xl font-black text-white font-mono tracking-widest drop-shadow-[0_0_15px_rgba(2,77,148,0.5)]">
              {timeLeft}
            </p>
          </div>
        </div>
        
        <p className="text-xs text-neutral-500 font-medium tracking-wide">
          Sistem akan memuat ulang halaman secara otomatis. Terima kasih atas kesabaran Anda.
        </p>

      </div>
    </main>
  );
}
