"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";

export default function CategoryArchivePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" /></div>}>
      <CategoryArchiveContent />
    </Suspense>
  );
}

function CategoryArchiveContent() {
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  
  // URL params and states
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [movies, setMovies] = useState<Video[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  
  // Filter Dropdowns States
  const [genres, setGenres] = useState<string[]>(["All Genres"]);
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [isGenreOpen, setIsGenreOpen] = useState(false);

  const [statuses] = useState<{ value: string; label: string }[]>([
    { value: "all", label: "Semua Status" },
    { value: "now_showing", label: "Now Showing" },
    { value: "past", label: "Past" },
  ]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, nowShowing: 0, past: 0 });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  // Search Input from URL
  const searchVal = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchVal);

  // Sync state with url search parameter on mount/change
  useEffect(() => {
    setSearchInput(searchVal);
  }, [searchVal]);

  // Sync filters from URL if available
  useEffect(() => {
    const genreParam = searchParams.get("genre");
    if (genreParam) {
      setSelectedGenre(genreParam);
    }
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
    const pageParam = searchParams.get("page");
    if (pageParam) {
      setCurrentPage(parseInt(pageParam) || 1);
    }
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Category info & stats & films
  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    // Build URL query params for pagination and filters
    const queryParts = [];
    queryParts.push(`category=${encodeURIComponent(slug)}`);
    queryParts.push("archive=true");
    queryParts.push(`page=${currentPage}`);
    queryParts.push(`limit=${limit}`);
    
    if (selectedGenre !== "All Genres") {
      const genreSlug = selectedGenre.toLowerCase().replace(/\s+/g, "-");
      queryParts.push(`genre=${encodeURIComponent(genreSlug)}`);
    }
    if (selectedStatus !== "all") {
      queryParts.push(`status=${selectedStatus}`);
    }
    if (searchVal) {
      queryParts.push(`search=${encodeURIComponent(searchVal)}`);
    }

    const filmsUrl = `/films?${queryParts.join("&")}`;

    Promise.all([
      api.get("/category").catch(() => ({ data: [] })),
      api.get("/genre").catch(() => ({ data: [] })),
      api.get(filmsUrl).catch(() => ({ data: { data: [], meta: { totalPages: 1 } } })),
      // Fetch all films for stats counting (bypass pagination/status filtering to calculate stats)
      api.get(`/films?category=${encodeURIComponent(slug)}&archive=true&limit=200`).catch(() => ({ data: { data: [] } })),
    ])
      .then(([categoryRes, genreRes, filmsRes, statsRes]) => {
        // 1. Get Category Details
        const dbCategories = categoryRes.data || [];
        const matched = dbCategories.find(
          (c: any) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase()
        );
        if (matched) {
          setCategoryName(matched.name);
          setCategoryDescription(
            matched.description ||
              `Arsip film resmi untuk kategori ${matched.name}. Temukan film-film berkualitas tinggi yang sedang tayang maupun yang pernah menginspirasi kami.`
          );
        } else {
          // Fallback name format
          const formattedName = slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          setCategoryName(formattedName);
          setCategoryDescription(`Arsip film resmi untuk kategori ${formattedName}.`);
        }

        // 2. Parse Genres
        const dbGenres = genreRes.data || [];
        setGenres(["All Genres", ...dbGenres.map((g: any) => g.name)]);

        // 3. Parse Paginated Films (using fallbacks for preview if DB is empty/offline)
        let dbFilms = filmsRes.data?.data || [];
        if (dbFilms.length === 0) {
          dbFilms = [
            {
              id: "mock-1",
              title: "Lakon Cinta Pertama",
              genres: [{ name: "Romance" }],
              poster_url: "/login_bg.png",
              description: "Kisah romansa klasik dua sineas muda yang berjuang di tengah dinamika perfilman nasional.",
              filmStatus: "now_showing",
              published_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "mock-2",
              title: "Jalur Sutra Nusantara",
              genres: [{ name: "Documentary" }],
              poster_url: "/production-house-placeholder.png",
              description: "Ekspedisi mendalam menelusuri sejarah perdagangan rempah di nusantara yang melegenda.",
              filmStatus: "now_showing",
              published_start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "mock-3",
              title: "Tragedi 1998",
              genres: [{ name: "Historical" }],
              poster_url: "/login_bg.png",
              description: "Dokumentasi dramatis peristiwa reformasi yang melahirkan era baru bagi bangsa Indonesia.",
              filmStatus: "past",
              published_start: "2024-01-01T00:00:00Z",
              published_end: "2024-06-01T00:00:00Z",
            },
            {
              id: "mock-4",
              title: "Mimpi Sang Sutradara",
              genres: [{ name: "Drama" }],
              poster_url: "/production-house-placeholder.png",
              description: "Perjuangan inspiratif seorang anak desa mewujudkan impiannya memproduksi film layar lebar.",
              filmStatus: "past",
              published_start: "2025-01-01T00:00:00Z",
              published_end: "2025-05-01T00:00:00Z",
            }
          ];
        }

        const mapped = dbFilms.map((film: any): Video => ({
          id: film.id,
          title: film.title,
          genre: film.genres && film.genres.length > 0 ? film.genres[0].name : (film.genre || "Other"),
          rating: "4.8",
          quality: "4K UHD",
          thumbnail: (film.poster_url?.startsWith("http") || film.poster_url?.startsWith("/")) ? film.poster_url : (film.poster_url ? getMediaUrl(film.poster_url) : ""),
          backdrop: (film.poster_url?.startsWith("http") || film.poster_url?.startsWith("/")) ? film.poster_url : (film.poster_url ? getMediaUrl(film.poster_url) : ""),
          description: film.description || "",
          trailerUrl: film.trailer_url ? getMediaUrl(film.trailer_url) : "",
          productionHouse: film.production_house || "",
          productionHouseLogo: film.production_house_logo ? getMediaUrl(film.production_house_logo) : "",
          director: film.director || "",
          producer: film.producer || "",
          actors: film.actors ? film.actors.map((a: any) => a.name) : [],
          publishedStart: film.published_start,
          publishedEnd: film.published_end,
          isDeleted: film.is_deleted,
          filmStatus: film.filmStatus,
        }));

        // Apply client-side filters on dummy/fallback data if needed
        const filteredMapped = mapped.filter(m => {
          const matchesGenre = selectedGenre === "All Genres" || m.genre.toLowerCase() === selectedGenre.toLowerCase();
          const matchesStatus = selectedStatus === "all" || m.filmStatus === selectedStatus;
          const matchesSearch = !searchVal || m.title.toLowerCase().includes(searchVal.toLowerCase());
          return matchesGenre && matchesStatus && matchesSearch;
        });

        setMovies(filteredMapped);
        setTotalPages(filmsRes.data?.meta?.totalPages || 1);

        // 4. Calculate Stats from fallback list
        const statsFilms = statsRes.data?.data?.length > 0 ? statsRes.data.data : dbFilms;
        const now = new Date();
        let totalCount = statsFilms.length;
        let nowShowingCount = 0;
        let pastCount = 0;

        statsFilms.forEach((f: any) => {
          const isPast = f.is_deleted || (f.published_end && new Date(f.published_end) < now) || f.filmStatus === 'past';
          if (isPast) {
            pastCount++;
          } else {
            nowShowingCount++;
          }
        });

        setStats({ total: totalCount, nowShowing: nowShowingCount, past: pastCount });
      })
      .catch((err) => {
        console.error("Failed to fetch category detail data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug, currentPage, selectedGenre, selectedStatus, searchVal]);

  const updateUrlParams = (newParams: Record<string, string | null>) => {
    const paramsObj = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "All Genres") {
        paramsObj.delete(key);
      } else {
        paramsObj.set(key, value);
      }
    });
    router.push(`/categories/${slug}?${paramsObj.toString()}`);
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page: page.toString() });
  };

  // Handle dropdown selection changes
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    setIsGenreOpen(false);
    setCurrentPage(1);
    updateUrlParams({ genre, page: "1" });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setIsStatusOpen(false);
    setCurrentPage(1);
    updateUrlParams({ status, page: "1" });
  };

  // Search submits
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrlParams({ search: searchInput.trim() || null, page: "1" });
  };

  const clearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
    updateUrlParams({ search: null, page: "1" });
  };

  const backdropUrl = movies[0]?.backdrop || "";

  if (loading && movies.length === 0) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Premium Hero Banner */}
      {mounted && (
        <section className="relative min-h-[40vh] md:min-h-[45vh] flex flex-col justify-end pt-28 md:pt-36 pb-12 md:pb-16 overflow-hidden">
          {/* Fallback elegant gradient background */}
          <div className="absolute inset-0 bg-neutral-950">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/20 via-background to-background" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/10 blur-[120px] rounded-full animate-pulse" />
          </div>

          {/* Banner Content */}
          <div className="relative w-full max-w-7xl mx-auto px-6 z-10 space-y-4 md:space-y-6">
            <div className="space-y-2 md:space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-brand/35 text-[10px] md:text-xs font-black tracking-widest text-brand uppercase">
                <Icon name="tag" className="w-3.5 h-3.5" />
                <span>Arsip Kategori</span>
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {categoryName}
              </h1>
              <p className="text-xs md:text-base text-neutral-350 max-w-2xl font-light leading-relaxed">
                {categoryDescription}
              </p>
              
              {/* Premium Stat Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-[10px] md:text-xs font-bold">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-brand/20 border border-brand/30 text-brand rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <span>{stats.nowShowing} Now Showing</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{stats.past} Past Archive</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-neutral-400 rounded-full">
                  <span>Total: {stats.total} Film</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid Content Section */}
      <section className="pb-24 px-6 max-w-7xl mx-auto space-y-10 pt-10">
        {/* Navigation & Filter Row */}
        <div className="space-y-6 border-b border-border pb-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-brand/50 transition-all">
              <Icon name="search" className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari film di kategori ini..."
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

          {/* Filter Info & Dropdowns Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] md:text-xs font-black tracking-widest text-brand uppercase">Koleksi</span>
              <div className="w-1 h-1 rounded-full bg-muted" />
              <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">{movies.length} Film di Halaman Ini</span>
            </div>

            {/* Twin Dropdowns Row */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Genre Filter Dropdown */}
              <div className="relative">
                <button onClick={() => { setIsGenreOpen(!isGenreOpen); setIsStatusOpen(false); }} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-brand/50 transition-all text-xs font-semibold">
                  <Icon name="sliders-horizontal" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand" />
                  <span>{selectedGenre}</span>
                  <Icon name="chevron-down" className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${isGenreOpen ? "rotate-180" : ""}`} />
                </button>

                {isGenreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsGenreOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                      {genres.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => handleGenreChange(genre)}
                          className={`w-full text-left px-5 py-2.5 text-xs transition-colors hover:bg-muted/50 ${selectedGenre === genre ? "text-brand font-bold" : "text-muted-foreground"}`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative">
                <button onClick={() => { setIsStatusOpen(!isStatusOpen); setIsGenreOpen(false); }} className="group flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-brand/50 transition-all text-xs font-semibold">
                  <Icon name="film" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand" />
                  <span>{statuses.find(s => s.value === selectedStatus)?.label}</span>
                  <Icon name="chevron-down" className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`} />
                </button>

                {isStatusOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                      {statuses.map((statusItem) => (
                        <button
                          key={statusItem.value}
                          onClick={() => handleStatusChange(statusItem.value)}
                          className={`w-full text-left px-5 py-2.5 text-xs transition-colors hover:bg-muted/50 ${selectedStatus === statusItem.value ? "text-brand font-bold" : "text-muted-foreground"}`}
                        >
                          {statusItem.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Spinner / Grid Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Responsive Grid */}
            <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-10">
              {movies.map((movie, index) => {
                const isComingSoon = (!!movie.publishedStart && new Date(movie.publishedStart) > new Date());
                return (
                  <div key={movie.id} className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${(index % 6) * 80}ms` }}>
                    <VideoCard video={movie} isComingSoon={isComingSoon} />
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-12 border-t border-border/30">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border hover:border-brand/50 disabled:opacity-40 disabled:hover:border-border disabled:cursor-not-allowed transition-all"
                >
                  <Icon name="chevron-left" className="w-5 h-5 text-foreground" />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const p = idx + 1;
                    const isCurrent = p === currentPage;
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={cn(
                          "w-10 h-10 rounded-full text-xs font-bold transition-all border",
                          isCurrent
                            ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-105"
                            : "bg-card border-border hover:border-brand/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border hover:border-brand/50 disabled:opacity-40 disabled:hover:border-border disabled:cursor-not-allowed transition-all"
                >
                  <Icon name="chevron-right" className="w-5 h-5 text-foreground" />
                </button>
              </div>
            )}

            {movies.length === 0 && (
              <div className="py-32 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto border border-border">
                  <Icon name="search" className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Film tidak ditemukan di kategori ini.</p>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
