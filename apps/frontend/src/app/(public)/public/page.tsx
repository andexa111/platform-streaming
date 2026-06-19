"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { MovieBanner } from "@/components/home/MovieBanner";
import Link from "next/link";
import { VideoSection } from "@/components/video/VideoSection";
import { cn } from "@/lib/utils";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";
import { GENRES } from "@/constants/video-data";
import { Ads } from "@/components/home/Ads";

export default function PublicPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/home-sections/content")
      .then((res) => {
        const sectionsData = res.data || [];
        const mapped = sectionsData.map((sec: any) => ({
          sectionNum: sec.sectionNum,
          title: sec.title,
          description: sec.description || "",
          categorySlug: sec.categorySlug || "",
          films: (sec.films || []).map(
            (film: any): Video => ({
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
            }),
          ),
        }));
        setSections(mapped);
      })
      .catch((err) => {
        console.error("Failed to fetch public home sections", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const bannerMovies = sections[0]?.films?.slice(0, 5) || [];

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Hero Section */}
      {/* <section className="relative pt-40 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/10 via-background to-background -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto text-center space-y-6 md:space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary border border-border text-xs md:text-sm font-medium">
            <Icon name="sparkles" className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand animate-bounce" />
            <span className="text-muted-foreground">Karya Baru Segera Hadir</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[1.1]">
            <span className="block pb-2 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">Streaming</span>
            <span className="block pb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500">Karya Eksklusif</span>
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Ruang bagi karya visual yang berani dan autentik.
            <br />
            Jelajahi film, dokumenter, dan cerita sinematik dari kreator pilihan.
          </p>
          <div className="pt-6 md:pt-8 flex flex-row items-center justify-center gap-2 md:gap-4 w-full px-4 md:px-0">
            <Link
              href="/login"
              className="flex-1 sm:flex-none w-auto bg-brand hover:bg-brand-dark text-white px-3 py-3 md:px-8 md:py-4 rounded-full text-[10px] md:text-base font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 md:gap-2 shadow-[0_0_30px_rgba(2,77,148,0.3)]"
            >
              Login
              <Icon name="login" className="w-3 h-3 md:w-5 md:h-5 fill-none" />
            </Link>
            <Link
              href="/movies"
              className="flex-1 sm:flex-none w-auto bg-secondary/50 hover:bg-secondary backdrop-blur-md border border-border text-foreground px-3 py-3 md:px-8 md:py-4 rounded-full text-[10px] md:text-base font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </section> */}

      {/* Dynamic Movie Banner */}
      {!loading && bannerMovies.length > 0 ? (
        <MovieBanner movies={bannerMovies} basePath="/movies" />
      ) : !loading ? (
        <div className="h-[40vh] bg-gradient-to-br from-secondary via-background to-brand/10 flex items-center justify-center border-b border-border">
          <p className="text-muted-foreground font-semibold">Belum ada film yang ditambahkan.</p>
        </div>
      ) : null}

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4 md:space-y-8 pb-20">
          {sections.map((sec) => (
            <VideoSection
              key={sec.sectionNum}
              title={sec.title}
              videos={sec.films}
              isComingSoon={sec.sectionNum === 2}
              viewAllHref={sec.sectionNum === 2 ? "/movies?upcoming=true" : sec.categorySlug ? `/movies?category=${encodeURIComponent(sec.categorySlug)}` : "/movies"}
              className={sec.sectionNum % 2 === 0 ? "bg-secondary/20" : ""}
            />
          ))}
        </div>
      )}

      {/* Ads Section */}
      <Ads />

      {/* Genres Section */}
      <section className="py-24 px-6 bg-background relative border-t border-border overflow-hidden">
        <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                <Icon name="compass" className="w-10 h-10 text-brand" />
                Genre Pilihan
              </h2>
              <p className="text-muted-foreground text-lg">Jelajahi beragam kategori karya yang telah dikurasi untuk pengalaman menonton yang lebih bermakna.</p>
            </div>
            <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
              Jelajahi Genre <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {GENRES.map((genre, i) => (
              <div
                key={i}
                className="group relative w-[90px] h-[42px] md:w-[130px] md:h-[52px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-secondary border border-border flex items-center justify-center px-3 transition-all duration-500 hover:scale-105 hover:border-brand/40 shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-transparent opacity-30 group-hover:opacity-100 group-hover:from-brand/20 transition-all duration-500`} />
                <h3
                  className={`relative z-20 font-bold tracking-[0.1em] uppercase text-muted-foreground group-hover:text-foreground transition-colors text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 ${
                    genre.title.length > 10 ? "text-[7px] md:text-[9px]" : "text-[9px] md:text-xs"
                  }`}
                >
                  {genre.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-secondary/10 relative border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          {[
            { icon: "star", title: "Karya Terkurasi", desc: "Setiap film dipilih untuk menghadirkan kualitas dan cerita yang bermakna." },
            { icon: "users", title: "Kreator Independen", desc: "Menampilkan karya dari para kreator dengan perspektif yang autentik dan berani." },
            { icon: "crown", title: "Akses Eksklusif", desc: "Nikmati tayangan yang tidak tersedia di platform lain." },
          ].map((feat, i) => (
            <div
              key={i}
              className={`group p-5 md:p-8 rounded-2xl md:rounded-3xl bg-card border border-border hover:border-brand transition-all duration-500 flex flex-col items-center text-center ${
                i === 2 ? "col-span-2 md:col-span-1 max-w-[calc(50%-6px)] md:max-w-none mx-auto" : "col-span-1"
              }`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand/10 flex items-center justify-center mb-4 md:mb-8 group-hover:scale-110 transition-transform">
                <Icon name={feat.icon as any} className="w-6 h-6 md:w-8 md:h-8 text-brand" />
              </div>
              <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4 leading-tight">{feat.title}</h3>
              <p className="text-[11px] md:text-base text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
