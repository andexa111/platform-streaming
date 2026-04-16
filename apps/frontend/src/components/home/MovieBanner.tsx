"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Video } from "@/types/video";

interface MovieBannerProps {
  movies: Video[];
  autoPlayInterval?: number;
}

export function MovieBanner({ movies, autoPlayInterval = 5000 }: MovieBannerProps) {
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

  useEffect(() => {
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [nextSlide, autoPlayInterval]);

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
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden group">
      {/* Background Slides */}
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {movie.backdrop ? (
            <Image
              src={movie.backdrop}
              alt={movie.title}
              fill
              priority={index === 0}
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-brand/20" />
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 via-transparent to-transparent z-10" />
        </div>
      ))}

      {/* Content Section - Positioned at bottom corner as requested */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-12 md:pb-20">
        <div className="max-w-xl space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-5xl font-black tracking-tight drop-shadow-lg">
              {currentMovie.title}
            </h2>
            <p className="text-[10px] md:text-sm text-neutral-300 max-w-sm md:max-w-md leading-relaxed font-medium drop-shadow-md">
              {truncateDescription(currentMovie.description || "", 20)}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/watch/${currentMovie.id}`}
              className="px-6 py-2.5 md:px-8 md:py-3 bg-brand hover:bg-brand-dark text-white rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand/20"
            >
              <Icon name="play" className="w-3 h-3 md:w-4 md:h-4 fill-current" />
              Play Now
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex items-center gap-2">
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

      {/* Navigation Arrows (Optional but good for UX) */}
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
