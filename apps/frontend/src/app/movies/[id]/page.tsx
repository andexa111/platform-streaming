'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Icon } from '@/components/ui/Icon';
import { VideoCard } from '@/components/video/VideoCard';
import { cn } from '@/lib/utils';
import { Video } from '@/types/video';
import { Player } from '@/components/video/Player';

import { ALL_MOVIES } from '@/constants/video-data';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const movieId = parseInt(id as string);
  const { isAuthenticated, user } = useAuthStore();

  // States to handle In-Place Player & Access
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const movie = ALL_MOVIES.find((m) => m.id === movieId) || ALL_MOVIES[0];
  const relatedMovies = ALL_MOVIES.filter((m) => m.id !== movie.id).slice(0, 6);

  const handleWatchNow = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    // Logic: Free users go to /watch with limited access/ads (backend handled)
    // Premium users go to /watch with full access
    router.push(`/watch/${movie.id}`);
  };

  const handleWatchTrailer = () => {
    // Both Public and Member can watch trailer in overlay
    setIsPlaying(true);
  };

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
                ribuan film berkualitas 4K di platform kami.
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
        <section className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-background">
          {/* Conditional Content: Backdrop OR Video Player */}
          {!isPlaying ? (
            <>
              {/* Backdrop Image with mask */}
              <div className="absolute inset-0 z-0 animate-in fade-in zoom-in-105 duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-background/20 z-10" />

                {movie.thumbnail ? (
                  <Image
                    src={movie.thumbnail}
                    alt={movie.title}
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
            <div className="absolute inset-0 z-[60] bg-black animate-in fade-in duration-500">
              {/* Close Button */}
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all group active:scale-95"
              >
                <Icon
                  name="x"
                  className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
                />
              </button>

              {/* Real Vidstack Trailer Player */}
              <div className="w-full h-full flex items-center justify-center p-0">
                <Player
                  variant="trailer"
                  src={movie.trailerUrl || ""}
                  poster={movie.thumbnail}
                  title={`Trailer — ${movie.title}`}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full rounded-none border-0"
                />
              </div>
            </div>
          )}
        </section>

        {/* Content Overlay - Moves dynamically */}
        <div
          className={cn(
            'max-w-7xl mx-auto px-6 flex flex-col space-y-6 md:space-y-8 animate-in fade-in transition-all duration-700',
            isPlaying
              ? 'relative pt-5 pb-4'
              : 'absolute bottom-0 left-0 right-0 z-20 h-full justify-end pb-20 md:pb-32 bg-gradient-to-t from-background via-transparent to-transparent'
          )}
        >
          <div className="space-y-4">
            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="px-2 py-0.5 md:px-3 md:py-1 rounded bg-brand/90 text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20">
                {movie.quality}
              </span>
              <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-yellow-500">
                <Icon
                  name="star"
                  className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current"
                />
                <span>{movie.rating}</span>
              </div>
              <span className="text-muted-foreground text-xs md:text-sm font-medium">
                2024
              </span>
              <span className="text-muted-foreground text-xs md:text-sm font-medium">
                2h 15m
              </span>
              <div className="w-1 h-1 rounded-full bg-muted mx-1 md:mx-2" />
              <span className="text-brand text-xs md:text-sm font-bold uppercase tracking-wider">
                {movie.genre}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight max-w-4xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground">
                {movie.title}
              </span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={handleWatchNow}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 bg-brand hover:bg-brand-dark text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(2,77,148,0.3)] group"
            >
              <Icon
                name="play"
                className="w-4 h-4 md:w-5 md:h-5 fill-current transition-transform group-hover:scale-110"
              />
              Tonton Sekarang
            </button>
            <button
              onClick={handleWatchTrailer}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 bg-card/50 hover:bg-card/80 backdrop-blur-md border border-border text-foreground rounded-full font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Icon name="film" className="w-4 h-4 md:w-5 md:h-5" />
              Lihat Trailer
            </button>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <section
        className={cn(
          'relative z-30 px-6 pb-24 max-w-7xl mx-auto space-y-16 transition-all duration-700',
          isPlaying ? 'pt-10' : '-mt-10 md:-mt-20'
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Left: Synopsis & Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="w-1 h-8 bg-brand rounded-full" />
                Sinopsis
              </h2>
              <p className="text-muted-foreground text-base md:text-xl leading-relaxed font-light">
                {movie.description ||
                  `Temukan kisah epik dari ${movie.title}, di mana takdir bertemu dengan ketidaktahuan. Mahakarya sinematik ini membawa Anda dalam perjalanan melalui visual yang tak tertandingi dan aksi yang memacu jantung.`}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-6 border-t border-border">
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Sutradara
                </span>
                <p className="font-bold text-sm md:text-base">
                  {movie.director || 'Christopher Nolan'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Produser
                </span>
                <p className="font-bold text-sm md:text-base">
                  {movie.producer || 'Emma Thomas'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Rumah Produksi
                </span>
                <div className="flex items-center gap-4">
                  {movie.productionHouseLogo && (
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img
                        src={movie.productionHouseLogo}
                        alt="Studio Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <p className="font-bold text-sm md:text-base leading-tight">
                    {movie.productionHouse || 'Lalakon Originals'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Tahun Rilis
                </span>
                <p className="font-bold text-sm md:text-base">
                  {movie.releaseYear || movie.year || '2024'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Cast / Sidebar Details */}
          <div className="space-y-10 bg-muted/30 p-8 rounded-3xl border border-border backdrop-blur-sm h-fit">
            <h3 className="text-xl font-bold border-b border-border pb-4">
              Pemeran Utama
            </h3>
            <div className="space-y-6">
              {(movie.actors && movie.actors.length > 0
                ? movie.actors
                : [
                    'Cillian Murphy',
                    'Emily Blunt',
                    'Matt Damon',
                    'Florence Pugh',
                  ]
              ).map((actor, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="space-y-1">
                    <p className="text-sm font-bold group-hover:text-brand transition-colors">
                      {actor}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      Pemeran
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Content Section */}
        <div className="space-y-10">
          <div className="flex items-end justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Film Serupa
              </h2>
              <p className="text-muted-foreground">
                Film pilihan yang mungkin Anda sukai berdasarkan minat Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
            {relatedMovies.map((m) => (
              <VideoCard key={m.id} video={m} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
