"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VideoSection } from "@/components/video/VideoSection";
import { MovieBanner } from "@/components/home/MovieBanner";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";
import { Ads } from "@/components/home/Ads";

export default function MemberHomePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [featuredFilms, setFeaturedFilms] = useState<Video[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/genre").catch(() => ({ data: [] })), api.get("/home-sections/content").catch(() => ({ data: [] })), api.get("/featured-films").catch(() => ({ data: [] }))])
      .then(([genreRes, sectionsRes, featuredRes]) => {
        // Genres
        const dbGenres = genreRes.data || [];
        // Map to UI friendly colors
        const colors = ["from-red-600/20", "from-indigo-600/20", "from-emerald-600/20", "from-zinc-800/20", "from-brand/20", "from-purple-600/20", "from-orange-600/20"];
        const mappedGenres = dbGenres.map((g: any, i: number) => ({
          title: g.name,
          slug: g.slug,
          color: colors[i % colors.length],
        }));
        setGenres(mappedGenres);

        // Films mapper helper
        const mapFilm = (film: any): Video => ({
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
          clipStart: film.clip_start ?? undefined,
          clipEnd: film.clip_end ?? undefined,
          publishedStart: film.published_start || undefined,
        });

        // Set sections
        const dbSections = sectionsRes.data || [];
        const mappedSections = dbSections.map((sec: any) => ({
          sectionNum: sec.sectionNum,
          title: sec.title,
          description: sec.description || "",
          categorySlug: sec.categorySlug || "",
          films: (sec.films || []).map(mapFilm),
        }));
        setSections(mappedSections);

        // Featured films
        const dbFeatured = featuredRes.data || [];
        const mappedFeatured = dbFeatured.map((item: any) => (item.film ? mapFilm(item.film) : null)).filter(Boolean) as Video[];

        setFeaturedFilms(mappedFeatured);
      })
      .catch((err) => {
        console.error("Failed to load home page dynamic data", err);
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

  // Fallback to normal films for banner if no featured films
  const bannerMovies = featuredFilms.length > 0 ? featuredFilms : (sections[0]?.films || []).slice(0, 5);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Dynamic Movie Banner - Featured Content */}
      {bannerMovies.length > 0 ? (
        <MovieBanner movies={bannerMovies} />
      ) : (
        <div className="h-[40vh] bg-gradient-to-br from-secondary via-background to-brand/10 flex items-center justify-center border-b border-border">
          <p className="text-muted-foreground font-semibold">Belum ada film yang ditambahkan.</p>
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-4 md:space-y-8 pb-20">
        {sections.map((sec) => (
          <VideoSection
            key={sec.sectionNum}
            title={sec.title}
            subtitle={sec.description}
            videos={sec.films}
            isComingSoon={sec.sectionNum === 2}
            viewAllHref={sec.sectionNum === 2 ? "/movies?upcoming=true" : sec.categorySlug ? `/movies?category=${encodeURIComponent(sec.categorySlug)}` : "/movies"}
            className={sec.sectionNum % 2 === 0 ? "bg-muted/30" : ""}
          />
        ))}

        {/* Ads Section */}
        <Ads />

        {/* Genres Section */}
        {genres.length > 0 && (
          <section className="py-24 px-6 bg-background relative border-t border-border overflow-hidden">
            <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-3">
                  <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                    <Icon name="compass" className="w-10 h-10 text-brand" />
                    Genre Kami
                  </h2>
                  <p className="text-muted-foreground text-lg">Jelajahi berbagai genre film yang dikurasi khusus untuk Anda.</p>
                </div>
                <Link href="/movies" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
                  Jelajahi Pustaka <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                {genres.map((genre, i) => (
                  <Link
                    key={i}
                    href={`/movies?genre=${encodeURIComponent(genre.title)}`}
                    className="group relative w-[90px] h-[42px] md:w-[130px] md:h-[52px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-card/50 border border-border flex items-center justify-center px-3 transition-all duration-500 hover:scale-105 hover:border-brand/40 shadow-lg"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-transparent opacity-30 group-hover:opacity-100 group-hover:from-brand/20 transition-all duration-500`} />
                    <h3 className="flex flex-col items-center justify-center gap-1">
                      <span
                        className={`relative z-20 font-bold tracking-[0.1em] uppercase text-foreground transition-colors text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 ${
                          genre.title.length > 10 ? "text-[7px] md:text-[9px]" : "text-[9px] md:text-xs"
                        }`}
                      >
                        {genre.title}
                      </span>
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section commented out for beta launch */}
        {/*
        <section className="py-24 px-6 bg-background relative border-t border-border">
          ...
        </section>
        */}
      </div>
    </main>
  );
}
