import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

const MOVIES = [
  { id: 1, title: "The Midnight Journey", genre: "Action", rating: "4.8", quality: "4K" },
  { id: 2, title: "Cyber Genesis", genre: "Sci-Fi", rating: "4.9", quality: "HDR" },
  { id: 3, title: "The Silent Forest", genre: "Horror", rating: "4.5", quality: "HD+" },
  { id: 4, title: "Stellar Waves", genre: "Documentary", rating: "4.7", quality: "4K" },
];

const GENRES = [
  { title: "Action & Thriller", emoji: "🔥", color: "from-red-600/20" },
  { title: "Comedy", emoji: "😂", color: "from-amber-500/20" },
  { title: "Sci-Fi & Fantasy", emoji: "👽", color: "from-indigo-600/20" },
  { title: "Horror", emoji: "👻", color: "from-zinc-800/20" },
  { title: "Romance", emoji: "❤️", color: "from-pink-600/20" },
  { title: "Documentary", emoji: "🌍", color: "from-brand/20" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-brand/30">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950 to-neutral-950 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-medium">
            <Icon name="sparkles" className="w-4 h-4 text-brand animate-bounce" />
            <span className="text-neutral-300">Something exciting is brewing</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">Next Gen</span>
            <span className="block pb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-500 to-cyan-500">Streaming</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
            Get ready for an unparalleled cinematic experience. Thousands of premium movies, exclusive shows, and breathtaking originals are coming soon to Lalakon.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(2,77,148,0.3)]">
              <Icon name="play" className="w-5 h-5 fill-current" /> Notify Me When Live
            </button>
            <button className="w-full sm:w-auto bg-neutral-900/50 hover:bg-neutral-800 backdrop-blur-md border border-neutral-800 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95">
              Explore Catalog Early
            </button>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="py-24 px-6 bg-neutral-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Now Showing</h2>
              <p className="text-neutral-400 text-lg">Exclusive preview of what's waiting for you on the platform.</p>
            </div>
            <Link href="/login" className="text-brand font-bold hover:text-blue-400 transition-colors flex items-center gap-2">
              View All Content <Icon name="arrow-right" className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOVIES.map((movie) => (
              <div key={movie.id} className="group relative aspect-[2/3] rounded-3xl overflow-hidden bg-neutral-900 border border-white/5 hover:border-brand/50 transition-all duration-500 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute top-4 right-4 bg-brand/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-lg tracking-widest">{movie.quality}</div>
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <span className="text-brand text-xs font-bold uppercase tracking-widest">{movie.genre}</span>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand transition-colors">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Icon name="star" className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{movie.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-24 px-6 bg-neutral-950 relative border-t border-white/5 overflow-hidden">
        <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                <Icon name="compass" className="w-10 h-10 text-brand" />
                Our Genres
              </h2>
              <p className="text-neutral-400 text-lg">Dive into a universe of stories curated just for you.</p>
            </div>
            <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-blue-400 transition-colors bg-brand/10 hover:bg-brand/20 px-4 py-2 rounded-full">
              Explore Library <Icon name="chevron-right" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {GENRES.map((genre, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] md:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-neutral-900/50 border border-neutral-800/50 flex flex-col justify-end p-5 transition-all duration-500 hover:scale-105 hover:border-brand/40"
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${genre.color} to-transparent opacity-80 group-hover:from-brand/40 transition-all duration-500`} />
                <div className="relative z-20 space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-3xl filter drop-shadow-md">{genre.emoji}</span>
                  <h3 className="text-lg font-bold leading-tight text-white/90 group-hover:text-white transition-colors">{genre.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-neutral-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { icon: "monitor-play", title: "Ultra HD", desc: "Experience theater-quality visuals with 4K resolution." },
            { icon: "download-cloud", title: "Offline Mode", desc: "Download favorites to watch anywhere, anytime." },
            { icon: "repeat", title: "Sync", desc: "Switch devices seamlessly without losing your spot." },
          ].map((feat, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-neutral-900 border border-white/5 hover:border-brand transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Icon name={feat.icon as any} className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-neutral-950 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Choose Your Adventure</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Flexible plans tailored for every type of viewer. Join early to lock in these prices forever.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="group relative p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50 hover:border-brand/50 transition-all duration-500 hover:-translate-y-2 flex flex-col backdrop-blur-sm">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-6 mr-auto group-hover:scale-110 transition-transform">
                  <Icon name="monitor" className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Rp 49K</span>
                  <span className="text-neutral-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-neutral-400">
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-neutral-600" /> Watch on 1 device</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-neutral-600" /> Standard definition (720p)</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-neutral-600" /> Limited ad-breaks</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors">Pre-order Basic</button>
            </div>

            {/* Standard Plan */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-neutral-900/80 to-neutral-900/40 border border-brand/30 transform hover:-translate-y-2 transition-all duration-500 flex flex-col shadow-[0_0_40px_rgba(2,77,148,0.1)] hover:shadow-[0_0_60px_rgba(2,77,148,0.2)] backdrop-blur-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">Most Popular</div>
              <div className="mb-8 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-6 mr-auto group-hover:scale-110 transition-transform">
                  <Icon name="ticket" className="w-6 h-6 text-brand" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Rp 99K</span>
                  <span className="text-neutral-400">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-brand" /> Watch on 2 devices simultaneously</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-brand" /> Full HD (1080p) streaming</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-brand" /> Zero ad interruptions</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-brand" /> Download for offline viewing</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-bold bg-brand hover:bg-brand-dark text-white transition-colors shadow-lg shadow-blue-500/20">Pre-order Standard</button>
            </div>

            {/* Premium Plan */}
            <div className="group relative p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50 hover:border-brand/50 transition-all duration-500 hover:-translate-y-2 flex flex-col backdrop-blur-sm">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-6 mr-auto group-hover:scale-110 transition-transform">
                  <Icon name="crown" className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Rp 149K</span>
                  <span className="text-neutral-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-neutral-400">
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Watch on 4 devices simultaneously</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Ultra HD (4K) & Dolby Vision HDR</li>
                <li className="flex items-center gap-3"><Icon name="check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Zero ad interruptions</li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors group-hover:text-amber-400">Pre-order Premium</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
