"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";
import { Player } from "@/components/video/Player";

export default function WatchClient({ movieId }: { movieId: number }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [movie, setMovie] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keyboard shortcut blockers (PrintScreen, Ctrl+P, Ctrl+Shift+S)
  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    if (movieId === undefined || isNaN(movieId)) return;
    setLoading(true);
    setError(null);
    setStreamError(null);

    if (movieId === 0) {
      // Special event banner configuration (Sinea Rekap Acara)
      api.get("/films?limit=10")
        .then((relatedRes) => {
          setMovie({
            id: 0,
            title: "Sinea Rekap Acara",
            genres: [{ name: "Special Event" }],
            description: "Tonton rangkuman keseruan acara Sinea Rekap.",
            poster_url: "/SINEA - Logo Horisontal.webp",
            release_year: "2026",
            duration: 3,
          });
          setStreamUrl("/uploads/banner_rekap/Trailer-FFAB-Draft-2.mp4");
          
          const all = relatedRes.data?.data || [];
          const mapped = all
            .filter((m: any) => m.id !== 0)
            .slice(0, 6)
            .map((film: any): Video => ({
              id: film.id,
              title: film.title,
              genre: film.genres && film.genres.length > 0 ? film.genres[0].name : "Other",
              rating: "4.8",
              quality: "4K UHD",
              thumbnail: film.poster_url ? getMediaUrl(film.poster_url) : "",
              backdrop: film.poster_url ? getMediaUrl(film.poster_url) : "",
              description: film.description || "",
              trailerUrl: film.trailer_url ? getMediaUrl(film.trailer_url) : "",
              productionHouse: film.production_house || "",
              productionHouseLogo: film.production_house_logo ? getMediaUrl(film.production_house_logo) : "",
            }));
          setRelatedMovies(mapped);
        })
        .catch((err) => {
          console.error("Failed to fetch related movies for special event", err);
          setError("Gagal memuat rekomendasi film.");
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    Promise.all([
      api.get(`/films/${movieId}`, { withCredentials: true }).catch((err) => {
        throw new Error(err.response?.data?.message || "Film tidak ditemukan");
      }),
      api.get(`/films/${movieId}/stream`, { withCredentials: true }).catch((err) => {
        console.warn("Stream URL fetch failed", err);
        return { data: { stream_url: null, error: err.response?.data?.message || "Gagal memuat stream" } };
      }),
      api.get("/films?limit=10").catch(() => ({ data: { data: [] } })),
    ])
      .then(([movieRes, streamRes, relatedRes]) => {
        setMovie(movieRes.data);
        setStreamUrl(streamRes.data?.stream_url || null);
        setStreamError(streamRes.data?.error || null);
        
        const all = relatedRes.data?.data || [];
        const mapped = all
          .filter((m: any) => m.id !== movieId)
          .slice(0, 6)
          .map((film: any): Video => ({
            id: film.id,
            title: film.title,
            genre: film.genres && film.genres.length > 0 ? film.genres[0].name : "Other",
            rating: "4.8",
            quality: "4K UHD",
            thumbnail: film.poster_url ? getMediaUrl(film.poster_url) : "",
            backdrop: film.poster_url ? getMediaUrl(film.poster_url) : "",
            description: film.description || "",
            trailerUrl: film.trailer_url ? getMediaUrl(film.trailer_url) : "",
            productionHouse: film.production_house || "",
            productionHouseLogo: film.production_house_logo ? getMediaUrl(film.production_house_logo) : "",
          }));
        setRelatedMovies(mapped);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [movieId]);

  if (!mounted || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
          <Icon name="x" className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black">{error || "Film tidak ditemukan"}</h2>
        <button onClick={() => router.push("/movies")} className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold text-sm transition-all border border-neutral-850">
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand/30 pb-20 font-sans transition-colors duration-500">
      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 flex items-center gap-4">
        <button 
          onClick={() => {
            if (movieId === 0) {
              router.push("/home");
            } else {
              router.push(`/movies/${movieId}`);
            }
          }} 
          className="p-2 rounded-full bg-muted border border-border hover:bg-muted/80 transition-all group"
        >
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
          {/* Active Video Player */}
          <div 
            className="group relative aspect-video bg-black overflow-hidden shadow-2xl shadow-brand/10"
            onContextMenu={(e) => e.preventDefault()}
          >
            {streamUrl ? (
              <Player
                variant="movie"
                title={movie.title}
                src={streamUrl}
                poster={movie.id === 0 ? movie.poster_url : (movie.poster_url ? getMediaUrl(movie.poster_url) : "")}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
                  <Icon name="lock" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {streamError || "Stream Tidak Tersedia"}
                </h3>
                <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                  {streamError 
                    ? "Film ini belum memasuki jadwal tayang resminya. Silakan kembali lagi saat film telah dirilis." 
                    : "Video asli belum ditautkan ke film ini di Cloudflare R2, atau sesi otentikasi Anda telah berakhir."}
                </p>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{movie.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Genre</span>
                <span className="text-sm font-bold text-foreground/80">
                  {movie.genres && movie.genres.length > 0 ? movie.genres[0].name : "Other"}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              {movie.release_year && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rilis</span>
                    <span className="text-sm font-bold text-foreground/80">{movie.release_year}</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                </>
              )}
              {movie.duration && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Durasi</span>
                  <span className="text-sm font-bold text-foreground/80">{movie.duration} Menit</span>
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}
