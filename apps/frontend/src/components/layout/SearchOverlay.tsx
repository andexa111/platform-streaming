"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";
import Link from "next/link";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, highlight: string) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${escapeRegExp(highlight.trim())})`, "gi");
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-brand/20 text-brand font-extrabold rounded px-0.5 border border-brand/10">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

export function SearchOverlay({ isOpen, onClose, query, setQuery }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [allMovies, setAllMovies] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all movies when the overlay opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
      
      setLoading(true);
      api.get("/films?limit=100")
        .then((res) => {
          const dbFilms = res.data?.data || [];
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
          setAllMovies(mapped);
        })
        .catch((err) => {
          console.error("Failed to fetch films for search", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      document.body.style.overflow = "unset";
      setQuery(""); // Clear search query on close
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Client-side real-time filtering
  const filteredMovies = useMemo(() => {
    if (!query.trim()) return [];
    const searchLower = query.toLowerCase();
    return allMovies.filter((m) => 
      m.title.toLowerCase().includes(searchLower) ||
      (m.genre || "").toLowerCase().includes(searchLower) ||
      (m.director || "").toLowerCase().includes(searchLower) ||
      (m.producer || "").toLowerCase().includes(searchLower) ||
      (m.productionHouse || "").toLowerCase().includes(searchLower) ||
      (m.actors || []).some(actor => actor.toLowerCase().includes(searchLower))
    );
  }, [query, allMovies]);

  const getMatchDetails = (movie: Video, queryStr: string) => {
    if (!queryStr.trim()) return [];
    const searchLower = queryStr.toLowerCase();
    const result: { label: string; text: string }[] = [];

    // Check director
    if (movie.director && movie.director.toLowerCase().includes(searchLower)) {
      result.push({ label: "Sutradara", text: movie.director });
    }
    // Check producer
    if (movie.producer && movie.producer.toLowerCase().includes(searchLower)) {
      result.push({ label: "Produser", text: movie.producer });
    }
    // Check actors
    const matchingActors = (movie.actors || []).filter(actor =>
      actor.toLowerCase().includes(searchLower)
    );
    matchingActors.forEach(actor => {
      result.push({ label: "Pemeran Utama", text: actor });
    });

    return result;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/movies?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl animate-in fade-in duration-300 flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* Close button for mobile */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-neutral-900/50 rounded-full border border-white/10 text-neutral-400 hover:text-white transition-all md:hidden"
      >
        <Icon name="x" className="w-4 h-4" />
      </button>

      <div 
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] animate-in fade-in slide-in-from-top-4 duration-500"
      >
        {/* Search Bar Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          
          <div className="relative flex items-center bg-neutral-900/50 border border-white/10 group-focus-within:border-brand/50 rounded-2xl px-5 py-4 shadow-2xl transition-all">
            <Icon name="search" className="w-5 h-5 text-neutral-500 group-focus-within:text-brand transition-colors mr-4" />
            
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari film, genre, atau produser..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-neutral-500"
              />
            </form>

            {query && (
              <button 
                type="button"
                onClick={() => setQuery("")}
                className="p-1 hover:bg-white/10 rounded-full transition-colors mr-2"
              >
                <Icon name="x" className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 border border-white/5 text-[10px] font-bold text-neutral-500 select-none">
              ESC
            </div>
          </div>
        </div>

        {/* Real-time Search Results */}
        {query.trim() && (
          <div className="mt-8 bg-neutral-900/60 border border-white/10 rounded-2xl p-4 backdrop-blur-xl max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent animate-in fade-in slide-in-from-top-2 duration-300">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-neutral-400 font-medium animate-pulse">Mencari film...</span>
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-neutral-500 gap-2">
                <Icon name="search" className="w-8 h-8 text-neutral-600" />
                <span className="text-sm font-medium">Tidak ada film yang cocok</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {filteredMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movies/${movie.id}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-neutral-900/40 hover:bg-white/5 border border-white/5 hover:border-brand/35 transition-all duration-300 group"
                  >
                    {/* Movie Info */}
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      <Icon name="film" className="w-4 h-4 text-neutral-500 group-hover:text-brand transition-colors flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white group-hover:text-brand transition-colors truncate">
                          {highlightText(movie.title, query)}
                        </span>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-400 font-semibold mt-0.5">
                          <span>{highlightText(movie.genre || "", query)}</span>
                          {movie.productionHouse && (
                            <>
                              <span className="text-neutral-600">•</span>
                              <span className="text-neutral-500 uppercase tracking-wider truncate">
                                {highlightText(movie.productionHouse || "", query)}
                              </span>
                            </>
                          )}
                        </div>
                        {getMatchDetails(movie, query).map((match, idx) => (
                          <div key={idx} className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
                            <span className="text-neutral-500 font-black uppercase tracking-widest text-[8px]">{match.label}:</span>
                            <span className="text-neutral-300 font-bold">{highlightText(match.text, query)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Play Action Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0 text-xs font-bold text-neutral-500 group-hover:text-brand transition-colors">
                      <span className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Tonton</span>
                      <Icon name="play" className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
