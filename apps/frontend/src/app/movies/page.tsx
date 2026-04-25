"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { MovieBanner } from "@/components/home/MovieBanner";
import { ALL_MOVIES, GENRES as GENRE_LIST } from "@/constants/video-data";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import Link from "next/link";

const GENRES = ["All Genres", ...GENRE_LIST.map((g) => g.title)];

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    const genreParam = searchParams.get("genre");
    if (genreParam && GENRES.includes(genreParam)) {
      setSelectedGenre(genreParam);
    }
  }, [searchParams]);

  const filteredMovies = selectedGenre === "All Genres" ? ALL_MOVIES : ALL_MOVIES.filter((m) => m.genre === selectedGenre);
  const displayedMovies = isExpanded ? filteredMovies : filteredMovies.slice(0, 6);
  const hasMore = filteredMovies.length > 6;

  // Check if user is a subscriber
  const isSubscriber = user?.role === "subscriber" || user?.role === "admin" || user?.role === "superadmin";

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-brand/30">
      {/* Dynamic Header Section */}
      {mounted && (
        isAuthenticated ? (
          <MovieBanner movies={ALL_MOVIES.slice(0, 3)} autoPlayInterval={6000} />
        ) : (
          <section className="relative pt-32 pb-16 overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950 to-neutral-950 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex flex-col items-center">
                <img src="/SINEA - Logo Horisontal.webp" alt="LALAKON" className="h-20 md:h-32 w-auto object-contain" />
              </div>
            </div>
          </section>
        )
      )}

      {/* Grid Content Section */}
      <section className={cn("pb-24 px-6 max-w-7xl mx-auto space-y-10", isAuthenticated ? "py-20" : "pt-10")}>
        {/* Navigation & Filter Row */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs font-black tracking-widest text-brand uppercase">{isAuthenticated ? "Catalog" : "Movies"}</span>
            <div className="w-1 h-1 rounded-full bg-neutral-800" />
            <span className="text-[10px] md:text-xs font-medium text-neutral-500 uppercase">{filteredMovies.length} Judul Ditemukan</span>
          </div>

          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-white/5 hover:border-brand/50 transition-all text-xs font-semibold">
              <Icon name="sliders-horizontal" className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand" />
              <span>{selectedGenre}</span>
              <Icon name="chevron-down" className={`w-3 h-3 text-neutral-600 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-xs transition-colors hover:bg-white/5 ${selectedGenre === genre ? "text-brand font-bold" : "text-neutral-400"}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Responsive Grid */}
        <div className="relative">
          <div 
            className={cn(
              "grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-10 transition-all duration-700 ease-in-out",
              !isExpanded && "max-h-[800px] overflow-hidden"
            )}
          >
            {displayedMovies.map((movie, index) => (
              <div 
                key={movie.id} 
                className={cn(
                  "w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
                  isExpanded && index >= 6 ? "fill-mode-backwards" : ""
                )}
                style={{ animationDelay: `${(index % 6) * 100}ms` }}
              >
                <VideoCard video={movie} />
              </div>
            ))}
          </div>

          {/* Expand Button */}
          {hasMore && (
            <div className={cn(
              "flex justify-center pt-12 transition-all duration-500",
              !isExpanded ? "relative -mt-32 pb-10 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent pt-40" : "pt-12"
            )}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex flex-col items-center gap-3 text-neutral-400 hover:text-brand transition-colors"
              >
                <span className="text-xs font-bold tracking-[0.2em] uppercase">
                  {isExpanded ? "Sembunyikan" : "Lihat Semua"}
                </span>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={cn(
                    "w-12 h-12 rounded-full border border-white/10 bg-neutral-900/50 flex items-center justify-center transition-all duration-500 group-hover:border-brand/50 group-hover:scale-110",
                    isExpanded ? "rotate-180" : ""
                  )}>
                    <Icon 
                      name="chevron-down" 
                      className="w-5 h-5 text-white group-hover:text-brand transition-colors" 
                    />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {filteredMovies.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mx-auto border border-white/5">
              <Icon name="search-x" className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-neutral-500 font-medium">No results found.</p>
          </div>
        )}
      </section>

      {/* Mini Pricing Section - Encouraging full conversion for non-subscribers */}
      {mounted && isAuthenticated && !isSubscriber && (
        <section className="py-24 px-6 bg-neutral-900/20 border-t border-white/5 font-sans">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">Buka Potensi Hiburan Sepenuhnya</h2>
              <p className="text-neutral-400 font-body text-lg">Nikmati streaming kualitas 4K dan akses di banyak perangkat dengan paket premium kami.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="px-6 py-4 rounded-2xl bg-neutral-950 border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <Icon name="crown" className="w-5 h-5 text-brand" />
                </div>
                <div className="text-left font-body">
                  <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Premium</p>
                  <p className="font-bold">Mulai dari Rp 49rb</p>
                </div>
              </div>
              <Link 
                href="/membership" 
                className="px-8 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand/20"
              >
                Lihat Semua Paket
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
