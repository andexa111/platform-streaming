"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { GENRES } from "@/constants/video-data";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function GenresPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-1000 font-sans">
      {/* Header Section */}
      <div className="relative pt-20 pb-10 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

        <div className="text-center space-y-6 max-w-3xl px-6 relative z-10 pt-10">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] ">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500 pb-5">Jelajahi Genre</span>
          </h1>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {GENRES.map((genre, index) => (
            <Link
              key={genre.title}
              href={`/movies?genre=${encodeURIComponent(genre.title)}`}
              className="group bg-neutral-900/40 backdrop-blur-sm rounded-[2.5rem] border border-white/5 p-10 hover:border-brand/50 hover:bg-neutral-900/60 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-2xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Visual Accent Top Bar */}
              <div className={cn("absolute top-0 left-0 w-full h-2 bg-gradient-to-r transition-all duration-500 group-hover:h-3", genre.color || "from-neutral-800")} />

              {/* Icon Background Decoration */}
              <div className="absolute -right-4 top-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none select-none">
                <Icon name="tag" className="w-40 h-40 -rotate-12" />
              </div>

              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-neutral-950 border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-brand/30 transition-all duration-500 shadow-inner">
                  <Icon name="tag" className="w-7 h-7 text-brand/70 group-hover:text-brand" />
                </div>

                <div className="space-y-2">
                  <h3
                    className={cn(
                      "font-bold text-white group-hover:text-brand transition-all duration-500 tracking-tight line-clamp-1",
                      genre.title.length > 12 ? "text-xl md:text-2xl" : genre.title.length > 8 ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl",
                    )}
                  >
                    {genre.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-brand/30 group-hover:w-12 transition-all duration-500" />
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest group-hover:text-neutral-300">View Collection</p>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-950 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900 opacity-50" />
                    </div>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-500">
                  <Icon name="arrow-right" className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
