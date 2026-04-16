import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { Video } from "@/types/video";

interface VideoCardProps {
  video: Video;
  priority?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

export function VideoCard({ video, priority = false, isFirst, isLast }: VideoCardProps) {
  return (
    <Link 
      href={`/movies/${video.id}`}
      className="group block snap-start flex-shrink-0 w-full cursor-pointer hover:z-20 transition-all duration-300"
    >
      <div className={`relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 border border-white/5 group-hover:border-brand/50 transition-all duration-500 shadow-lg group-hover:shadow-brand/20 group-hover:scale-[1.02] ${
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
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-brand/20 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full" />
              <Icon name="play" className="w-12 h-12 text-white/10 relative z-10" />
            </div>
          </div>
        )}

        {/* Quality Badge */}
        {video.quality && (
          <div className="absolute top-2 right-2 bg-brand/90 backdrop-blur-md text-white text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded md:rounded-md tracking-wider pointer-events-none transform translate-y-0 group-hover:-translate-y-1 transition-transform z-10">
            {video.quality}
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
        <h3 className="text-[11px] md:text-sm font-bold text-white line-clamp-1 group-hover:text-brand transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex items-center gap-1 text-neutral-400">
            <Icon name="star" className="w-2 h-2 md:w-2.5 md:h-2.5 text-yellow-500 fill-yellow-500" />
            <span className="text-[9px] md:text-xs font-medium">{video.rating || "N/A"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
