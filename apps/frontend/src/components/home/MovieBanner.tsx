"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Video } from "@/types/video";
import { ProtectedVideo } from "@/components/video/ProtectedVideo";
import { getMediaUrl } from "@/lib/api";

interface MovieBannerProps {
  movies: Video[];
  autoPlayInterval?: number;
  basePath?: string;
}

export function MovieBanner({ movies, autoPlayInterval = 5000, basePath = "/movies" }: MovieBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setTimeout(() => setIsAnimating(false), 500); // Wait for transition
  }, [isAnimating, movies.length]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Manage auto-slide interval and limit video to 10s or custom clip duration
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const currentMovie = movies[currentIndex];
    
    let delay = autoPlayInterval;
    if (currentMovie?.trailerUrl) {
      if (currentMovie.clipStart !== undefined && currentMovie.clipStart !== null && currentMovie.clipEnd !== undefined && currentMovie.clipEnd !== null) {
        delay = (currentMovie.clipEnd - currentMovie.clipStart) * 1000;
        if (delay <= 0) delay = 10000;
      } else {
        delay = 10000;
      }
    }
    
    const timer = setTimeout(nextSlide, delay);
    return () => clearTimeout(timer);
  }, [currentIndex, nextSlide, autoPlayInterval, movies]);

  const truncateDescription = (text: string, wordLimit: number) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <section className="relative w-full aspect-[4/3] md:aspect-auto md:h-[80vh] overflow-hidden group bg-background">
      {/* Background Slides */}
      {movies.map((movie, index) => {
        const isTrailerLocal = movie.trailerUrl?.startsWith("http") || movie.trailerUrl?.includes("/uploads") || movie.trailerUrl?.includes(".mp4");
        
        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {index === currentIndex && movie.trailerUrl ? (
              isTrailerLocal ? (
                <ProtectedVideo
                  src={movie.trailerUrl!}
                  muted
                  playsInline
                  autoPlay
                  onLoadedMetadata={(e) => {
                    if (movie.clipStart) {
                      (e.currentTarget as HTMLVideoElement).currentTime = movie.clipStart;
                    }
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget as HTMLVideoElement;
                    if (movie.clipEnd && video.currentTime >= movie.clipEnd) {
                      video.currentTime = movie.clipStart || 0;
                    }
                  }}
                  onEnded={nextSlide}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-black">
                  <iframe
                    src={`https://iframe.mediadelivery.net/embed/245642/${movie.trailerUrl}?autoplay=true&loop=true&muted=true&controls=false`}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    className="w-full h-full border-none absolute inset-0 pointer-events-none scale-[1.3] aspect-video"
                  />
                </div>
              )
            ) : movie.backdrop ? (
              <Image
                src={movie.backdrop}
                alt={movie.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted via-background to-brand/20" />
            )}
            
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent z-10" />
          </div>
        );
      })}

      {/* Content Section */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pt-28 pb-8 md:pb-20">
        <div className="max-w-xl space-y-2 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2">
            {/* Production House Info */}
            {currentMovie.productionHouse && (
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                {currentMovie.productionHouseLogo && (
                  <div className="relative w-4 h-4 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/20 bg-white/10">
                    <Image 
                      src={currentMovie.productionHouseLogo} 
                      alt={currentMovie.productionHouse} 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-[9px] md:text-sm font-bold text-brand tracking-widest uppercase drop-shadow-md">
                  {currentMovie.productionHouse}
                </span>
              </div>
            )}
            <h2 className="text-sm md:text-5xl font-black tracking-tight text-foreground drop-shadow-sm leading-tight">
              {currentMovie.title}
            </h2>
            <p className="text-[8px] md:text-sm text-muted-foreground max-w-[220px] md:max-w-md leading-relaxed font-medium">
              {truncateDescription(currentMovie.description || "", 15)}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 pt-1 md:pt-2">
            <Link
              href={`${basePath}/${currentMovie.id}`}
              className="px-3 py-1.5 md:px-8 md:py-3 bg-brand hover:bg-brand-dark text-white rounded-full text-[8px] md:text-sm font-bold flex items-center gap-1.5 md:gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand/20"
            >
              <Icon name="play" className="w-2.5 h-2.5 md:w-4 md:h-4 fill-current" />
              Tonton Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Controls Container (Arrows + Indicators) */}
      <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-30 flex flex-col items-end gap-3">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={prevSlide}
            className="p-1.5 md:p-2 rounded-full bg-black/40 hover:bg-brand text-white/70 hover:text-white transition-all backdrop-blur-sm"
          >
            <Icon name="chevron-right" className="w-3 h-3 md:w-5 md:h-5 rotate-180" />
          </button>
          <button
            onClick={nextSlide}
            className="p-1.5 md:p-2 rounded-full bg-black/40 hover:bg-brand text-white/70 hover:text-white transition-all backdrop-blur-sm"
          >
            <Icon name="chevron-right" className="w-3 h-3 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-end items-center gap-1 md:gap-2">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 md:h-1.5 transition-all duration-300 rounded-full ${
                index === currentIndex ? "w-4 md:w-8 bg-brand" : "w-1.5 md:w-3 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
