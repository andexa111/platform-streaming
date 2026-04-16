"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { MovieBanner } from "@/components/home/MovieBanner";
import { ALL_MOVIES, GENRES as GENRE_LIST } from "@/constants/video-data";

const GENRES = ["All Genres", ...GENRE_LIST.map(g => g.title)];

export default function MemberShowsPage() {
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredMovies = selectedGenre === "All Genres" 
    ? ALL_MOVIES 
    : ALL_MOVIES.filter((m) => m.genre === selectedGenre);

  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-brand/30">
      {/* Featured Banner Header - Replaces the static public Hero */}
      <MovieBanner movies={ALL_MOVIES.slice(0, 3)} autoPlayInterval={6000} />

      {/* Grid Content Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-10">
        {/* Navigation & Filter Row */}
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs font-black tracking-widest text-brand uppercase">Catalog</span>
            <div className="w-1 h-1 rounded-full bg-neutral-800" />
            <span className="text-[10px] md:text-xs font-medium text-neutral-500 uppercase">{filteredMovies.length} Titles Found</span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)} 
              className="group flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-white/5 hover:border-brand/50 transition-all text-xs font-semibold"
            >
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
        <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-10">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="w-full">
              <VideoCard video={movie} />
            </div>
          ))}
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

      {/* Mini Pricing Section - Encouraging full conversion */}
      <section className="py-24 px-6 bg-neutral-900/20 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-4xl font-bold">Unleash the full potential</h2>
            <p className="text-neutral-400">Unlock 4K streaming and multi-device access with our premium plans.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="px-6 py-4 rounded-2xl bg-neutral-950 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                <Icon name="crown" className="w-5 h-5 text-brand" />
              </div>
              <div className="text-left">
                <p className="text-xs text-neutral-500 uppercase font-black">Premium</p>
                <p className="font-bold">Starts at Rp 49K</p>
              </div>
            </div>
            <button className="px-8 py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold transition-all hover:scale-105">
              See All Plans
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
