"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ALL_MOVIES } from "@/constants/video-data";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Player } from "@/components/video/Player";

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const movieId = parseInt(id as string);
  const { user } = useAuthStore();
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    // Simulasi fetch pre-signed URL dari backend Sinea
    const timer = setTimeout(() => {
      // Kita gunakan file MP4 resmi dari Vidstack agar stabil
      // Ini 100% kompatibel dan tidak ada isu "auto-pause" seperti iframe YouTube
      setVideoUrl("https://files.vidstack.io/sprite-fight/720p.mp4");
    }, 1500);
    return () => clearTimeout(timer);
  }, [movieId]);



  // Keyboard shortcut blockers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        try {
          navigator.clipboard.writeText("");
        } catch (_) {}
        alert("Pengambilan gambar layar (screenshot) tidak diperbolehkan demi melindungi hak cipta.");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        alert("Pencetakan halaman dilindungi.");
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s")) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          {/* Video Player — tampilkan hanya setelah URL siap */}
          <div onContextMenu={(e) => e.preventDefault()}>
            {videoUrl ? (
              <Player 
                variant="movie" 
                src={videoUrl} 
                poster={movie.thumbnail} 
                title={movie.title}
              />
            ) : (
              <div className="w-full aspect-video bg-neutral-900 flex flex-col items-center justify-center rounded-[2rem] border border-white/5 shadow-2xl">
                <div className="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin mb-4" />
                <p className="text-sm text-neutral-400 font-bold uppercase tracking-widest animate-pulse">Memuat Video...</p>
                <p className="text-xs text-neutral-600 mt-2">Menyiapkan stream aman untuk Anda...</p>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{movie.title}</h1>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20">
                <Icon name="star" className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{movie.rating}</span>
              </div>
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
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Kualitas</span>
                <span className="text-sm font-bold text-brand">{movie.quality}</span>
              </div>
            </div>

            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed font-light max-w-4xl">
              {movie.description || "Discover the epic journey of this masterpiece. Immerse yourself in the world of storytelling with high-quality visual experience only on Sinea."}
            </p>
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
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-black text-white">{m.quality}</div>
                </div>
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <h3 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-brand transition-colors uppercase tracking-tight leading-tight">{m.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">{m.genre}</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="text-[9px] font-bold text-yellow-500">{m.rating}</span>
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
