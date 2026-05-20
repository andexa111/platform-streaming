/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SWITCH HALAMAN: COMING SOON vs HALAMAN UTAMA                  ║
 * ║                                                                 ║
 * ║  Untuk menampilkan COMING SOON:                                ║
 * ║    - Biarkan kode di bawah seperti sekarang                    ║
 * ║                                                                 ║
 * ║  Untuk menampilkan HALAMAN UTAMA (setelah launch):             ║
 * ║    1. Comment baris import ComingSoon & return <ComingSoon />   ║
 * ║    2. Uncomment seluruh blok "HALAMAN UTAMA ASLI" di bawah     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════
// COMING SOON MODE (AKTIF)
// ═══════════════════════════════════════════════════════════════════
// import ComingSoon from "@/components/coming-soon/ComingSoon";

// export default function Home() {
//   return <ComingSoon />;
// }

// ═══════════════════════════════════════════════════════════════════
// HALAMAN UTAMA ASLI (NONAKTIF — Uncomment saat mau launch)
// ═══════════════════════════════════════════════════════════════════

import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { VideoSection } from "@/components/video/VideoSection";
import { cn } from "@/lib/utils";

import { ALL_MOVIES, GENRES } from "@/constants/video-data";

const PLANS = [
  {
    name: "1 Bulan",
    price: "50K",
    period: "",
    icon: "chess-pawn",
    color: "text-brand",
    borderColor: "border-brand/30",
    bgColor: "bg-brand/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: false,
    buttonClass: "bg-brand/10 text-brand dark:text-white border border-brand/20 hover:bg-brand hover:text-white hover:border-brand shadow-brand/10",
  },
  {
    name: "3 Bulan",
    price: "150K",
    period: "",
    icon: "chess-rook",
    color: "text-[#CD7F32]",
    borderColor: "border-[#CD7F32]/30",
    bgColor: "bg-[#CD7F32]/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: false,
    buttonClass: "bg-[#CD7F32]/10 text-[#CD7F32] dark:text-white border border-[#CD7F32]/20 hover:bg-[#CD7F32] hover:text-white hover:border-[#CD7F32] shadow-[#CD7F32]/10",
  },
  {
    name: "6 Bulan",
    price: "300K",
    period: "",
    icon: "chess-knight",
    color: "text-neutral-400 dark:text-white",
    borderColor: "border-neutral-300/80 dark:border-white/20",
    bgColor: "bg-neutral-200/20 dark:bg-white/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: true,
    buttonClass: "bg-neutral-200/50 dark:bg-white/10 text-neutral-700 dark:text-white border border-neutral-300 dark:border-white/20 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-950 hover:border-neutral-900 dark:hover:border-white shadow-sm dark:shadow-white/5",
  },
  {
    name: "1 Tahun",
    price: "600K",
    period: "",
    icon: "chess-queen",
    color: "text-[#FFD700]",
    borderColor: "border-[#FFD700]/40 dark:border-[#FFD700]/30",
    bgColor: "bg-[#FFD700]/5",
    features: ["Akses Semua Film & Series", "Kualitas Full HD", "Tanpa Iklan", "Download untuk Offline"],
    buttonText: "Pilih Paket",
    popular: false,
    buttonClass: "bg-[#FFD700]/10 text-[#B8860B] dark:text-white border border-[#FFD700]/20 dark:border-[#FFD700]/20 hover:bg-[#FFD700] hover:text-neutral-950 hover:border-[#FFD700] shadow-[#FFD700]/10",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/10 via-background to-background -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

        <div className="max-w-7xl mx-auto text-center space-y-6 md:space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-secondary border border-border text-xs md:text-sm font-medium">
            <Icon name="sparkles" className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand animate-bounce" />
            <span className="text-muted-foreground">Karya Baru Segera Hadir</span>
          </div>
          <h1 className="text-4xl md:text-8xl font-black tracking-tight leading-[1.1]">
            <span className="block pb-2 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-muted-foreground">Streaming</span>
            <span className="block pb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500">Karya Eksklusif</span>
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            Ruang bagi karya visual yang berani dan autentik.
            <br />
            Jelajahi film, dokumenter, dan cerita sinematik dari kreator pilihan.
          </p>
          <div className="pt-6 md:pt-8 flex flex-row items-center justify-center gap-2 md:gap-4 w-full px-4 md:px-0">
            <Link
              href="/login"
              className="flex-1 sm:flex-none w-auto bg-brand hover:bg-brand-dark text-white px-3 py-3 md:px-8 md:py-4 rounded-full text-[10px] md:text-base font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1 md:gap-2 shadow-[0_0_30px_rgba(2,77,148,0.3)]"
            >
              Login
              <Icon name="login" className="w-3 h-3 md:w-5 md:h-5 fill-none" />
            </Link>
            <Link
              href="/movies"
              className="flex-1 sm:flex-none w-auto bg-secondary/50 hover:bg-secondary backdrop-blur-md border border-border text-foreground px-3 py-3 md:px-8 md:py-4 rounded-full text-[10px] md:text-base font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </section>
      <VideoSection title="Sedang Tayang" videos={ALL_MOVIES} viewAllHref="/movies" />
      <VideoSection title="Segera Hadir" videos={[...ALL_MOVIES].reverse()} viewAllHref="/movies" className="bg-secondary/20" />
      {/* Genres Section */}
      <section className="py-24 px-6 bg-background relative border-t border-border overflow-hidden">
        <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                <Icon name="compass" className="w-10 h-10 text-brand" />
                Genre Pilihan
              </h2>
              <p className="text-muted-foreground text-lg">Jelajahi beragam kategori karya yang telah dikurasi untuk pengalaman menonton yang lebih bermakna.</p>
            </div>
            <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
              Jelajahi Genre <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {GENRES.map((genre, i) => (
              <div
                key={i}
                className="group relative w-[90px] h-[42px] md:w-[130px] md:h-[52px] rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-secondary border border-border flex items-center justify-center px-3 transition-all duration-500 hover:scale-105 hover:border-brand/40 shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${genre.color} to-transparent opacity-30 group-hover:opacity-100 group-hover:from-brand/20 transition-all duration-500`} />
                <h3
                  className={`relative z-20 font-bold tracking-[0.1em] uppercase text-muted-foreground group-hover:text-foreground transition-colors text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 ${
                    genre.title.length > 10 ? "text-[7px] md:text-[9px]" : "text-[9px] md:text-xs"
                  }`}
                >
                  {genre.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-24 px-6 bg-secondary/10 relative border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          {[
            { icon: "star", title: "Karya Terkurasi", desc: "Setiap film dipilih untuk menghadirkan kualitas dan cerita yang bermakna." },
            { icon: "users", title: "Kreator Independen", desc: "Menampilkan karya dari para kreator dengan perspektif yang autentik dan berani." },
            { icon: "crown", title: "Akses Eksklusif", desc: "Nikmati tayangan yang tidak tersedia di platform lain." },
          ].map((feat, i) => (
            <div
              key={i}
              className={`group p-5 md:p-8 rounded-2xl md:rounded-3xl bg-card border border-border hover:border-brand transition-all duration-500 flex flex-col items-center text-center ${
                i === 2 ? "col-span-2 md:col-span-1 max-w-[calc(50%-6px)] md:max-w-none mx-auto" : "col-span-1"
              }`}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-brand/10 flex items-center justify-center mb-4 md:mb-8 group-hover:scale-110 transition-transform">
                <Icon name={feat.icon as any} className="w-6 h-6 md:w-8 md:h-8 text-brand" />
              </div>
              <h3 className="text-sm md:text-2xl font-bold mb-2 md:mb-4 leading-tight">{feat.title}</h3>
              <p className="text-[11px] md:text-base text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Pricing Section */}
      <section className="py-24 px-6 bg-secondary/30 relative border-t border-border overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"> Pilih Paket Menontonmu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Akses karya film eksklusif dari kreator independen. Pilih paket yang sesuai dan mulai menikmati tanpa batas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "group relative p-6 md:p-8 rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-4 flex flex-col overflow-hidden",
                  plan.borderColor,
                  "bg-neutral-50 dark:bg-neutral-900/80 hover:bg-neutral-100/60 dark:hover:bg-neutral-900/60 shadow-2xl shadow-neutral-950/5 dark:shadow-white/5",
                )}
              >
                {/* Card Decoration */}
                <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12">
                  <Icon name={plan.icon as any} className="w-32 h-32 md:w-40 md:h-40" />
                </div>

                <div className="relative z-10 space-y-6 flex-1">
                  {/* Header */}
                  <div className="space-y-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner", plan.bgColor)}>
                      <Icon name={plan.icon as any} className={cn("w-6 h-6", plan.color)} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tight">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white">Rp {plan.price}</span>
                        {plan.period && <span className="text-neutral-500 font-bold">{plan.period}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-500">Apa yang didapat:</p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 group/item">
                          <div className={cn("mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border border-neutral-200 dark:border-white/10 group-hover/item:border-brand transition-colors", plan.bgColor)}>
                            <Icon name="check" className={cn("w-2.5 h-2.5", plan.color)} />
                          </div>
                          <span className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 font-medium group-hover/item:text-neutral-900 dark:group-hover/item:text-white transition-colors">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Link */}
                <Link
                  href="/membership"
                  className={cn(
                    "mt-8 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all active:scale-95 shadow-xl relative z-10 flex items-center justify-center text-center",
                    plan.buttonClass,
                  )}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
