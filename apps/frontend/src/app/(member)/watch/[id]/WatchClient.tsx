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
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [movie, setMovie] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Coin Access States
  const [accessInfo, setAccessInfo] = useState<{
    has_access: boolean;
    expires_at: string | null;
    coin_price: number;
    user_coins: number;
  }>({
    has_access: false,
    expires_at: null,
    coin_price: 15,
    user_coins: 0,
  });

  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [buyingFilm, setBuyingFilm] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [showInsufficientCoinsModal, setShowInsufficientCoinsModal] = useState(false);

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
    if (mounted && !authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [mounted, authLoading, isAuthenticated]);

  useEffect(() => {
    if (streamError === "Unauthorized") {
      setShowAuthModal(true);
    }
  }, [streamError]);

  useEffect(() => {
    if (movieId === undefined || isNaN(movieId)) return;
    setLoading(true);
    setError(null);
    setStreamError(null);
    setIsPlayingTrailer(false);

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
          setAccessInfo({ has_access: true, expires_at: null, coin_price: 0, user_coins: 999 });

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
      api.get(`/films/${movieId}/access`, { withCredentials: true }).catch(() => ({
        data: { has_access: false, expires_at: null, coin_price: 15, user_coins: 0 },
      })),
      api.get(`/films/${movieId}/stream`, { withCredentials: true }).catch((err) => {
        console.warn("Stream URL fetch failed", err);
        return { data: { stream_url: null, error: err.response?.data?.message || "Gagal memuat stream" } };
      }),
      api.get("/films?limit=10").catch(() => ({ data: { data: [] } })),
    ])
      .then(([movieRes, accessRes, streamRes, relatedRes]) => {
        setMovie(movieRes.data);
        setAccessInfo(accessRes.data);

        if (accessRes.data?.has_access) {
          setStreamUrl(streamRes.data?.stream_url || null);
          setStreamError(streamRes.data?.error || null);
        } else {
          setStreamUrl(null);
        }

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

  const handleBuyFilm = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      setBuyingFilm(true);
      setBuyError(null);

      const res = await api.post(`/films/${movieId}/buy`, {}, { withCredentials: true });
      
      // Successfully bought film
      const accessRes = await api.get(`/films/${movieId}/access`, { withCredentials: true });
      setAccessInfo(accessRes.data);

      const streamRes = await api.get(`/films/${movieId}/stream`, { withCredentials: true });
      setStreamUrl(streamRes.data?.stream_url || null);
      setIsPlayingTrailer(false);
      
      // Update global user profile to reflect remaining coins
      useAuthStore.getState().fetchProfile();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal membeli film.";
      if (msg.includes("Koin Anda tidak cukup") || msg.includes("koin")) {
        setShowInsufficientCoinsModal(true);
      } else {
        setBuyError(msg);
      }
    } finally {
      setBuyingFilm(false);
    }
  };

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
      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-8">
            {/* Icon Group */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center border border-brand/20">
                <Icon name="lock" className="w-10 h-10 text-brand" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-4 border-card">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Join SINEA</h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">Silakan masuk ke akun Anda atau daftar sekarang untuk menikmati film berkualitas di platform kami secara gratis selama periode launching.</p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <Link
                href="/login"
                className="flex items-center justify-center w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(2,77,148,0.3)]"
              >
                Login Sekarang
              </Link>
              <button onClick={() => setShowAuthModal(false)} className="flex items-center justify-center w-full py-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-2xl font-bold transition-all">
                Mungkin Nanti
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">Premium Cinema Experience</p>
          </div>
        </div>
      )}

      {/* Insufficient Coins Modal Overlay */}
      {showInsufficientCoinsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowInsufficientCoinsModal(false)} />
          <div className="relative w-full max-w-md bg-card border border-amber-500/30 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-4xl">
              🪙
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Koin Anda Tidak Cukup</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Koin Anda saat ini: <strong className="text-amber-500 font-bold">{user?.coins ?? 0} Koin</strong>.<br />
                Harga akses film ini: <strong className="text-amber-500 font-bold">{movie?.coin_price || 15} Koin</strong>.
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <Link
                href="/coins"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-500/20 text-sm"
              >
                Top Up Koin Sekarang
                <Icon name="arrow-right" className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setShowInsufficientCoinsModal(false)}
                className="flex items-center justify-center w-full py-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-2xl font-bold transition-all text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb / Back Navigation */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
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

        {/* User Coins Status */}
        {isAuthenticated && (
          <Link
            href="/coins"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-xs font-bold transition-all"
          >
            <span>🪙</span>
            <span>{user?.coins ?? 0} Koin</span>
          </Link>
        )}
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-6 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Player Section */}
        <div className="xl:col-span-3 space-y-8">
          {/* Active Video Player / Locked Screen */}
          <div 
            className="group relative aspect-video bg-black overflow-hidden shadow-2xl shadow-brand/10 rounded-2xl"
            onContextMenu={(e) => e.preventDefault()}
          >
            {isPlayingTrailer && movie.trailer_url ? (
              <div className="relative w-full h-full">
                <video
                  src={getMediaUrl(movie.trailer_url)}
                  autoPlay
                  controls
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-lg z-20">
                  Trailer Gratis
                </div>
              </div>
            ) : accessInfo.has_access && streamUrl ? (
              <Player
                variant="movie"
                title={movie.title}
                src={streamUrl}
                poster={movie.id === 0 ? movie.poster_url : (movie.poster_url ? getMediaUrl(movie.poster_url) : "")}
                className="w-full h-full"
              />
            ) : (
              /* Locked Film Banner Overlay */
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-5 bg-gradient-to-t from-black via-black/90 to-black/80">
                {movie.poster_url && (
                  <img
                    src={getMediaUrl(movie.poster_url)}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md pointer-events-none"
                  />
                )}

                <div className="relative z-10 w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 animate-pulse text-3xl shadow-xl">
                  🔒
                </div>

                <div className="relative z-10 space-y-2 max-w-md">
                  <h3 className="text-2xl font-black text-white">Film Terkunci</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    Beli akses film ini dengan <strong className="text-amber-400 font-bold">{movie.coin_price || 15} Koin</strong> untuk masa aktif <strong className="text-amber-400 font-bold">30 Hari</strong> penuh.
                  </p>
                </div>

                {buyError && (
                  <div className="relative z-10 text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                    ⚠️ {buyError}
                  </div>
                )}

                <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
                  <button
                    onClick={handleBuyFilm}
                    disabled={buyingFilm}
                    className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <span>{buyingFilm ? "Memproses..." : `Beli Akses (${movie.coin_price || 15} Koin)`}</span>
                    <Icon name="arrow-right" className="w-4 h-4" />
                  </button>

                  {movie.trailer_url && (
                    <button
                      onClick={() => setIsPlayingTrailer(true)}
                      className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
                    >
                      <Icon name="play" className="w-4 h-4 text-amber-400" />
                      <span>Tonton Trailer Gratis</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">{movie.title}</h1>
              {accessInfo.has_access && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-xs flex items-center gap-1.5">
                  <span>✅</span>
                  <span>Akses Aktif (30 Hari)</span>
                </span>
              )}
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
