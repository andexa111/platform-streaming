"use client";

import { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { VideoCard } from "./VideoCard";
import { ViewAllCard } from "./ViewAllCard";
import { Video } from "@/types/video";

interface VideoRowProps {
  videos: Video[];
  viewAllHref?: string;
}

export function VideoRow({ videos, viewAllHref }: VideoRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [videos]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="group/row relative w-full">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 z-30 w-8 h-8 md:w-12 md:h-12 rounded-full bg-neutral-900/80 border border-white/10 text-white flex items-center justify-center opacity-80 md:opacity-0 group-hover/row:opacity-100 md:group-hover/row:translate-x-2 transition-all duration-300 hover:bg-brand hover:border-brand backdrop-blur-md shadow-2xl"
          aria-label="Scroll Left"
        >
          <Icon name="chevron-right" className="w-4 h-4 md:w-6 md:h-6 rotate-180" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 z-30 w-8 h-8 md:w-12 md:h-12 rounded-full bg-neutral-900/80 border border-white/10 text-white flex items-center justify-center opacity-80 md:opacity-0 group-hover/row:opacity-100 md:group-hover/row:-translate-x-2 transition-all duration-300 hover:bg-brand hover:border-brand backdrop-blur-md shadow-2xl"
          aria-label="Scroll Right"
        >
          <Icon name="chevron-right" className="w-4 h-4 md:w-6 md:h-6" />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex w-full gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar py-6 -my-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video, index) => (
          <div 
            key={video.id} 
            className="flex-shrink-0 w-[calc((100%-24px)/3)] md:w-[calc((100%-64px)/5)] xl:w-[calc((100%-80px)/6)]"
          >
            <VideoCard 
              video={video} 
              isFirst={index === 0}
            />
          </div>
        ))}
        <div className="flex-shrink-0 w-[calc((100%-24px)/3)] md:w-[calc((100%-64px)/5)] xl:w-[calc((100%-80px)/6)]">
          <ViewAllCard href={viewAllHref} isLast={true} />
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
