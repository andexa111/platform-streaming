"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "@/components/video/VideoCard";
import { cn } from "@/lib/utils";
import { Video } from "@/types/video";

import { ALL_MOVIES } from "@/constants/video-data";

export default function MovieDetailPage() {
  const { id } = useParams();
  const movieId = parseInt(id as string);

  // States to handle In-Place Player & Access
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulated auth state
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const movie = ALL_MOVIES.find((m) => m.id === movieId) || ALL_MOVIES[0];
  const relatedMovies = ALL_MOVIES.filter((m) => m.id !== movie.id).slice(0, 6);

  const handleWatchNow = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setIsPlaying(true);
  };

  return (
    <main className={cn("min-h-screen bg-neutral-950 text-white selection:bg-brand/30 transition-all duration-500", isPlaying ? "pt-20" : "pt-0")}>
      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />

          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center space-y-8">
            {/* Icon Group */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-brand/10 flex items-center justify-center border border-brand/20">
                <Icon name="lock" className="w-10 h-10 text-brand" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-4 border-neutral-900">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Join LALAKON</h2>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">Silakan masuk ke akun Anda atau daftar sekarang untuk menikmati ribuan film berkualitas 4K di platform kami.</p>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <Link
                href="/login"
                className="flex items-center justify-center w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_30px_rgba(2,77,148,0.3)]"
              >
                Login Sekarang
              </Link>
              <button onClick={() => setShowAuthModal(false)} className="flex items-center justify-center w-full py-4 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-2xl font-bold transition-all">
                Mungkin Nanti
              </button>
            </div>

            {/* Footer Text */}
            <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Premium Cinema Experience</p>
          </div>
        </div>
      )}

      {/* Debug Switch (Development only) */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-neutral-900/80 p-2 rounded-full border border-white/10 backdrop-blur-md">
        <span className="text-[10px] uppercase font-bold text-neutral-500 px-2 tracking-widest">Status: {isLoggedIn ? "Member" : "Guest"}</span>
        <button
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all", isLoggedIn ? "bg-green-500 text-white" : "bg-neutral-700 text-white hover:bg-neutral-600")}
        >
          {isLoggedIn ? "Switch to Guest" : "Switch to Member"}
        </button>
      </div>

      {/* Media & Content Wrapper */}
      <div className="relative">
        {/* Hero Media Section */}
        <section className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-black">
          {/* Conditional Content: Backdrop OR Video Player */}
          {!isPlaying ? (
            <>
              {/* Backdrop Image with mask */}
              <div className="absolute inset-0 z-0 animate-in fade-in zoom-in-105 duration-1000">
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-neutral-950/20 z-10" />

                {movie.thumbnail ? <Image src={movie.thumbnail} alt={movie.title} fill priority className="object-cover object-center" /> : <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-brand/10" />}
              </div>
            </>
          ) : (
            /* Video Player Overlay */
            <div className="absolute inset-0 z-40 bg-black animate-in fade-in zoom-in-95 duration-500">
              {/* Close Button */}
              <button onClick={() => setIsPlaying(false)} className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all group active:scale-95">
                <Icon name="x" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Mock Player Interface */}
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-full h-full relative group">
                  {/* Simulated Video Feed */}
                  <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center overflow-hidden">
                    {movie.thumbnail && <Image src={movie.thumbnail} alt="video preview" fill className="object-cover opacity-30 blur-2xl grayscale" />}
                    <div className="relative flex flex-col items-center gap-6 z-10">
                      <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center shadow-[0_0_50px_rgba(2,77,148,0.5)] animate-pulse">
                        <Icon name="play" className="w-10 h-10 fill-current" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-xl font-bold tracking-tight">Menampilkan Video: {movie.title}</p>
                        <p className="text-neutral-400 text-sm italic">Simulasi Pemutaran Video (High Quality 4K)</p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Controls Placeholder */}
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/40 to-transparent">
                    <div className="max-w-7xl mx-auto space-y-6">
                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-white/20 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-[45%] h-full bg-brand" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <Icon name="play" className="w-6 h-6 fill-current cursor-pointer hover:scale-110 transition-transform" />
                          <div className="flex items-center gap-4 text-neutral-400 text-xs font-bold font-mono">
                            <span className="text-white">01:12:45</span>
                            <span>/</span>
                            <span>02:15:00</span>
                          </div>
                          <button className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md hover:bg-white/10 transition-colors">
                            <Icon name="volume-2" className="w-4 h-4" />
                            <span className="text-[10px] font-bold">85%</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-6">
                          <Icon name="settings" className="w-6 h-6 cursor-pointer hover:rotate-90 transition-transform" />
                          <Icon name="maximize" className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Content Overlay - Moves dynamically */}
        <div
          className={cn(
            "max-w-7xl mx-auto px-6 flex flex-col space-y-6 md:space-y-8 animate-in fade-in transition-all duration-700",
            isPlaying ? "relative pt-12 pb-4" : "absolute bottom-0 left-0 right-0 z-20 h-full justify-end pb-20 md:pb-32 bg-gradient-to-t from-neutral-950 via-transparent to-transparent",
          )}
        >
          <div className="space-y-4">
            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="px-2 py-0.5 md:px-3 md:py-1 rounded bg-brand/90 text-[10px] md:text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand/20">{movie.quality}</span>
              <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-yellow-500">
                <Icon name="star" className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" />
                <span>{movie.rating}</span>
              </div>
              <span className="text-neutral-400 text-xs md:text-sm font-medium">2024</span>
              <span className="text-neutral-400 text-xs md:text-sm font-medium">2h 15m</span>
              <div className="w-1 h-1 rounded-full bg-neutral-700 mx-1 md:mx-2" />
              <span className="text-brand text-xs md:text-sm font-bold uppercase tracking-wider">{movie.genre}</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight max-w-4xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400">{movie.title}</span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={handleWatchNow}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 bg-brand hover:bg-brand-dark text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(2,77,148,0.3)] group"
            >
              <Icon name="play" className="w-4 h-4 md:w-5 md:h-5 fill-current transition-transform group-hover:scale-110" />
              {isPlaying ? "Restart Movie" : "Watch Now"}
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95">
              <Icon name="film" className="w-4 h-4 md:w-5 md:h-5" />
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <section className={cn("relative z-30 px-6 pb-24 max-w-7xl mx-auto space-y-16 transition-all duration-700", isPlaying ? "pt-10" : "-mt-10 md:-mt-20")}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          {/* Left: Synopsis & Info */}
          <div className="lg:col-span-2 space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <div className="w-1 h-8 bg-brand rounded-full" />
                Synopsis
              </h2>
              <p className="text-neutral-400 text-base md:text-xl leading-relaxed font-light">
                Discover the epic story of {movie.title}, where destiny meets the unknown. This cinematic masterpiece takes you on a journey through unparalleled visuals and heart-pounding action. As the boundaries of reality blur, a group
                of unlikely heroes must unite to face an ancient power that threatens to reshape the world as we know it.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-6 border-t border-white/5">
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-500">Director</span>
                <p className="font-bold text-sm md:text-base">Christopher Nolan</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-500">Studio</span>
                <p className="font-bold text-sm md:text-base">Lalakon Originals</p>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-500">Release Date</span>
                <p className="font-bold text-sm md:text-base">October 12, 2024</p>
              </div>
            </div>
          </div>

          {/* Right: Cast / Sidebar Details */}
          <div className="space-y-10 bg-neutral-900/30 p-8 rounded-3xl border border-white/5 backdrop-blur-sm h-fit">
            <h3 className="text-xl font-bold border-b border-white/5 pb-4">Main Cast</h3>
            <div className="space-y-6">
              {[
                { name: "Cillian Murphy", role: "Protagonist" },
                { name: "Emily Blunt", role: "Key Support" },
                { name: "Matt Damon", role: "Antagonist" },
                { name: "Florence Pugh", role: "Side Character" },
              ].map((cast, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 border border-white/10 group-hover:border-brand transition-colors overflow-hidden" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold group-hover:text-brand transition-colors">{cast.name}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{cast.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Content Section */}
        <div className="space-y-10">
          <div className="flex items-end justify-between">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">More Like This</h2>
              <p className="text-neutral-500">Handpicked movies you might enjoy based on your interest.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
            {relatedMovies.map((m) => (
              <VideoCard key={m.id} video={m} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
