"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  color: string;
  films: Video[];
}

const CATEGORY_STYLES: Record<string, { color: string }> = {
  "lolos-kurasi-ffab-2026": { color: "from-brand/20 to-transparent" },
  "festival": { color: "from-amber-500/20 to-transparent" },
  "award-winning": { color: "from-yellow-500/20 to-transparent" },
  "dokumenter": { color: "from-emerald-600/20 to-transparent" },
  "short-film": { color: "from-purple-600/20 to-transparent" },
  "animation": { color: "from-pink-500/20 to-transparent" },
  "experimental": { color: "from-cyan-500/20 to-transparent" },
  "indie": { color: "from-orange-600/20 to-transparent" },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/category").catch(() => ({ data: [] })),
      api.get("/films?limit=100").catch(() => ({ data: { data: [] } })),
    ])
      .then(([categoryRes, filmsRes]) => {
        const dbCategories = categoryRes.data || [];
        const dbFilms = filmsRes.data?.data || [];

        // Map categories and associate their films
        const mappedCategories = dbCategories.map((c: any): CategoryData => {
          const slugKey = (c.slug || "").toLowerCase();
          const style = CATEGORY_STYLES[slugKey] || {
            color: "from-brand/20 to-transparent",
          };

          // Filter films that belong to this category
          const filteredFilms = dbFilms
            .filter((film: any) => {
              const cats = film.categories || [];
              return cats.some(
                (cat: any) =>
                  cat.id === c.id ||
                  (cat.name || "").toLowerCase() === (c.name || "").toLowerCase()
              );
            })
            .map((film: any): Video => ({
              id: film.id,
              title: film.title,
              genre: film.genres && film.genres.length > 0 ? film.genres[0].name : "Other",
              thumbnail: film.poster_url ? getMediaUrl(film.poster_url) : "",
              backdrop: film.poster_url ? getMediaUrl(film.poster_url) : "",
              description: film.description || "",
            }));

          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            color: style.color,
            films: filteredFilms,
          };
        });

        setCategories(mappedCategories);
      })
      .catch((err) => {
        console.error("Failed to load categories data", err);
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
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500 pb-5">Jelajahi Kategori</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Temukan koleksi film terbaik berdasarkan kategori yang telah dikurasi secara khusus dari pustaka kami.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {categories.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto border border-border">
              <Icon name="tag" className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Kategori tidak ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/movies?category=${encodeURIComponent(category.name)}`}
                className="group bg-card/40 backdrop-blur-sm rounded-[2.5rem] border border-border p-10 hover:border-brand/50 hover:bg-card/60 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-2xl hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Visual Accent Top Bar */}
                <div className={cn("absolute top-0 left-0 w-full h-2 bg-gradient-to-r transition-all duration-500 group-hover:h-3", category.color)} />

                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand group-hover:border-brand transition-all duration-500 shadow-inner flex-shrink-0">
                      <Icon name="tag" className="w-5 h-5 text-brand group-hover:text-white transition-colors duration-500" />
                    </div>
                    <h3
                      className={cn(
                        "font-bold text-foreground group-hover:text-brand transition-all duration-500 tracking-tight line-clamp-2",
                        category.name.length > 15 ? "text-lg md:text-xl" : "text-xl md:text-2xl",
                      )}
                    >
                      {category.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-brand/30 group-hover:w-12 transition-all duration-500" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground">
                      {category.films.length} Koleksi Film
                    </p>
                  </div>
                </div>

                {/* Action Indicator & Film List */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <div className="flex flex-col text-[11px] text-muted-foreground space-y-0.5 max-w-[70%]">
                    {category.films.slice(0, 2).map((film) => (
                      <span
                        key={film.id}
                        className="truncate font-medium block"
                        title={film.title}
                      >
                        • {film.title}
                      </span>
                    ))}
                    {category.films.length > 2 && (
                      <span className="text-[9px] font-semibold text-brand block">
                        +{category.films.length - 2} film lainnya
                      </span>
                    )}
                    {category.films.length === 0 && (
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
