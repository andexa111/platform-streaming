"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";
import Link from "next/link";
import Image from "next/image";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
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
      (m.description || "").toLowerCase().includes(searchLower) ||
      (m.genre || "").toLowerCase().includes(searchLower) ||
      (m.director || "").toLowerCase().includes(searchLower) ||
      (m.producer || "").toLowerCase().includes(searchLower) ||
      (m.productionHouse || "").toLowerCase().includes(searchLower) ||
      (m.actors || []).some(actor => actor.toLowerCase().includes(searchLower))
    );
  }, [query, allMovies]);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movies/${movie.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group"
                  >
                    {/* Small Poster */}
                    <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0 border border-white/5 shadow-md">
                      {movie.thumbnail ? (
                        <Image
                          src={movie.thumbnail}
                          alt={movie.title}
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                          <Icon name="play" className="w-4 h-4 text-neutral-600" />
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-brand transition-colors truncate">
                        {movie.title}
                      </h4>
                      <p className="text-xs text-neutral-400 font-medium">
                        {movie.genre}
                      </p>
                      {movie.productionHouse && (
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider truncate">
                          {movie.productionHouse}
                        </p>
                      )}
                    </div>

                    {/* Arrow/Play Icon */}
                    <div className="w-8 h-8 rounded-full bg-neutral-800 group-hover:bg-brand flex items-center justify-center text-neutral-400 group-hover:text-white transition-all duration-300 shadow-md">
                      <Icon name="play" className="w-3.5 h-3.5 fill-current ml-0.5" />
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
