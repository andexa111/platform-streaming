"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { MovieBanner } from "@/components/home/MovieBanner";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>}>
      <CatalogContent />
    </Suspense>
  );
}

function CatalogContent() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [movies, setMovies] = useState<Video[]>([]);
  const [genres, setGenres] = useState<string[]>(["All Genres"]);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read search query parameter
  const searchVal = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchVal);

  useEffect(() => {
    setMounted(true);
    setLoading(true);

    Promise.all([
      api.get("/genre").catch(() => ({ data: [] })),
      api.get("/films?limit=100").catch(() => ({ data: { data: [] } })),
    ])
      .then(([genreRes, filmsRes]) => {
        // Parse Genres
        const dbGenres = genreRes.data || [];
        setGenres(["All Genres", ...dbGenres.map((g: any) => g.name)]);

        // Parse Films
        const dbFilms = filmsRes.data?.data || [];
        const mapped = dbFilms.map((film: any): Video => ({
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
          director: film.director || "",
          producer: film.producer || "",
          actors: film.actors ? film.actors.map((a: any) => a.name) : [],
        }));
        setMovies(mapped);
      })
      .catch((err) => {
        console.error("Failed to load catalog data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Update selected genre from search params if any
  useEffect(() => {
    const genreParam = searchParams.get("genre");
    if (genreParam && genres.includes(genreParam)) {
      setSelectedGenre(genreParam);
    }
  }, [searchParams, genres]);

  // Sync search input from URL params
  useEffect(() => {
    setSearchInput(searchVal);
  }, [searchVal]);

  // Handle inline search
  const handleInlineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput.trim()) {
      params.set("search", searchInput.trim());
    } else {
      params.delete("search");
    }
    router.push(`/movies?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/movies?${params.toString()}`);
  };

  // Filter movies based on selectedGenre and searchVal
  const filteredMovies = movies.filter((m) => {
    const matchesGenre = selectedGenre === "All Genres" || (m.genre || "").toLowerCase() === selectedGenre.toLowerCase();
    const searchLower = searchVal.toLowerCase();
    const matchesSearch = !searchVal || 
      m.title.toLowerCase().includes(searchLower) || 
      (m.description || "").toLowerCase().includes(searchLower) ||
      (m.genre || "").toLowerCase().includes(searchLower) ||
      (m.director || "").toLowerCase().includes(searchLower) ||
      (m.producer || "").toLowerCase().includes(searchLower) ||
      (m.productionHouse || "").toLowerCase().includes(searchLower) ||
      (m.actors || []).some(actor => actor.toLowerCase().includes(searchLower));
    return matchesGenre && matchesSearch;
  });

  const displayedMovies = isExpanded ? filteredMovies : filteredMovies.slice(0, 6);
  const hasMore = filteredMovies.length > 6;

  // Check if user is a subscriber
  const isSubscriber = user?.role === "subscriber" || user?.role === "admin" || user?.role === "superadmin" || !!user;

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Dynamic Header Section */}
      {mounted &&
        (isAuthenticated ? (
          <MovieBanner movies={movies.slice(0, 10)} />
        ) : (
          <section className="relative pt-32 pb-16 overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/10 via-background to-background -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

            <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="flex flex-col items-center">
                <img
                  src="/SINEA - Logo Horisontal.webp"
                  alt="LALAKON"
                  className="h-20 md:h-32 w-auto object-contain dark:brightness-[1.6] brightness-[1.1] contrast-[1.2] drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                />
              </div>
            </div>
          </section>
        ))}

      {/* Grid Content Section */}
      <section className={cn("pb-24 px-6 max-w-7xl mx-auto space-y-10", isAuthenticated ? "py-20" : "pt-10")}>
        {/* Navigation & Filter Row */}
        <div className="space-y-6 border-b border-border pb-6">
          {/* Search Bar */}
          <form onSubmit={handleInlineSearch} className="relative">
            <div className="flex items-center bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-brand/50 transition-all">
              <Icon name="search" className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari film, genre, sutradara..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 hover:bg-muted rounded-full transition-colors mr-2"
                >
                  <Icon name="x" className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-full text-xs font-bold transition-all"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Filter Info Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] md:text-xs font-black tracking-widest text-brand uppercase">{isAuthenticated ? "Katalog" : "Film"}</span>
              <div className="w-1 h-1 rounded-full bg-muted" />
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">{filteredMovies.length} Judul Ditemukan</span>
              {searchVal && (
                <>
                  <div className="w-1 h-1 rounded-full bg-muted" />
                  <span className="text-[10px] md:text-xs font-medium text-brand uppercase">Pencarian: "{searchVal}"</span>
                </>
              )}
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
                  {genres.map((genre) => (
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
        </div>

        {/* Responsive Grid */}
        <div className="relative">
          <div className={cn("grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-10 transition-all duration-700 ease-in-out", !isExpanded && "max-h-[800px] overflow-hidden")}>
            {displayedMovies.map((movie, index) => (
              <div key={movie.id} className={cn("w-full animate-in fade-in slide-in-from-bottom-4 duration-500")} style={{ animationDelay: `${(index % 6) * 100}ms` }}>
                <VideoCard video={movie} />
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
              <Icon name="search" className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Film tidak ditemukan.</p>
          </div>
        )}
      </section>
    </main>
  );
}
