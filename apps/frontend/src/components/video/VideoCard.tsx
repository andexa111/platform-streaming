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
}

export function VideoCard({ video, priority = false, isFirst, isLast, basePath = "/movies" }: VideoCardProps) {
  return (
    <Link 
      href={`${basePath}/${video.id}`}
      className="group block snap-start flex-shrink-0 w-full cursor-pointer hover:z-20 transition-all duration-300"
    >
      <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-secondary border border-border group-hover:border-brand/50 transition-all duration-500 shadow-lg group-hover:shadow-brand/20 group-hover:scale-[1.02] ${
        isFirst ? "origin-left" : isLast ? "origin-right" : "origin-center"
      }`}>
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



        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
           <div className="w-10 h-10 rounded-full bg-brand/90 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-xl backdrop-blur-sm">
             <Icon name="play" className="w-4 h-4 text-white fill-white ml-1" />
           </div>
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
      </div>
    </Link>
  );
}
