'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Icon } from '@/components/ui/Icon';
import { VideoCard } from '@/components/video/VideoCard';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { api, getMediaUrl } from '@/lib/api';
import { ProtectedVideo } from '@/components/video/ProtectedVideo';
import { VideoRow } from '@/components/video/VideoRow';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const movieId = parseInt(id as string);
  const { isAuthenticated, user } = useAuthStore();

  const [movie, setMovie] = useState<any>(null);
  const [relatedMovies, setRelatedMovies] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States to handle In-Place Player & Access
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/films/${movieId}`).catch((err) => {
        throw new Error(err.response?.data?.message || "Film tidak ditemukan");
      }),
      api.get("/films?limit=10").catch(() => ({ data: { data: [] } })),
    ])
      .then(([movieRes, relatedRes]) => {
        setMovie(movieRes.data);
        
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

  const handleWatchNow = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    // Authenticated users go to /watch/[id]
    router.push(`/watch/${movieId}`);
  };

  const handleWatchTrailer = () => {
    setIsPlaying(true);
  };

  if (loading) {
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

  const mappedMovie: Video = {
    id: movie.id,
    title: movie.title,
    genre: movie.genres && movie.genres.length > 0 ? movie.genres[0].name : "Other",
    rating: "4.8",
    quality: movie.quality || "4K UHD",
    thumbnail: movie.poster_url ? getMediaUrl(movie.poster_url) : "",
    backdrop: movie.poster_url ? getMediaUrl(movie.poster_url) : "",
    description: movie.description || "",
    trailerUrl: movie.trailer_url ? getMediaUrl(movie.trailer_url) : "",
    productionHouse: movie.production_house || "",
    productionHouseLogo: movie.production_house_logo ? getMediaUrl(movie.production_house_logo) : "",
  };

  const isTrailerLocal = movie.trailer_url?.startsWith("http") || movie.trailer_url?.includes("/uploads");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-brand/30">
      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />

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
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">
                Join SINEA
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Silakan masuk ke akun Anda atau daftar sekarang untuk menikmati
                film berkualitas di platform kami secara gratis selama periode launching.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <Link
                href="/login"
                className="flex items-center justify-center w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(2,77,148,0.3)]"
              >
                Login Sekarang
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex items-center justify-center w-full py-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-2xl font-bold transition-all"
              >
                Mungkin Nanti
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
              Premium Cinema Experience
            </p>
          </div>
        </div>
      )}

      {/* Media & Content Wrapper */}
      <div className="relative">
        {/* Hero Media Section */}
        <section className={cn("relative w-full overflow-hidden bg-black transition-all duration-700", isPlaying ? "aspect-video h-auto" : "aspect-[4/3] md:aspect-auto md:h-[85vh] bg-background")}>
          {/* Conditional Content: Backdrop OR Video Player */}
          {!isPlaying ? (
            <>
              {/* Back Button */}
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push('/home');
                  }
                }}
                className="absolute top-6 left-6 z-[60] flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 border border-white/10"
              >
                <Icon name="chevron-left" className="w-4 h-4" />
                Kembali
              </button>

              {/* Backdrop Image with mask */}
              <div className="absolute inset-0 z-0 animate-in fade-in zoom-in-105 duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-background/20 z-10" />

                {mappedMovie.thumbnail ? (
                  <Image
                    src={mappedMovie.thumbnail}
                    alt={mappedMovie.title}
                    fill
                    priority
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted via-background to-brand/10" />
                )}
              </div>
            </>
          ) : (
            /* Video Player Overlay */
            <div className="absolute inset-0 z-[60] bg-black animate-in fade-in zoom-in-95 duration-500">
              {/* Back Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 left-4 md:top-6 md:left-6 z-50 flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md text-xs md:text-sm font-semibold transition-all active:scale-95"
              >
                <Icon name="chevron-left" className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Kembali
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-1.5 md:p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all group active:scale-95"
              >
                <Icon
                  name="x"
                  className="w-4 h-4 md:w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                />
              </button>

              {/* Player Interface */}
              <div className="w-full h-full flex flex-col items-center justify-center">
                {movie.trailer_url ? (
                  isTrailerLocal ? (
                    <ProtectedVideo 
                      src={getMediaUrl(movie.trailer_url)} 
                      streamDirect={true}
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
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-neutral-900">
                    <p className="text-neutral-400">Trailer tidak tersedia untuk film ini.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Content Overlay - Moves dynamically */}
        <div
          className={cn(
            "max-w-7xl mx-auto px-6 flex flex-col space-y-3 md:space-y-8 animate-in fade-in transition-all duration-700",
            isPlaying ? "relative pt-5 pb-4" : "absolute bottom-0 left-0 right-0 z-20 h-full justify-end pt-28 pb-8 md:pb-32 bg-gradient-to-t from-background via-transparent to-transparent",
          )}
        >
          <div className="space-y-2 md:space-y-4">
            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-1.5 md:gap-4">
              <span className="px-1.5 py-0.5 md:px-3 md:py-1 rounded bg-brand/90 text-[8px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20">
                {mappedMovie.quality}
              </span>
              <div className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-sm font-bold text-yellow-500">
                <Icon
                  name="star"
                  className="w-3 h-3 md:w-4 md:h-4 fill-current"
                />
                <span>{mappedMovie.rating}</span>
              </div>
              {movie.release_year && (
                <span className="text-muted-foreground text-[10px] md:text-sm font-medium">
                  {movie.release_year}
                </span>
              )}
              {movie.duration && (
                <span className="text-muted-foreground text-[10px] md:text-sm font-medium">
                  {movie.duration} Menit
                </span>
              )}
              <div className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-muted mx-1 md:mx-2" />
              <span className="text-brand text-[10px] md:text-sm font-bold uppercase tracking-wider">
                {mappedMovie.genre}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-4xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight max-w-4xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
                {mappedMovie.title}
              </span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row items-center gap-2 md:gap-4 pt-2 md:pt-4">
            <button
              onClick={handleWatchNow}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-3 px-3 py-2 md:px-8 md:py-4 bg-brand hover:bg-brand-dark text-white rounded-full text-[10px] md:text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(2,77,148,0.3)] group"
            >
              <Icon
                name="play"
                className="w-2.5 h-2.5 md:w-5 md:h-5 fill-current transition-transform group-hover:scale-110"
              />
              Tonton Sekarang
            </button>
            {movie.trailer_url && (
              <button
                onClick={handleWatchTrailer}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-3 px-3 py-2 md:px-8 md:py-4 bg-card/50 hover:bg-card/80 backdrop-blur-md border border-border text-foreground rounded-full text-[10px] md:text-base font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Icon name="film" className="w-2.5 h-2.5 md:w-5 md:h-5" />
                Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <section className={cn("relative z-30 px-6 pb-24 max-w-7xl mx-auto transition-all duration-700", isPlaying ? "pt-10" : "-mt-6 md:-mt-20")}>
        {/* Separator Line */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10 md:mb-16 opacity-70" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-20">
          {/* Left: Synopsis & Info */}
          <div className="lg:col-span-2 space-y-6 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-3xl font-bold flex items-center gap-2 md:gap-3">
                <div className="w-1 h-5 md:h-8 bg-brand rounded-full" />
                Sinopsis
              </h2>
              <div className="space-y-2 relative">
                <p className={cn(
                  "text-neutral-700 dark:text-muted-foreground text-xs md:text-xl leading-relaxed font-normal transition-all duration-300",
                  !isSynopsisExpanded && "line-clamp-3 md:line-clamp-4"
                )}>
                  {mappedMovie.description ||
                    `Temukan kisah epik dari ${mappedMovie.title}, di mana takdir bertemu dengan ketidaktahuan. Mahakarya sinematik ini membawa Anda dalam perjalanan melalui visual yang tak tertandingi.`}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-4 md:pt-6 border-t border-border">
              <div className="space-y-1 md:space-y-2">
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Sutradara
                </span>
                <p className="font-bold text-[10px] md:text-base">
                  {movie.director || '—'}
                </p>
              </div>
              <div className="space-y-1 md:space-y-2">
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Produser
                </span>
                <p className="font-bold text-[10px] md:text-base">
                  {movie.producer || '—'}
                </p>
              </div>
              <div className="space-y-1 md:space-y-2">
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Rumah Produksi
                </span>
                <div className="flex items-center gap-2 md:gap-4">
                  {mappedMovie.productionHouseLogo && (
                    <div className="w-8 h-8 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 p-1.5 md:p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={mappedMovie.productionHouseLogo}
                        alt="Studio Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <p className="font-bold text-[10px] md:text-base leading-tight">
                    {mappedMovie.productionHouse || 'Lalakon Originals'}
                  </p>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <span className="text-[8px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Tahun Rilis
                </span>
                <p className="font-bold text-[10px] md:text-base">
                  {movie.release_year || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Cast / Sidebar Details */}
          <div className="space-y-6 md:space-y-10 bg-muted/30 p-5 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-border backdrop-blur-sm h-fit">
            <h3 className="text-base md:text-xl font-bold border-b border-border pb-3 md:pb-4">
              Pemeran Utama
            </h3>
            <div className="space-y-4 md:space-y-6 max-h-[250px] overflow-y-auto pr-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brand/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand transition-colors">
              {movie.actors && movie.actors.length > 0 ? (
                movie.actors.map((actor: any, i: number) => (
                  <div key={i} className="group">
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-xs md:text-sm font-bold group-hover:text-brand transition-colors">
                        {actor.name}
                      </p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                        Pemeran
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">Tidak ada daftar pemeran.</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Content Section */}
        {relatedMovies.length > 0 && (
          <div className="space-y-6 md:space-y-10 pt-4 md:pt-10">
            {/* Separator Line */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-70 mb-6 md:mb-10" />

            <div className="flex items-end justify-between">
              <div className="space-y-1 md:space-y-3">
                <h2 className="text-xl md:text-5xl font-bold tracking-tight">
                  Film Serupa
                </h2>
                <p className="text-[10px] md:text-base text-muted-foreground">
                  Film pilihan yang mungkin Anda sukai berdasarkan minat Anda.
                </p>
              </div>
            </div>

            <VideoRow videos={relatedMovies} viewAllHref="/movies" />
          </div>
        )}
      </section>
    </main>
  );
}
