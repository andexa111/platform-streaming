"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VideoSection } from "@/components/video/VideoSection";
import { MovieBanner } from "@/components/home/MovieBanner";
import { ALL_MOVIES, GENRES } from "@/constants/video-data";

export default function MemberHomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-brand/30">
      {/* Dynamic Movie Banner - Featured Content */}
      <MovieBanner movies={ALL_MOVIES.slice(0, 5)} />

      {/* Content Sections */}
      <div className="space-y-4 md:space-y-8 pb-20">
        <VideoSection 
          title="Watching Now" 
          subtitle="Continue where you left off"
          videos={ALL_MOVIES} 
          viewAllHref="/movies" 
        />

        <VideoSection 
          title="Coming Soon" 
          subtitle="Exclusive originals arriving this month"
          videos={[...ALL_MOVIES].reverse()} 
          viewAllHref="/movies" 
          className="bg-neutral-900/30" 
        />

        {/* Genres Section */}
        <section className="py-24 px-6 bg-neutral-950 relative border-t border-white/5 overflow-hidden">
          <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
          <div className="max-w-7xl mx-auto space-y-12 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                  <Icon name="compass" className="w-10 h-10 text-brand" />
                  Our Genres
                </h2>
                <p className="text-neutral-400 text-lg">Dive into a universe of stories curated just for you.</p>
              </div>
              <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
                Explore Library <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {GENRES.map((genre, i) => (
                <div
                  key={i}
                  className="group relative w-[90px] h-[42px] md:w-[130px] md:h-[52px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-neutral-900/50 border border-neutral-800/50 flex items-center justify-center px-3 transition-all duration-500 hover:scale-105 hover:border-brand/40 shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-transparent opacity-30 group-hover:opacity-100 group-hover:from-brand/20 transition-all duration-500`} />
                  <h3
                    className={`relative z-20 font-bold tracking-[0.1em] uppercase text-white/70 group-hover:text-white transition-colors text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 ${
                      genre.title.length > 10 ? "text-[7px] md:text-[9px]" : "text-[9px] md:text-xs"
                    }`}
                  >
                    {genre.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - For non-active members */}
        <section className="py-24 px-6 bg-neutral-950 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-brand">Upgrade Your Experience</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto text-lg">You are currently on a trial. Subscribe to unlock thousands of premium titles without ads.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-[#CD7F32]/40 bg-neutral-900/40 shadow-[0_0_20px_rgba(205,127,50,0.1)] hover:shadow-[0_0_30px_rgba(205,127,50,0.2)] transition-all duration-500 hover:-translate-y-2 flex flex-col backdrop-blur-sm col-span-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30 pointer-events-none" />
                <div className="relative z-10 mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/30 border border-white/10 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner">
                    <Icon name="chess-rook" className="w-5 h-5 md:w-6 md:h-6 text-[#CD7F32] transition-colors" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-white">Basic</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-4xl font-black text-white">Rp 49K</span>
                    <span className="text-xs md:text-sm text-white/50">/mo</span>
                  </div>
                </div>
                <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-white/70">
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#CD7F32]" /> <span className="line-clamp-1">1 device</span>
                  </li>
                </ul>
                <Link href="/membership" className="relative z-10 w-full py-3 md:py-4 rounded-xl text-center text-xs md:text-base font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all shadow-lg hover:shadow-[#CD7F32]/20">Select Plan</Link>
              </div>

              {/* Standard Plan */}
              <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-[#C0C0C0]/50 bg-neutral-900/60 shadow-[0_0_30px_rgba(192,192,192,0.15)] hover:shadow-[0_0_50px_rgba(192,192,192,0.3)] transform hover:-translate-y-2 transition-all duration-500 flex flex-col backdrop-blur-sm col-span-1">
                <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40" />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-neutral-900 px-3 md:px-4 py-1 rounded-full text-[9px] md:text-xs font-black tracking-widest uppercase shadow-lg z-20 shadow-white/20">Popular</div>
                <div className="relative z-10 mb-6 md:mb-8 mt-1 md:mt-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/40 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner border border-white/20">
                    <Icon name="chess-knight" className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-white">Standard</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-4xl font-black text-white drop-shadow-md">Rp 99K</span>
                    <span className="text-xs md:text-sm text-white/50">/mo</span>
                  </div>
                </div>
                <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-white">
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-white" /> <span className="line-clamp-1 font-medium">2 devices</span>
                  </li>
                </ul>
                <Link href="/membership" className="relative z-10 w-full py-3 md:py-4 rounded-xl text-center text-xs md:text-base font-black bg-white text-neutral-950 hover:bg-neutral-100 transition-all shadow-xl shadow-white/10">Upgrade Now</Link>
              </div>

              {/* Premium Plan */}
              <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-[#FFD700]/50 bg-neutral-900/40 shadow-[0_0_40px_rgba(255,215,0,0.2)] hover:shadow-[0_0_70px_rgba(255,215,0,0.35)] transition-all duration-500 hover:-translate-y-2 flex flex-col backdrop-blur-sm col-span-2 md:col-span-1 max-w-[calc(50%-6px)] md:max-w-none mx-auto w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-40 pointer-events-none" />
                <div className="relative z-10 mb-6 md:mb-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-black/40 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner border border-white/20">
                    <Icon name="chess-queen" className="w-5 h-5 md:w-6 md:h-6 text-[#FFD700]" />
                  </div>
                  <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-white">Premium</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-4xl font-black text-white drop-shadow-lg">Rp 149K</span>
                    <span className="text-xs md:text-sm text-white/50">/mo</span>
                  </div>
                </div>
                <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-white">
                  <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                    <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700]" /> <span className="line-clamp-1 font-semibold">4 devices</span>
                  </li>
                </ul>
                <Link href="/membership" className="relative z-10 w-full py-3 md:py-4 rounded-xl text-center text-xs md:text-base font-black bg-neutral-950 text-[#FFD700] hover:bg-black transition-all shadow-2xl shadow-yellow-500/10 border border-[#FFD700]/20">Get Premium</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
