"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import { Player } from "@/components/video/Player";
import { api, getMediaUrl } from "@/lib/api";

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
// HLS stream publik dari Mux untuk testing (Big Buck Bunny)
const DUMMY_STREAM_URL =
  "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

// Picsum photos — id stabil, selalu tersedia
const DUMMY_POSTER = "https://picsum.photos/seed/bigbuckbunny/800/450";

const DUMMY_MOVIE = {
  title: "Big Buck Bunny",
  genres: [{ id: 1, name: "Animasi" }],
  release_year: 2008,
  duration: 9,
  description:
    "Big Buck Bunny menceritakan kisah seekor kelinci besar yang hidup damai di hutan. Ketenangan hidupnya terusik oleh tiga ekor tupai nakal. Dengan kesabaran yang akhirnya habis, sang kelinci pun memutuskan untuk membalas kenakalan mereka dengan cara yang jenaka dan tidak terduga. Film animasi pendek open-source legendaris karya Blender Foundation ini merupakan salah satu karya 3D open-source terbaik sepanjang masa.",
  poster_url: DUMMY_POSTER,
  directors: [{ id: 1, name: "Sacha Goedegebure", photo_url: null }],
  actors: [
    { id: 1, name: "Big Buck (Voice)", photo_url: null },
    { id: 2, name: "Frank (Voice)", photo_url: null },
    { id: 3, name: "Rinky (Voice)", photo_url: null },
    { id: 4, name: "Gimera (Voice)", photo_url: null },
  ],
  producer: "Ton Roosendaal",
  production_house: "Blender Foundation",
  categories: [{ id: 1, name: "Film Pendek" }],
};

const DUMMY_RELATED = [
  {
    id: "demo",
    title: "Big Buck Bunny",
    genre: "Animasi",
    thumbnail: "https://picsum.photos/seed/bigbuckbunny/320/180",
  },
  {
    id: "demo",
    title: "Elephant Dream",
    genre: "Animasi",
    thumbnail: "https://picsum.photos/seed/elephantdream/320/180",
  },
  {
    id: "demo",
    title: "Sintel",
    genre: "Fantasi",
    thumbnail: "https://picsum.photos/seed/sintel/320/180",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function WatchDemoPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [movie, setMovie] = useState<any>(DUMMY_MOVIE);
  const [streamUrl, setStreamUrl] = useState<string>(DUMMY_STREAM_URL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    const params = new URLSearchParams(window.location.search);
    const filmIdStr = params.get("id");
    if (filmIdStr) {
      const filmId = parseInt(filmIdStr);
      if (!isNaN(filmId)) {
        setLoading(true);
        setError(null);
        Promise.all([
          api.get(`/films/${filmId}`, { withCredentials: true }),
          api.get(`/films/${filmId}/stream`, { withCredentials: true })
        ])
          .then(([movieRes, streamRes]) => {
            setMovie(movieRes.data);
            setStreamUrl(streamRes.data?.stream_url || "");
            if (streamRes.data?.error) {
              setError(streamRes.data.error);
            }
          })
          .catch((err) => {
            console.error("Gagal memuat film riil untuk demo:", err);
            setError(err.response?.data?.message || "Gagal memuat film.");
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
  }, []);

  if (!mounted || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const resolvedPoster = movie.id === undefined || movie.id === 0 
    ? movie.poster_url 
    : (movie.poster_url ? getMediaUrl(movie.poster_url) : "");

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-brand/30 pb-20 font-sans transition-colors duration-500">
      {/* Demo Notice Banner */}
      <div className="w-full bg-yellow-500/10 border-b border-yellow-500/20 py-2 px-6 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400">
          Halaman Demo — Data {movie.id === undefined || movie.id === 0 ? "dummy" : "riil"} untuk preview tampilan video player
        </span>
      </div>

      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 flex items-center gap-4">
        <button
          onClick={() => router.push("/movies")}
          className="p-2 rounded-full bg-muted border border-border hover:bg-muted/80 transition-all group"
        >
          <Icon
            name="arrow-right"
            className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform text-foreground"
          />
        </button>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <span
            className="hover:text-white cursor-pointer transition-colors"
            onClick={() => router.push("/movies")}
          >
            Katalog Film
          </span>
          <Icon name="chevron-right" className="w-3 h-3" />
          <span className="text-brand line-clamp-1">{movie.title}</span>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-6 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Player Section */}
        <div className="xl:col-span-3 space-y-8">
          {/* Active Video Player — same component as real watch page */}
          <div
            className="group relative aspect-video bg-black overflow-hidden shadow-2xl shadow-brand/10"
            onContextMenu={(e) => e.preventDefault()}
          >
            {error ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 animate-pulse">
                  <Icon name="lock" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {error}
                </h3>
                <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                  Silakan login atau pastikan film sudah memiliki file video asli yang terunggah.
                </p>
              </div>
            ) : (
              <Player
                variant="movie"
                title={movie.title}
                src={streamUrl}
                poster={resolvedPoster}
                className="w-full h-full"
                crossOrigin="anonymous"
              />
            )}
          </div>

          {/* Movie Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                {movie.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Genre
                </span>
                <span className="text-sm font-bold text-foreground/80">
                  {movie.genres && movie.genres.length > 0 ? movie.genres[0].name : "Other"}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Rilis
                </span>
                <span className="text-sm font-bold text-foreground/80">
                  {movie.release_year || "-"}
                </span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Durasi
                </span>
                <span className="text-sm font-bold text-foreground/80">
                  {movie.duration ? `${movie.duration} Menit` : "-"}
                </span>
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
            {DUMMY_RELATED.map((m, i) => (
              <div
                key={i}
                className="group flex gap-4 p-3 rounded-2xl bg-card border border-border hover:border-brand/30 transition-all cursor-pointer shadow-sm"
                onClick={() => router.push(`/watch/demo`)}
              >
                <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={m.thumbnail}
                    alt={m.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <h3 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-brand transition-colors uppercase tracking-tight leading-tight">
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {m.genre}
                    </span>
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
