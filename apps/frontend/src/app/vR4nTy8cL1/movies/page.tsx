"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { MovieBanner } from "@/components/home/MovieBanner";
import { GENRES as GENRE_LIST } from "@/constants/video-data";
import { api, getMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Video } from "@/types/video";

const GENRES = ["All Genres", ...GENRE_LIST.map((g) => g.title)];

export default function SecretCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SecretCatalogContent />
    </Suspense>
  );
}

function SecretCatalogContent() {
  const [mounted, setMounted] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchParams = useSearchParams();

  const [films, setFilms] = useState<Video[]>([]);
  const [featuredFilms, setFeaturedFilms] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map DB film to Video type
  const mapToVideo = (item: any): Video => {
    const f = item.film || item;
    return {
      id: f.id,
      title: f.title,
      thumbnail: getMediaUrl(f.poster_url) || "",
      backdrop: getMediaUrl(f.poster_url) || "",
      genre: f.genres && f.genres.length > 0 ? f.genres[0].name : "",
      rating: "4.5",
      quality: "4K UHD",
      year: f.release_year,
      description: f.description,
      director: f.director,
      producer: f.producer,
      productionHouse: f.production_house || "",
      productionHouseLogo: getMediaUrl(f.production_house_logo) || undefined,
    };
  };

  useEffect(() => {
    setMounted(true);
    const genreParam = searchParams.get("genre");
    if (genreParam && GENRES.includes(genreParam)) {
      setSelectedGenre(genreParam);
    }

    // Fetch real data
    Promise.all([
      api.get("/films?limit=100").catch((err) => { console.error("Error fetching films:", err); return { data: { data: [] } }; }),
      api.get("/featured-films").catch((err) => { console.error("Error fetching featured:", err); return { data: [] }; })
    ]).then(([filmsRes, featRes]) => {
      console.log("Films Response:", filmsRes.data);
      console.log("Featured Response:", featRes.data);
      setFilms((filmsRes.data?.data || []).map(mapToVideo));
      setFeaturedFilms((featRes.data || []).map(mapToVideo));
    }).finally(() => setLoading(false));
  }, [searchParams]);

  const filteredMovies = selectedGenre === "All Genres" ? films : films.filter((m) => m.genre === selectedGenre);
  const displayedMovies = isExpanded ? filteredMovies : filteredMovies.slice(0, 6);
  const hasMore = filteredMovies.length > 6;

  if (!mounted || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* TEST INDICATOR */}
      <div className="fixed top-24 right-6 z-50 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-red-400">
        Secret Test Mode
      </div>

      {/* Dynamic Header Section */}
      <MovieBanner 
        movies={featuredFilms.length > 0 ? featuredFilms : films.slice(0, 5)} 
        basePath="/vR4nTy8cL1/watch" 
      />

      {/* Grid Content Section */}
      <section className="py-20 pb-24 px-6 max-w-7xl mx-auto space-y-10">
        {/* Navigation & Filter Row */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs font-black tracking-widest text-brand uppercase">Catalog</span>
            <div className="w-1 h-1 rounded-full bg-muted" />
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">{filteredMovies.length} Judul Ditemukan</span>
          </div>

          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-brand/50 transition-all text-xs font-semibold">
              <Icon name="sliders-horizontal" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand" />
              <span>{selectedGenre}</span>
              <Icon name="chevron-down" className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => {
                        setSelectedGenre(genre);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-xs transition-colors hover:bg-muted/50 ${selectedGenre === genre ? "text-brand font-bold" : "text-muted-foreground"}`}
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
          <div className={cn("grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-10 transition-all duration-700 ease-in-out", !isExpanded && "max-h-[800px] overflow-hidden")}>
            {displayedMovies.map((movie, index) => (
              <div key={movie.id} className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-500", isExpanded && index >= 6 ? "fill-mode-backwards" : "")} style={{ animationDelay: `${(index % 6) * 100}ms` }}>
                <VideoCard video={movie} basePath="/vR4nTy8cL1/watch" />
              </div>
            ))}
          </div>

          {/* Expand Button */}
          {hasMore && (
            <div className={cn("flex justify-center pt-12 transition-all duration-500", !isExpanded ? "relative -mt-32 pb-10 bg-gradient-to-t from-background via-background/90 to-transparent pt-40" : "pt-12")}>
              <button onClick={() => setIsExpanded(!isExpanded)} className="group flex flex-col items-center gap-3 text-foreground/60 hover:text-brand transition-all">
                <span className="text-xs font-bold tracking-[0.2em] uppercase">{isExpanded ? "Sembunyikan" : "Lihat Semua"}</span>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-brand/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center transition-all duration-500 group-hover:bg-brand group-hover:border-brand group-hover:scale-110 shadow-md",
                      isExpanded ? "rotate-180" : "",
                    )}
                  >
                    <Icon name="chevron-down" className="w-5 h-5 text-foreground group-hover:text-white transition-all" />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {filteredMovies.length === 0 && (
          <div className="py-32 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto border border-border">
              <Icon name="search-x" className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No results found.</p>
          </div>
        )}
      </section>
    </main>
  );
}
