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

import { ALL_MOVIES, GENRES } from "@/constants/video-data";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-brand/30">
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
      <section className="py-24 px-6 bg-secondary/30 relative border-t border-border overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground"> Pilih Paket Menontonmu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Akses karya film eksklusif dari kreator independen. Pilih paket yang sesuai dan mulai menikmati tanpa batas.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8 max-w-5xl mx-auto">
            <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col col-span-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-brand/5 to-transparent opacity-30 pointer-events-none" />
              <div className="relative z-10 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary border border-border flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner">
                  <Icon name="chess-rook" className="w-5 h-5 md:w-6 md:h-6 text-[#CD7F32]" />
                </div>
                <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-4xl font-black text-foreground">Rp 49K</span>
                  <span className="text-xs md:text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-muted-foreground">
                <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                  <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#CD7F32]" /> <span className="line-clamp-1">1 device</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                  <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#CD7F32]" /> <span className="line-clamp-1">SD (720p)</span>
                </li>
              </ul>
              <Link
                href="/membership"
                className="flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-bold bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all"
              >
                Pre-order
              </Link>
            </div>
            <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-brand/50 bg-card shadow-[0_20px_50px_rgba(2,77,148,0.1)] hover:shadow-[0_30px_70px_rgba(2,77,148,0.2)] transform hover:-translate-y-2 transition-all duration-500 flex flex-col col-span-1">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white px-3 md:px-4 py-1 rounded-full text-[9px] md:text-xs font-black tracking-widest uppercase shadow-lg z-20">Popular</div>
              <div className="relative z-10 mb-6 md:mb-8 mt-1 md:mt-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand/10 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner border border-brand/20">
                  <Icon name="chess-knight" className="w-5 h-5 md:w-6 md:h-6 text-brand" />
                </div>
                <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-4xl font-black text-foreground">Rp 99K</span>
                  <span className="text-xs md:text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-foreground">
                <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                  <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-brand" /> <span className="line-clamp-1 font-medium">2 devices</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                  <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-brand" /> <span className="line-clamp-1 font-medium">FHD (1080p)</span>
                </li>
              </ul>
              <Link
                href="/membership"
                className="flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-black bg-brand text-white hover:bg-brand/90 transition-all shadow-md"
              >
                Pre-order
              </Link>
            </div>
            <div className="group relative p-4 md:p-8 rounded-2xl md:rounded-3xl border border-[#FFD700]/50 bg-card shadow-[0_8px_30px_rgba(255,215,0,0.06)] hover:shadow-[0_30px_70px_rgba(255,215,0,0.15)] transition-all duration-500 hover:-translate-y-2 flex flex-col col-span-2 md:col-span-1 max-w-[calc(50%-6px)] md:max-w-none mx-auto w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFD700]/5 to-transparent opacity-30 pointer-events-none" />
              <div className="relative z-10 mb-6 md:mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4 md:mb-6 mr-auto group-hover:scale-110 transition-transform shadow-inner border border-yellow-500/20">
                  <Icon name="chess-queen" className="w-5 h-5 md:w-6 md:h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-base md:text-2xl font-black mb-1 md:mb-2 text-foreground">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-4xl font-black text-foreground">Rp 149K</span>
                  <span className="text-xs md:text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="relative z-10 space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 text-foreground">
                <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                  <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700]" /> <span className="line-clamp-1 font-semibold">4 devices</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-xs md:text-base">
                  <Icon name="check" className="w-4 h-4 md:w-5 md:h-5 text-[#FFD700]" /> <span className="line-clamp-1 font-semibold">4K & HDR</span>
                </li>
              </ul>
              <Link
                href="/membership"
                className="flex items-center justify-center relative z-10 w-full py-3 md:py-4 rounded-xl text-xs md:text-base font-black bg-foreground text-background hover:opacity-90 transition-all shadow-md"
              >
                Pre-order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

