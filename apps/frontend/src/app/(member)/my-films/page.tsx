"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { useAuthStore } from "@/lib/auth-store";
import { useCoinStore, getFilmRemainingTime } from "@/lib/coin-store";
import { cn } from "@/lib/utils";
import { Video } from "@/types/video";
import { api, getMediaUrl } from "@/lib/api";
import Image from "next/image";

export default function MyFilmsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const unlockedFilmIds = useCoinStore((s) => s.unlockedFilmIds);
  const coins = useCoinStore((s) => s.coins);

  const [films, setFilms] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  // Fetch all films then filter by unlocked IDs
  useEffect(() => {
    if (!mounted || !isAuthenticated) return;

    if (unlockedFilmIds.length === 0) {
      setFilms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get("/films?limit=100")
      .then((res) => {
        const allFilms = res.data?.data || [];
        const mapped = allFilms
          .filter((film: any) => unlockedFilmIds.includes(String(film.id)))
          .map(
            (film: any): Video => ({
              id: film.id,
              title: film.title,
              genre:
                film.genres && film.genres.length > 0
                  ? film.genres[0].name
                  : "Other",
              rating: "4.8",
              quality: "4K UHD",
              thumbnail: film.poster_url ? getMediaUrl(film.poster_url) : "",
              backdrop: film.poster_url ? getMediaUrl(film.poster_url) : "",
              description: film.description || "",
              trailerUrl: film.trailer_url
                ? getMediaUrl(film.trailer_url)
                : "",
              productionHouse: film.production_house || "",
              productionHouseLogo: film.production_house_logo
                ? getMediaUrl(film.production_house_logo)
                : "",
            })
          );
        setFilms(mapped);
      })
      .catch((err) => {
        console.error("Failed to load films", err);
        setFilms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mounted, isAuthenticated, unlockedFilmIds]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Hero Banner */}
      <section className="relative min-h-[40vh] md:min-h-[45vh] flex flex-col justify-end pt-28 md:pt-36 pb-12 md:pb-16 overflow-hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-950">
          {films.length > 0 && films[0].backdrop ? (
            <>
              <img
                src={films[0].backdrop}
                alt="My Films"
                className="w-full h-full object-cover opacity-30 blur-[2px] scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/65 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/30" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/20 via-background to-background" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/10 blur-[120px] rounded-full animate-pulse" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative w-full max-w-7xl mx-auto px-6 z-10 space-y-4 md:space-y-6">
          <div className="space-y-2 md:space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] md:text-xs font-black tracking-widest text-emerald-500 uppercase">
              <Icon name="check" className="w-3.5 h-3.5" />
              <span>Koleksi Saya</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Film Saya
            </h1>
            <p className="text-xs md:text-base text-neutral-400 max-w-2xl font-light leading-relaxed">
              Semua film yang telah kamu beli dengan koin. Tonton kapan saja,
              tanpa batas waktu.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-black">
                  {films.length}
                </span>{" "}
                Film Dibeli
              </div>
              <div className="w-1 h-1 rounded-full bg-muted" />
              <div className="flex items-center gap-1.5">
                <div className="relative w-4 h-4 scale-[2]">
                  <Image
                    src="/coin 1.png"
                    alt="Koin"
                    fill
                    className="object-contain"
                    sizes="16px"
                  />
                </div>
                <span className="text-brand font-black ml-1">{coins}</span> Koin
                Tersisa
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Films Grid */}
      <section className="pb-24 px-6 max-w-7xl mx-auto space-y-10 pt-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <span className="text-[10px] md:text-xs font-black tracking-widest text-emerald-500 uppercase">
              Koleksi
            </span>
            <div className="w-1 h-1 rounded-full bg-muted" />
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase">
              {films.length} Film
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : films.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-x-3 md:gap-x-4 gap-y-10">
            {films.map((film, index) => {
              const purchasedAt = useCoinStore.getState().getPurchasedAt(String(film.id));
              const remaining = getFilmRemainingTime(purchasedAt);
              return (
                <div
                  key={film.id}
                  className={cn(
                    "w-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative group/filmcard"
                  )}
                  style={{ animationDelay: `${(index % 6) * 100}ms` }}
                >
                  <VideoCard video={film} />
                  {/* Active Expiration Overlay Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 bg-neutral-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded-lg text-[8px] md:text-[9px] font-black tracking-wide flex items-center gap-1 shadow-md">
                    <Icon name="clock" className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{remaining.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto border border-border">
              <Icon
                name="film"
                className="w-10 h-10 text-muted-foreground/40"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                Belum Ada Film
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Kamu belum membeli film apapun. Jelajahi katalog kami dan temukan
                film favorit untuk ditonton.
              </p>
            </div>
            <button
              onClick={() => router.push("/movies")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(2,77,148,0.3)]"
            >
              <Icon name="compass" className="w-4 h-4" />
              Jelajahi Katalog Film
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
