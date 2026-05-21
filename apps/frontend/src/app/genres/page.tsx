"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";

interface GenreData {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  films: Video[];
}

const GENRE_STYLES: Record<string, { color: string; icon: string }> = {
  action: { color: "from-red-600/20 to-transparent", icon: "play" },
  comedy: { color: "from-amber-500/20 to-transparent", icon: "sparkles" },
  horror: { color: "from-zinc-800/40 to-transparent", icon: "eye-off" },
  historical: { color: "from-orange-700/20 to-transparent", icon: "crown" },
  drama: { color: "from-emerald-600/20 to-transparent", icon: "film" },
  romance: { color: "from-pink-500/20 to-transparent", icon: "star" },
  thriller: { color: "from-purple-600/20 to-transparent", icon: "bell" },
  documentary: { color: "from-brand/20 to-transparent", icon: "compass" },
};

export default function GenresPage() {
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/genre").catch(() => ({ data: [] })),
      api.get("/films?limit=100").catch(() => ({ data: { data: [] } })),
    ])
      .then(([genreRes, filmsRes]) => {
        const dbGenres = genreRes.data || [];
        const dbFilms = filmsRes.data?.data || [];

        // Map films to Video interface
        const mappedFilms = dbFilms.map((film: any): Video => ({
          id: film.id,
          title: film.title,
          genre: film.genres && film.genres.length > 0 ? film.genres[0].name : "Other",
          thumbnail: film.poster_url ? getMediaUrl(film.poster_url) : "",
          backdrop: film.poster_url ? getMediaUrl(film.poster_url) : "",
          description: film.description || "",
        }));

        // Map genres and associate their films
        const mappedGenres = dbGenres.map((g: any): GenreData => {
          const style = GENRE_STYLES[g.slug.toLowerCase()] || {
            color: "from-blue-600/20 to-transparent",
            icon: "tag",
          };
          
          const genreFilms = mappedFilms.filter(
            (f: Video) => (f.genre || "").toLowerCase() === g.name.toLowerCase()
          );

          return {
            id: g.id,
            name: g.name,
            slug: g.slug,
            color: style.color,
            icon: style.icon,
            films: genreFilms,
          };
        });

        setGenres(mappedGenres);
      })
      .catch((err) => {
        console.error("Failed to load genres data", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 font-sans min-h-screen bg-background text-foreground pb-20">
      {/* Header Section */}
      <div className="relative pt-20 pb-10 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

        <div className="text-center space-y-6 max-w-3xl px-6 relative z-10 pt-10">
          <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] ">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500 pb-5">Jelajahi Genre</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Temukan koleksi film terbaik berdasarkan genre kesukaan Anda secara langsung dari pustaka kami.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {genres.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto border border-border">
              <Icon name="tag" className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Genre tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {genres.map((genre, index) => (
              <Link
                key={genre.id}
                href={`/movies?genre=${encodeURIComponent(genre.name)}`}
                className="group bg-card/40 backdrop-blur-sm rounded-[2.5rem] border border-border p-10 hover:border-brand/50 hover:bg-card/60 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-2xl hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Visual Accent Top Bar */}
                <div className={cn("absolute top-0 left-0 w-full h-2 bg-gradient-to-r transition-all duration-500 group-hover:h-3", genre.color)} />

                {/* Icon Background Decoration */}
                <div className="absolute -right-4 top-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none select-none">
                  <Icon name={genre.icon as any} className="w-40 h-40 -rotate-12" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-muted border border-border flex items-center justify-center group-hover:scale-110 group-hover:border-brand/30 transition-all duration-500 shadow-inner">
                    <Icon name={genre.icon as any} className="w-7 h-7 text-brand/70 group-hover:text-brand" />
                  </div>

                  <div className="space-y-2">
                    <h3
                      className={cn(
                        "font-bold text-foreground group-hover:text-brand transition-all duration-500 tracking-tight line-clamp-1",
                        genre.name.length > 12 ? "text-xl md:text-2xl" : genre.name.length > 8 ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl",
                      )}
                    >
                      {genre.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="h-px w-8 bg-brand/30 group-hover:w-12 transition-all duration-500" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">
                        {genre.films.length} Koleksi Film
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Indicator & Film Avatars */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <div className="flex -space-x-2">
                    {genre.films.slice(0, 3).map((film) => (
                      <div
                        key={film.id}
                        className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300"
                        title={film.title}
                      >
                        {film.thumbnail ? (
                          <img
                            src={film.thumbnail}
                            alt={film.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand/25 to-blue-500/25" />
                        )}
                      </div>
                    ))}
                    {genre.films.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-background flex items-center justify-center text-[10px] font-black text-neutral-300 shadow-md">
                        +{genre.films.length - 3}
                      </div>
                    )}
                    {genre.films.length === 0 && (
                      <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                        Belum Ada Film
                      </span>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-sm">
                    <Icon name="arrow-right" className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
