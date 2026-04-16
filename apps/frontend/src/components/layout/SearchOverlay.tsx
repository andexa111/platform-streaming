"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  setQuery: (query: string) => void;
}

const TRENDING_SEARCHES = [
  "One Piece",
  "Harry Potter",
  "Climax",
  "The Boys",
  "Bloodhounds",
  "Avatar",
  "High Potential",
];

export function SearchOverlay({ isOpen, onClose, query, setQuery }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-xl animate-in fade-in duration-300 flex items-start justify-center pt-[10vh] md:pt-[15vh] px-4"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] animate-in fade-in slide-in-from-top-4 duration-500"
      >
        {/* Search Bar Container */}
        <div className="relative group">
          <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          
          <div className="relative flex items-center bg-neutral-900/50 border border-white/10 group-focus-within:border-brand/50 rounded-2xl px-5 py-4 shadow-2xl transition-all">
            <Icon name="search" className="w-5 h-5 text-neutral-500 group-focus-within:text-brand transition-colors mr-4" />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, or actors..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-white placeholder:text-neutral-500"
            />

            {query && (
              <button 
                onClick={() => setQuery("")}
                className="p-1 hover:bg-white/10 rounded-full transition-colors mr-2"
              >
                <Icon name="x" className="w-4 h-4 text-neutral-400" />
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 border border-white/5 text-[10px] font-bold text-neutral-500 select-none">
              ESC
            </div>
          </div>
        </div>

        {/* Trending Tags */}
        <div className="mt-10 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 ml-1">
            Top Searches Now
          </h3>
          <div className="flex flex-wrap gap-2">
            {TRENDING_SEARCHES.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-2 rounded-full bg-neutral-900 border border-white/5 text-xs font-semibold text-neutral-400 hover:text-white hover:border-brand/40 hover:bg-brand/5 transition-all"
              >
                {tag.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative close on top right for mobile */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 bg-neutral-900/50 rounded-full border border-white/10 text-neutral-400 hover:text-white md:hidden"
        >
          <Icon name="x" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
