"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Video } from "@/types/video";
import { Player } from "@/components/video/Player";
import type { MediaPlayerInstance } from "@vidstack/react";

interface MovieBannerProps {
  movies: Video[];
  autoPlayInterval?: number;
  basePath?: string;
}

export function MovieBanner({ movies, autoPlayInterval = 5000, basePath = "/watch" }: MovieBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const videoRefs = useRef<(MediaPlayerInstance | null)[]>([]);

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

    // Jika index 0 (banner event khusus), biarkan video diputar sepenuhnya
    // dan tidak ada autoPlay timeout. Transisi ke slide berikutnya diatur oleh event onEnded video.
    if (currentIndex === 0) {
      return;
    }

    const currentMovie = movies[currentIndex];
    
    let delay = autoPlayInterval;
    if (currentMovie?.trailerUrl) {
      if (currentMovie.clipStart !== undefined && currentMovie.clipEnd !== undefined) {
        delay = (currentMovie.clipEnd - currentMovie.clipStart) * 1000;
        if (delay <= 0) delay = 10000;
      } else {
        delay = 10000;
      }
    }
    
    const timer = setTimeout(nextSlide, delay);
    return () => clearTimeout(timer);
  }, [currentIndex, nextSlide, autoPlayInterval, movies]);

  // Manage video playing state
  useEffect(() => {
    const currentMovie = movies[currentIndex];
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        if (idx === currentIndex) {
          video.currentTime = currentMovie?.clipStart || 0;
          video.play().catch(() => {});
        } else {
          // Pause after 1s to allow the fade transition to complete smoothly
          setTimeout(() => {
            if (video) video.pause();
          }, 1000);
        }
      }
    });
  }, [currentIndex, movies]);

  const truncateDescription = (text: string, wordLimit: number) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];

  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden group bg-background">
      {/* Background Slides */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {movie.trailerUrl ? (
            <Player
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              variant="banner"
              src={movie.trailerUrl}
              loop={index !== 0 || movies.length === 1}
              onTimeUpdate={() => {
                const video = videoRefs.current[index];
                if (video && movie.clipEnd && video.currentTime >= movie.clipEnd) {
                  video.currentTime = movie.clipStart || 0;
                }
              }}
              onEnded={nextSlide}
              className="w-full h-full"
            />
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
      ))}

      {/* Content Section */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12 md:pb-20">
        <div className="max-w-xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2">
            {/* Production House Info */}
            {currentMovie.productionHouse && (
              <div className="flex items-center gap-2 mb-3">
                {currentMovie.productionHouseLogo && (
                  <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/20 bg-white/10">
                    <Image 
                      src={currentMovie.productionHouseLogo} 
                      alt={currentMovie.productionHouse} 
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="text-xs md:text-sm font-bold text-brand tracking-widest uppercase drop-shadow-md">
                  {currentMovie.productionHouse}
                </span>
              </div>
            )}
            <h2 className="text-2xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-sm">
              {currentMovie.title}
            </h2>
            <p className="text-[10px] md:text-sm text-muted-foreground max-w-sm md:max-w-md leading-relaxed font-medium">
              {truncateDescription(currentMovie.description || "", 20)}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={currentMovie.id === 0 && basePath === "/movies" ? "/login?redirect=/watch/0" : `${basePath}/${currentMovie.id}`}
              className="px-6 py-2.5 md:px-8 md:py-3 bg-brand hover:bg-brand-dark text-white rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand/20"
            >
              <Icon name="play" className="w-3 h-3 md:w-4 md:h-4 fill-current" />
              Tonton Sekarang
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex flex-wrap max-w-[50%] justify-end items-center gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 transition-all duration-300 rounded-full ${
              index === currentIndex ? "w-8 bg-brand" : "w-3 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <Icon name="chevron-right" className="w-6 h-6 rotate-180" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 hidden md:block"
      >
        <Icon name="chevron-right" className="w-6 h-6" />
      </button>
    </section>
  );
}
