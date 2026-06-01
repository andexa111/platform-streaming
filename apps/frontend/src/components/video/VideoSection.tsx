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
  basePath?: string;
  isComingSoon?: boolean;
}

export function VideoSection({ 
  title, 
  subtitle, 
  videos, 
  viewAllHref = "/browse",
  className = "",
  basePath = "/movies",
  isComingSoon = false
}: VideoSectionProps) {
  return (
    <section className={`py-8 md:py-12 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-foreground group cursor-default">
              {title}
              <span className="block h-1 w-12 bg-brand rounded-full mt-2 transform scale-x-75 origin-left group-hover:scale-x-100 transition-transform duration-300" />
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          
          <Link 
            href={viewAllHref}
            className="group flex items-center gap-1.5 text-xs md:text-sm font-bold text-foreground/70 hover:text-brand transition-all duration-300"
          >
            Lihat Semua
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-border bg-card/50 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all shadow-sm">
               <Icon name="arrow-right" className="w-3 h-3 md:w-4 md:h-4 text-foreground group-hover:text-white transform group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Content Row */}
        {videos && videos.length > 0 ? (
          <VideoRow videos={videos} viewAllHref={viewAllHref} basePath={basePath} isComingSoon={isComingSoon} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 text-center bg-secondary/10 rounded-2xl border border-dashed border-border/60">
            <Icon name="film" className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/40 mb-3 md:mb-4" />
            <p className="text-muted-foreground text-sm md:text-base font-medium">
              Belum ada film
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
