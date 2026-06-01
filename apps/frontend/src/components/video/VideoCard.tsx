import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Video } from "@/types/video";

interface VideoCardProps {
  video: Video;
  priority?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  basePath?: string;
  isComingSoon?: boolean;
}

export function VideoCard({ video, priority = false, isFirst, isLast, basePath = "/movies", isComingSoon = false }: VideoCardProps) {
  return (
    <Link
      href={`${basePath}/${video.id}`}
      className="group block snap-start flex-shrink-0 w-full cursor-pointer hover:z-20 transition-all duration-300"
    >
      <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary border border-border group-hover:border-brand/50 transition-all duration-500 shadow-lg group-hover:shadow-brand/20 group-hover:scale-[1.02] ${
        isFirst ? "origin-left" : isLast ? "origin-right" : "origin-center"
      }`}>
        {/* Coming Soon Badge */}
        {isComingSoon && (
          <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 z-10">
            <Icon name="lock" className="w-2.5 h-2.5" />
            <span>Segera Hadir</span>
          </div>
        )}

        {/* Thumbnail or Placeholder */}
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw"
            className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-brand/20 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full" />
              <Icon name="play" className="w-12 h-12 text-muted-foreground/20 relative z-10" />
            </div>
          </div>
        )}

        {/* Play / Lock Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
           {isComingSoon ? (
             <div className="w-10 h-10 rounded-full bg-amber-500/90 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl backdrop-blur-sm">
               <Icon name="lock" className="w-4 h-4 text-white" />
             </div>
           ) : (
             <div className="w-10 h-10 rounded-full bg-brand/90 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl backdrop-blur-sm">
               <Icon name="play" className="w-4 h-4 text-white fill-white ml-1" />
             </div>
           )}
        </div>
      </div>

      {/* Video Details Below */}
      <div className="mt-3 space-y-1 md:space-y-1.5 px-0.5">
        {video.genre && (
          <span className="block text-brand text-[7px] md:text-[9px] font-bold uppercase tracking-wider">
            {video.genre}
          </span>
        )}
        <h3 className="text-[11px] md:text-sm font-bold text-foreground line-clamp-1 group-hover:text-brand transition-colors">
          {video.title}
        </h3>
        {isComingSoon && video.publishedStart && (
          <span className="block text-amber-500 text-[8px] md:text-[10px] font-bold">
            Tayang: {new Date(video.publishedStart).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </Link>
  );
}

