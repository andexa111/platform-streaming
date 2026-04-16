import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface ViewAllCardProps {
  href?: string;
  isLast?: boolean;
}

export function ViewAllCard({ href = "/browse", isLast }: ViewAllCardProps) {
  return (
    <Link 
      href={href}
      className="group relative snap-start flex-shrink-0 w-full"
    >
      <div className={`relative aspect-[2/3] rounded-xl bg-neutral-900 border-2 border-dashed border-white/10 group-hover:border-brand/50 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-4 group-hover:scale-105 group-hover:bg-brand/5 ${
        isLast ? "origin-right" : "origin-center"
      }`}>
        {/* Harmonious Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-brand group-hover:border-brand transition-all duration-500 shadow-xl">
          <Icon name="arrow-right" className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
        </div>
        
        <div className="relative z-10 text-center">
          <p className="text-[11px] md:text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">Lihat Semua</p>
          <p className="text-[9px] md:text-[10px] text-neutral-500 group-hover:text-white/60">Temukan lebih banyak</p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-colors" />
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand/10 rounded-full blur-3xl group-hover:bg-brand/20 transition-colors" />
      </div>
    </Link>
  );
}
