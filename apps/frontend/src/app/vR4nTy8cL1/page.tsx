"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VideoSection } from "@/components/video/VideoSection";
import { MovieBanner } from "@/components/home/MovieBanner";
import { GENRES } from "@/constants/video-data";
import { api, getMediaUrl } from "@/lib/api";
import { Video } from "@/types/video";

/**
 * SECRET USER HOMEPAGE — /vR4nTy8cL1
 * Shows real data from database + Bunny CDN, but uses EXACTLY the same UI as the real /home page.
 */
export default function SecretUserHomePage() {
  const [featuredFilms, setFeaturedFilms] = useState<Video[]>([]);
  const [allFilms, setAllFilms] = useState<Video[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map DB film to Video type
  const mapToVideo = (item: any): Video => {
    const f = item.film || item; // Handle featured film structure vs regular film structure
    return {
      id: f.id,
      title: f.title,
      thumbnail: getMediaUrl(f.poster_url) || "",
      backdrop: getMediaUrl(f.poster_url) || "",
      genre: f.genres && f.genres.length > 0 ? f.genres[0].name : "",
      rating: "4.5", // Mock rating as DB doesn't have it yet
      quality: "4K UHD", // Mock quality
      year: f.release_year,
      description: f.description,
      director: f.director,
      producer: f.producer,
      productionHouse: f.production_house || "",
      productionHouseLogo: getMediaUrl(f.production_house_logo) || undefined,
      trailerUrl: getMediaUrl(f.trailer_url) || undefined,
      clipStart: f.clip_start || undefined,
      clipEnd: f.clip_end || undefined,
    };
  };

  useEffect(() => {
    Promise.all([
      api.get("/featured-films").catch(() => ({ data: [] })),
      api.get("/films?limit=50").catch(() => ({ data: { data: [] } })),
      api.get("/membership-plans").catch(() => ({ data: [] }))
    ]).then(([featRes, filmsRes, plansRes]) => {
      // Map featured films
      const featured = (featRes.data || []).map(mapToVideo);
      setFeaturedFilms(featured);
      
      // Map all films
      const all = (filmsRes.data?.data || []).map(mapToVideo);
      setAllFilms(all);

      setPlans((plansRes.data || []).slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
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

      {/* Dynamic Movie Banner - Featured Content */}
      <MovieBanner 
        movies={featuredFilms.length > 0 ? featuredFilms : allFilms.slice(0, 5)} 
        basePath="/vR4nTy8cL1/watch" 
      />

      {/* Content Sections */}
      <div className="space-y-4 md:space-y-8 pb-20">
        
        {featuredFilms.length > 0 && (
          <VideoSection 
            title="Film Teratas (Featured)" 
            subtitle="Pilihan editor dari database asli" 
            videos={featuredFilms} 
            viewAllHref="/vR4nTy8cL1/movies" 
            basePath="/vR4nTy8cL1/watch"
          />
        )}

        <VideoSection 
          title="Semua Film" 
          subtitle="Katalog film dari database asli" 
          videos={allFilms} 
          viewAllHref="/vR4nTy8cL1/movies" 
          className="bg-muted/30"
          basePath="/vR4nTy8cL1/watch"
        />

        {/* Genres Section */}
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
              <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
                Jelajahi Pustaka <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {GENRES.map((genre, i) => (
                <div
                  key={i}
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
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 px-6 bg-background relative border-t border-border">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-brand">Tingkatkan Pengalaman Anda</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Anda saat ini dalam masa uji coba. Berlangganan sekarang untuk membuka ribuan film premium tanpa iklan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-7xl mx-auto">
              {plans.map((plan, index) => {
                const icons = ["chess-pawn", "chess-rook", "chess-knight", "chess-queen"];
                const colors = ["text-[#CD7F32]", "text-brand", "text-[#FFD700]", "text-purple-500"];
                const borderColors = ["border-[#CD7F32]/50", "border-brand/50", "border-[#FFD700]/50", "border-purple-500/50"];
                const isPopular = index === 2;

                return (
                  <div key={plan.id} className={`group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border ${isPopular ? borderColors[index] + ' bg-card shadow-[0_20px_50px_rgba(2,77,148,0.1)] hover:-translate-y-2' : 'border-border bg-card shadow-sm hover:shadow-md hover:-translate-y-1'} transition-all duration-500 flex flex-col col-span-1 overflow-hidden`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white px-3 md:px-4 py-1 rounded-full text-[9px] md:text-xs font-black tracking-widest uppercase shadow-lg z-20">Terpopuler</div>
                    )}
                    <div className="relative z-10 mb-6 md:mb-8 mt-1 md:mt-2">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-muted border border-border flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform">
                        <Icon name={icons[index % icons.length] as any} className={`w-5 h-5 md:w-6 md:h-6 ${colors[index % colors.length]}`} />
                      </div>
                      <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl md:text-3xl font-black text-foreground">Rp {(plan.discounted_price || plan.price) / 1000}rb</span>
                        <span className="text-xs md:text-sm text-muted-foreground">/ {plan.duration_months} bln</span>
                      </div>
                    </div>
                    <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-muted-foreground">
                      <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                        <Icon name="check" className={`w-4 h-4 md:w-5 md:h-5 ${colors[index % colors.length]}`} /> <span className="line-clamp-1">{plan.max_devices} perangkat</span>
                      </li>
                      <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                        <Icon name="check" className={`w-4 h-4 md:w-5 md:h-5 ${colors[index % colors.length]}`} /> <span className="line-clamp-1">{plan.quality}</span>
                      </li>
                    </ul>
                    <Link
                      href="/membership"
                      className={`flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-bold transition-all ${isPopular ? 'bg-brand text-white hover:bg-brand/90 shadow-md' : 'bg-secondary hover:bg-secondary/80 border border-border text-foreground'}`}
                    >
                      Pilih Paket
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
