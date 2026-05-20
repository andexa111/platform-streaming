"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getMediaUrl } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

export default function SecretWatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const movieId = parseInt(id as string);
  const { user } = useAuthStore();

  const [movie, setMovie] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // playMode can be: "none" | "movie" | "trailer"
  const [playMode, setPlayMode] = useState<"none" | "movie" | "trailer">("none");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPlayMode("none");

    Promise.all([
      api.get(`/films/${movieId}`).catch((err) => {
        throw new Error(err.response?.data?.message || "Film tidak ditemukan");
      }),
      api.get(`/films/${movieId}/stream`).catch((err) => {
        console.warn("Stream URL fetch failed", err);
        return { data: { stream_url: null, error: err.response?.data?.message || "Gagal memuat stream" } };
      }),
      api.get("/films?limit=10").catch(() => ({ data: { data: [] } })),
    ])
      .then(([movieRes, streamRes, relatedRes]) => {
        setMovie(movieRes.data);
        setStreamUrl(streamRes.data?.stream_url || null);
        
        const all = relatedRes.data?.data || [];
        setRelatedMovies(all.filter((m: any) => m.id !== movieId).slice(0, 6));
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [movieId]);

  if (loading) {
    return (
      <div className="bg-neutral-950 min-h-screen flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie && error) {
    return (
      <div className="bg-neutral-950 min-h-screen flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
          <Icon name="x" className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black">{error}</h2>
        <button onClick={() => router.push("/vR4nTy8cL1")} className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl font-bold text-sm transition-all border border-neutral-800">
          Kembali ke Secret Dashboard
        </button>
      </div>
    );
  }

  const isTrailerLocal = movie?.trailer_url?.startsWith("http") || movie?.trailer_url?.includes("/uploads");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-brand/30 pb-24 font-sans transition-colors duration-300">
      {/* Top Navigation Bar */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/vR4nTy8cL1")} 
              className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-all text-foreground flex items-center gap-2 text-xs font-bold pr-4 group border border-border"
            >
              <Icon name="arrow-right" className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Secret Dashboard
            </button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <Icon name="chevron-right" className="w-3 h-3" />
              <span className="text-brand line-clamp-1">{movie?.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand/10 border border-brand/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-brand uppercase tracking-wider">
                  {user.name} ({user.role})
                </span>
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest border border-red-500/20 uppercase">
                Mode Uji Coba (Guest)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hero Media Section (Backdrop / Video Player) */}
      <div className="relative">
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-black border-b border-border">
          {playMode === "none" ? (
            <>
              {/* Backdrop Poster Image with Gradients */}
              <div className="absolute inset-0 z-0 animate-in fade-in zoom-in-105 duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-background/30 z-10" />

                {movie?.poster_url ? (
                  <Image
                    src={getMediaUrl(movie.poster_url)}
                    alt={movie.title}
                    fill
                    priority
                    className="object-cover object-center opacity-85"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted via-background to-brand/10" />
                )}
              </div>

              {/* Title & Actions Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-20 max-w-[1600px] mx-auto px-6 pb-16 flex flex-col justify-end h-full">
                <div className="space-y-6 max-w-4xl">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded bg-brand/90 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20">
                      {movie?.quality || "4K UHD"}
                    </span>
                    <span className="text-muted-foreground text-xs font-bold">
                      {movie?.release_year || "2026"}
                    </span>
                    {movie?.duration && (
                      <span className="text-muted-foreground text-xs font-bold flex items-center gap-1">
                        <Icon name="clock" className="w-3.5 h-3.5" />
                        {movie.duration} Menit
                      </span>
                    )}
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                    <div className="flex gap-2">
                      {movie?.genres?.map((g: any) => (
                        <span key={g.id} className="text-brand text-xs font-black uppercase tracking-wider">
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Movie Title */}
                  <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/75">
                    {movie?.title}
                  </h1>

                  {/* Synopsis snippet */}
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed line-clamp-3 font-medium max-w-3xl">
                    {movie?.description || "Tidak ada deskripsi yang tersedia untuk film ini."}
                  </p>

                  {/* Play Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => setPlayMode("movie")}
                      className="flex items-center justify-center gap-3 px-8 py-4 bg-brand hover:bg-brand-dark text-white rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(2,77,148,0.4)] group"
                    >
                      <Icon name="play" className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                      Putar Film
                    </button>
                    {movie?.trailer_url && (
                      <button
                        onClick={() => setPlayMode("trailer")}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-muted/60 hover:bg-muted/80 backdrop-blur-md border border-border text-foreground rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                      >
                        <Icon name="film" className="w-4 h-4" />
                        Lihat Trailer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Active Video Player View */
            <div className="absolute inset-0 z-40 bg-black animate-in fade-in duration-500">
              {/* Back to details button */}
              <button
                onClick={() => setPlayMode("none")}
                className="absolute top-6 left-6 z-50 px-4 py-2 bg-black/60 hover:bg-black/85 text-white rounded-xl backdrop-blur-md transition-all flex items-center gap-2 border border-neutral-800/80 text-xs font-bold"
              >
                <Icon name="arrow-right" className="w-3.5 h-3.5 rotate-180" />
                Kembali ke Info Film
              </button>

              {playMode === "movie" ? (
                streamUrl ? (
                  <iframe
                    src={streamUrl}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    className="w-full h-full border-none absolute inset-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                      <Icon name="film" className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Stream Tidak Tersedia</h3>
                    <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                      Video asli belum ditautkan ke film ini di BunnyCDN, atau sesi otentikasi Anda telah berakhir.
                    </p>
                  </div>
                )
              ) : (
                /* Trailer playback mode */
                movie?.trailer_url ? (
                  isTrailerLocal ? (
                    <video 
                      src={getMediaUrl(movie.trailer_url)} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain absolute inset-0 bg-black" 
                    />
                  ) : (
                    <iframe
                      src={`https://iframe.mediadelivery.net/embed/245642/${movie.trailer_url}?autoplay=true`}
                      loading="lazy"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                      className="w-full h-full border-none absolute inset-0"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                    <p className="text-neutral-400">Trailer tidak tersedia untuk film ini.</p>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* Detail Section & Cast Information */}
      <section className="max-w-[1600px] mx-auto px-6 mt-16 grid grid-cols-1 xl:grid-cols-4 gap-12">
        {/* Left columns: Synopsis & Details */}
        <div className="xl:col-span-3 space-y-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic tracking-wider flex items-center gap-3 text-foreground">
              <div className="w-1.5 h-6 bg-brand rounded-full" />
              Sinopsis Film
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-light">
              {movie?.description || "Tidak ada deskripsi/sinopsis yang tersedia untuk film ini."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sutradara</span>
              <p className="font-bold text-sm md:text-base text-foreground">{movie?.director || "—"}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Produser</span>
              <p className="font-bold text-sm md:text-base text-foreground">{movie?.producer || "—"}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rumah Produksi</span>
              <div className="flex items-center gap-3">
                {movie?.production_house_logo && (
                  <div className="w-10 h-10 rounded-xl bg-card border border-border p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getMediaUrl(movie.production_house_logo)} alt="Studio Logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <p className="font-bold text-sm md:text-base text-foreground">{movie?.producer || "Lalakon Originals"}</p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tahun Rilis</span>
              <p className="font-bold text-sm md:text-base text-foreground">{movie?.release_year || "—"}</p>
            </div>
          </div>
        </div>

        {/* Right column: Pemeran Utama / Cast */}
        <div className="space-y-8 bg-card/40 p-8 rounded-3xl border border-border backdrop-blur-sm h-fit">
          <h3 className="text-lg font-black uppercase italic tracking-wider border-b border-border pb-4 text-foreground">
            Pemeran Utama
          </h3>
          <div className="space-y-6">
            {movie?.actors && movie.actors.length > 0 ? (
              movie.actors.map((actor: any) => (
                <div key={actor.id} className="group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                      {actor.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Aktor / Aktris</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">Tidak ada daftar pemeran.</p>
            )}
          </div>
        </div>
      </section>

      {/* Related Content / Film Serupa */}
      <section className="max-w-[1600px] mx-auto px-6 mt-20 space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black tracking-wider uppercase italic flex items-center gap-3 text-foreground">
            <div className="w-1.5 h-6 bg-brand rounded-full" />
            Film Serupa
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {relatedMovies.map((m) => (
            <Link 
              key={m.id} 
              href={`/vR4nTy8cL1/watch/${m.id}`} 
              className="group flex flex-col bg-card border border-border hover:border-brand/40 transition-all rounded-2xl overflow-hidden cursor-pointer shadow-sm block"
            >
              <div className="relative aspect-[2/3] w-full bg-muted overflow-hidden">
                {m.poster_url ? (
                  <Image 
                    src={getMediaUrl(m.poster_url)} 
                    alt={m.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-bold text-xs">
                    ?
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-brand/80 text-[8px] font-black text-white uppercase tracking-widest">
                  {m.quality || "4K UHD"}
                </div>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-brand transition-colors uppercase tracking-tight">
                  {m.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                  <span>{m.release_year || "—"}</span>
                  {m.genres && m.genres.length > 0 && (
                    <span className="text-brand/80">{m.genres[0].name}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
