"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import Image from "next/image";
import Link from "next/link";

export default function SecretWatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const movieId = parseInt(id as string);

  const [movie, setMovie] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/films/${movieId}`).catch((err) => {
        throw new Error(err.response?.data?.message || "Film tidak ditemukan");
      }),
      api.get(`/films/${movieId}/stream`).catch((err) => {
        // If stream fails (e.g. dummy video_id or not logged in), capture error but don't break page
        console.warn("Stream URL fetch failed", err);
        return { data: { stream_url: null, error: err.response?.data?.message || "Gagal memuat stream" } };
      }),
      api.get("/films?limit=10").catch(() => ({ data: { data: [] } })),
    ])
      .then(([movieRes, streamRes, relatedRes]) => {
        setMovie(movieRes.data);
        setStreamUrl(streamRes.data?.stream_url || null);
        if (!streamRes.data?.stream_url) {
          setError(streamRes.data?.error || "Film ini belum memiliki video di BunnyCDN (atau sesi Anda berakhir).");
        }
        
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

  return (
    <div className="bg-neutral-950 min-h-screen text-white pb-20 font-sans transition-colors duration-500 selection:bg-brand/30">
      {/* Top Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/vR4nTy8cL1")} className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-all text-white flex items-center gap-2 text-xs font-bold pr-4">
              <Icon name="arrow-right" className="w-4 h-4 rotate-180" />
              Secret Dashboard
            </button>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
              <span className="text-brand line-clamp-1">{movie?.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-black tracking-widest border border-red-500/20 uppercase">
              BunnyCDN Real Stream
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-8 grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
        {/* Main Player Section */}
        <div className="xl:col-span-3 space-y-8">
          {streamUrl ? (
            <div className="relative aspect-video bg-black rounded-[2rem] overflow-hidden border border-neutral-800 shadow-2xl shadow-brand/10">
              <iframe
                src={streamUrl}
                loading="lazy"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                className="w-full h-full border-none absolute inset-0"
              />
            </div>
          ) : (
            <div className="relative aspect-video bg-neutral-900 rounded-[2rem] overflow-hidden border border-neutral-800 shadow-2xl flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                <Icon name="film" className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-black text-white">Stream Tidak Tersedia</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {error || "Video asli belum ditautkan ke film ini di BunnyCDN, atau sesi otentikasi Anda telah berakhir."}
                </p>
              </div>
            </div>
          )}

          {/* Movie Info */}
          {movie && (
            <div className="space-y-6 bg-neutral-900/50 border border-neutral-800/80 rounded-[2rem] p-8 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{movie.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand font-black text-xs uppercase tracking-widest">
                    {movie.quality || "4K UHD"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs">
                    {movie.release_year || "2026"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genres?.map((g: any) => (
                  <span key={g.id} className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold border border-neutral-700/50">
                    {g.name}
                  </span>
                ))}
                {movie.duration && (
                  <span className="px-3 py-1 rounded-xl bg-neutral-800 text-neutral-400 text-xs font-bold border border-neutral-700/50 flex items-center gap-1.5">
                    <Icon name="clock" className="w-3.5 h-3.5" />
                    {movie.duration} Menit
                  </span>
                )}
              </div>

              <p className="text-neutral-400 leading-relaxed font-light text-base md:text-lg max-w-4xl border-t border-neutral-800/80 pt-6">
                {movie.description || "Tidak ada deskripsi yang tersedia untuk film ini."}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: Up Next */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-lg font-black tracking-wider uppercase italic flex items-center gap-3 text-white">
              <div className="w-1.5 h-5 bg-brand rounded-full" />
              Film Lainnya
            </h2>
          </div>

          <div className="space-y-4">
            {relatedMovies.map((m) => (
              <Link key={m.id} href={`/vR4nTy8cL1/watch/${m.id}`} className="group flex gap-4 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-brand/30 transition-all cursor-pointer shadow-sm block">
                <div className="flex gap-4 items-center">
                  <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0 border border-neutral-700/30">
                    {m.poster_url ? (
                      <Image src={m.poster_url} alt={m.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-neutral-600 font-bold text-xs">
                        ?
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <div className="flex flex-col justify-center gap-2 min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-brand transition-colors leading-snug">{m.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {m.genres?.slice(0, 2).map((g: any) => (
                        <span key={g.id} className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium">
                          {g.name}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-neutral-500 font-medium mt-1">{m.release_year || "—"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
