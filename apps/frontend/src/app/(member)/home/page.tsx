"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VideoSection } from "@/components/video/VideoSection";
import { MovieBanner } from "@/components/home/MovieBanner";
import { ALL_MOVIES, GENRES } from "@/constants/video-data";

export default function MemberHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Dynamic Movie Banner - Featured Content */}
      <MovieBanner movies={ALL_MOVIES.slice(0, 10)} />

      {/* Content Sections */}
      <div className="space-y-4 md:space-y-8 pb-20">
        <VideoSection title="Sedang Ditonton" subtitle="Lanjutkan menonton film favorit Anda" videos={ALL_MOVIES} viewAllHref="/movies" />

        <VideoSection title="Segera Hadir" subtitle="Film original eksklusif yang akan tayang bulan ini" videos={[...ALL_MOVIES].reverse()} viewAllHref="/movies" className="bg-muted/30" />

        {/* Genres Section */}
        <section className="py-24 px-6 bg-background relative border-t border-border overflow-hidden">
          <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                  <Icon name="compass" className="w-10 h-10 text-brand" />
                  Genre Kami
                </h2>
                <p className="text-muted-foreground text-lg">Jelajahi berbagai genre film yang dikurasi khusus untuk Anda.</p>
              </div>
              <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
                Jelajahi Pustaka <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {GENRES.map((genre, i) => (
                <div
                  key={i}
                  className="group relative w-[90px] h-[42px] md:w-[130px] md:h-[52px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-card/50 border border-border flex items-center justify-center px-3 transition-all duration-500 hover:scale-105 hover:border-brand/40 shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-transparent opacity-30 group-hover:opacity-100 group-hover:from-brand/20 transition-all duration-500`} />
                  <h3 className="flex flex-col items-center justify-center gap-1">
                    <span
                      className={`relative z-20 font-bold tracking-[0.1em] uppercase text-foreground transition-colors text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 ${
                        genre.title.length > 10 ? "text-[7px] md:text-[9px]" : "text-[9px] md:text-xs"
                      }`}
                    >
                      {genre.title}
                    </span>
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - For non-active members */}
        <section className="py-24 px-6 bg-background relative border-t border-border">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-brand">Tingkatkan Pengalaman Anda</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Anda saat ini dalam masa uji coba. Berlangganan sekarang untuk membuka ribuan film premium tanpa iklan.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-2 flex flex-col col-span-1 overflow-hidden">
                <div className="relative z-10 mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-muted border border-border flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform">
                    <Icon name="chess-rook" className="w-5 h-5 md:w-6 md:h-6 text-[#CD7F32]" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">Basic</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-4xl font-black text-foreground">Rp 49rb</span>
                    <span className="text-xs md:text-sm text-muted-foreground">/bln</span>
                  </div>
                </div>
                <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-muted-foreground">
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#CD7F32]" /> <span className="line-clamp-1">1 perangkat</span>
                  </li>
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#CD7F32]" /> <span className="line-clamp-1">SD (720p)</span>
                  </li>
                </ul>
                <Link
                  href="/membership"
                  className="flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-bold bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all"
                >
                  Pilih Paket
                </Link>
              </div>

              {/* Standard Plan */}
              <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-brand/50 bg-card shadow-[0_20px_50px_rgba(2,77,148,0.1)] hover:shadow-[0_30px_70px_rgba(2,77,148,0.2)] transform hover:-translate-y-2 transition-all duration-500 flex flex-col col-span-1">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white px-3 md:px-4 py-1 rounded-full text-[9px] md:text-xs font-black tracking-widest uppercase shadow-lg z-20">Terpopuler</div>
                <div className="relative z-10 mb-6 md:mb-8 mt-1 md:mt-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand/10 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner border border-brand/20">
                    <Icon name="chess-knight" className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">Standard</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-4xl font-black text-foreground">Rp 99rb</span>
                    <span className="text-xs md:text-sm text-muted-foreground">/bln</span>
                  </div>
                </div>
                <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-foreground">
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-brand" /> <span className="line-clamp-1 font-medium">2 perangkat</span>
                  </li>
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-brand" /> <span className="line-clamp-1 font-medium">FHD (1080p)</span>
                  </li>
                </ul>
                <Link
                  href="/membership"
                  className="flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-black bg-brand text-white hover:bg-brand/90 transition-all shadow-md"
                >
                  Upgrade Sekarang
                </Link>
              </div>

              {/* Premium Plan */}
              <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-[#FFD700]/50 bg-card shadow-[0_8px_30px_rgba(255,215,0,0.06)] hover:shadow-[0_30px_70px_rgba(255,215,0,0.15)] transition-all duration-500 hover:-translate-y-2 flex flex-col col-span-2 md:col-span-1 max-w-[calc(50%-6px)] md:max-w-none mx-auto w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFD700]/5 to-transparent opacity-30 pointer-events-none" />
                <div className="relative z-10 mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner border border-yellow-500/20">
                    <Icon name="chess-queen" className="w-5 h-5 md:w-6 md:h-6 text-[#FFD700]" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">Premium</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-4xl font-black text-foreground">Rp 149rb</span>
                    <span className="text-xs md:text-sm text-muted-foreground">/bln</span>
                  </div>
                </div>
                <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-foreground">
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700]" /> <span className="line-clamp-1 font-semibold">4 perangkat</span>
                  </li>
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700]" /> <span className="line-clamp-1 font-semibold">4K & HDR</span>
                  </li>
                </ul>
                <Link
                  href="/membership"
                  className="flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-black bg-foreground text-background hover:opacity-90 transition-all shadow-md"
                >
                  Ambil Premium
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
