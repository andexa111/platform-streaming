"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ALL_MOVIES } from "@/constants/video-data";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const movieId = parseInt(id as string);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  const movie = ALL_MOVIES.find((m) => m.id === movieId) || ALL_MOVIES[0];
  const relatedMovies = ALL_MOVIES.filter((m) => m.id !== movie.id).slice(0, 6);

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand/30 pb-20 font-sans transition-colors duration-500">
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-muted border border-border hover:bg-muted/80 transition-all group">
          <Icon name="arrow-right" className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform text-foreground" />
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push("/movies")}>
            Katalog Film
          </span>
          <Icon name="chevron-right" className="w-3 h-3" />
          <span className="text-brand line-clamp-1">{movie.title}</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-6 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Player Section */}
        <div className="xl:col-span-3 space-y-8">
          {/* Simulated Video Player */}
          <div className="group relative aspect-video bg-black rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl shadow-brand/10">
            {/* Mock Video Content */}
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
              {movie.thumbnail && <Image src={movie.thumbnail} alt="Video" fill className="object-contain opacity-80" />}
            </div>

            {/* Central Play Indicator */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full bg-brand/90 flex items-center justify-center shadow-[0_0_50px_rgba(2,77,148,0.5)] cursor-pointer hover:scale-110 transition-transform active:scale-95 group/play">
                <Icon name="play" className="w-5 h-5 md:w-6 md:h-6 lg:w-10 lg:h-10 fill-current ml-0.5 md:ml-1" />
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-20 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-t from-black via-black/60 to-transparent">
              <div className="space-y-6">
                {/* Progress Bar */}
                <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer overflow-hidden group/bar">
                  <div className="absolute inset-0 bg-brand w-[35%] rounded-full shadow-[0_0_15px_rgba(2,77,148,1)]" />
                  <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <Icon name="play" className="w-6 h-6 fill-current cursor-pointer hover:text-brand transition-colors" />
                    <div className="flex items-center gap-4 text-xs font-mono font-bold">
                      <span className="text-white">00:45:12</span>
                      <span className="text-neutral-600">/</span>
                      <span className="text-neutral-400">02:15:30</span>
                    </div>
                    <div className="flex items-center gap-3 group/vol">
                      <Icon name="volume-2" className="w-5 h-5 text-neutral-400 group-hover/vol:text-white transition-colors" />
                      <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-[70%]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <button className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">4K Ultra HD</span>
                    </button>
                    <Icon name="settings" className="w-6 h-6 text-neutral-400 hover:text-white hover:rotate-90 transition-all cursor-pointer" />
                    <Icon name="maximize" className="w-6 h-6 text-neutral-400 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Movie Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{movie.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Genre</span>
                <span className="text-sm font-bold text-foreground/80">{movie.genre}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rilis</span>
                <span className="text-sm font-bold text-foreground/80">2024</span>
              </div>
            </div>

            <div className="space-y-2 relative max-w-4xl">
              <p className={cn(
                "text-neutral-700 dark:text-muted-foreground text-xs md:text-xl leading-relaxed font-normal transition-all duration-300",
                !isSynopsisExpanded && "line-clamp-3 md:line-clamp-4"
              )}>
                {movie.description || `Temukan kisah epik dari ${movie.title}, di mana takdir bertemu dengan ketidaktahuan. Mahakarya sinematik ini membawa Anda dalam perjalanan melalui visual yang tak tertandingi dan aksi yang memacu jantung. Sebuah cerita luar biasa yang akan menguji batas keberanian dan kesetiaan Anda, dibalut dengan efek khusus pemenang penghargaan dan scoring musik orkestra megah. Jangan lewatkan tontonan yang akan mengubah cara Anda memandang dunia.`}
              </p>
              <button 
                onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                className="text-brand font-bold text-xs md:text-sm hover:underline transition-colors focus:outline-none flex items-center gap-1"
              >
                {isSynopsisExpanded ? "Sembunyikan" : "Baca Selengkapnya"}
                <Icon name={isSynopsisExpanded ? "chevron-up" : "chevron-down"} className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Up Next */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight uppercase italic flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand rounded-full" />
              Lanjut Menonton
            </h2>
          </div>

          <div className="space-y-5">
            {relatedMovies.map((m) => (
              <div key={m.id} onClick={() => router.push(`/watch/${m.id}`)} className="group flex gap-4 p-3 rounded-2xl bg-card border border-border hover:border-brand/30 transition-all cursor-pointer shadow-sm">
                <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {m.thumbnail ? (
                    <Image src={m.thumbnail} alt={m.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-background" />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <h3 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-brand transition-colors uppercase tracking-tight leading-tight">{m.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">{m.genre}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upsell Banner for Sidebar */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-brand/10 to-background border border-brand/20 space-y-4 shadow-sm">
            <Icon name="crown" className="w-8 h-8 text-brand" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">Ingin nonton tanpa iklan?</h4>
              <p className="text-xs text-muted-foreground">Upgrade ke Premium untuk kualitas 4K tanpa hambatan.</p>
            </div>
            <Link 
              href="/membership"
              className="flex items-center justify-center w-full py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Berlangganan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
