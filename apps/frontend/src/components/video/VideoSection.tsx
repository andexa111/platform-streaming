import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { VideoRow } from "./VideoRow";
import { Video } from "@/types/video";

interface VideoSectionProps {
  title: string;
  subtitle?: string;
  videos: Video[];
  viewAllHref?: string;
  className?: string;
}

export function VideoSection({ 
  title, 
  subtitle, 
  videos, 
  viewAllHref = "/browse",
  className = "" 
}: VideoSectionProps) {
  return (
    <section className={`py-8 md:py-12 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-white group cursor-default">
              {title}
              <span className="block h-1 w-12 bg-brand rounded-full mt-2 transform scale-x-75 origin-left group-hover:scale-x-100 transition-transform duration-300" />
            </h2>
            {subtitle && (
              <p className="text-neutral-400 text-sm md:text-base max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          
          <Link 
            href={viewAllHref}
            className="group flex items-center gap-1.5 text-xs md:text-sm font-bold text-neutral-400 hover:text-brand transition-all duration-300"
          >
            Lihat Semua
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-brand/20 group-hover:border-brand/30 transition-all">
               <Icon name="arrow-right" className="w-3 h-3 md:w-4 md:h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Content Row */}
        <VideoRow videos={videos} viewAllHref={viewAllHref} />
      </div>
    </section>
  );
}
