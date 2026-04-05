import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-rose-500/30">
  

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/20 via-neutral-950 to-neutral-950 -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 pointer-events-none delay-1000 animate-pulse duration-1000"></div>

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm font-medium">
            <Icon name="Sparkles" className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span className="text-neutral-300">Something exciting is brewing</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">Next Gen</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500">Streaming</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-light">
            Get ready for an unparalleled cinematic experience. Thousands of premium movies, exclusive shows, and breathtaking originals are coming soon to Lalakon.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Icon name="Play" className="w-5 h-5 fill-current" /> Notify Me When Live
            </button>
            <button className="w-full sm:w-auto bg-neutral-900/50 hover:bg-neutral-800 backdrop-blur-md border border-neutral-800 text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 active:scale-95">
              Explore Catalog Early
            </button>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-24 px-6 bg-neutral-950 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Choose Your Adventure</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Flexible plans tailored for every type of viewer. Join early to lock in these prices forever.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="group relative p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-500 hover:-translate-y-2 flex flex-col backdrop-blur-sm">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-6 mr-auto group-hover:scale-110 transition-transform">
                  <Icon name="Monitor" className="w-6 h-6 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Rp 49K</span>
                  <span className="text-neutral-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-neutral-400">
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600" /> Watch on 1 device
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600" /> Standard definition (720p)
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600" /> Limited ad-breaks
                </li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors">Pre-order Basic</button>
            </div>

            {/* Standard Plan */}
            <div className="group relative p-8 rounded-3xl bg-gradient-to-b from-neutral-900/80 to-neutral-900/40 border border-emerald-500/30 transform hover:-translate-y-2 transition-all duration-500 flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.1)] hover:shadow-[0_0_60px_rgba(16,185,129,0.2)] backdrop-blur-sm">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-neutral-950 px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">Most Popular</div>
              <div className="mb-8 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 mr-auto group-hover:scale-110 transition-transform">
                  <Icon name="Ticket" className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Standard</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Rp 99K</span>
                  <span className="text-neutral-400">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-neutral-300">
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-emerald-500" /> Watch on 2 devices simultaneously
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-emerald-500" /> Full HD (1080p) streaming
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-emerald-500" /> Zero ad interruptions
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-emerald-500" /> Download for offline viewing
                </li>
              </ul>
              <button className="w-full py-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 transition-colors shadow-lg shadow-emerald-500/20">Pre-order Standard</button>
            </div>

            {/* Premium Plan */}
            <div className="group relative p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-500 hover:-translate-y-2 flex flex-col backdrop-blur-sm">
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 flex items-center justify-center mb-6 mr-auto group-hover:scale-110 transition-transform">
                  <Icon name="Crown" className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">Rp 149K</span>
                  <span className="text-neutral-500">/mo</span>
                </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 text-neutral-400">
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Watch on 4 devices simultaneously
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Ultra HD (4K) &amp; Dolby Vision HDR
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Zero ad interruptions
                </li>
                <li className="flex items-center gap-3">
                  <Icon name="Check" className="w-5 h-5 text-neutral-600 group-hover:text-amber-500/80 transition-colors" /> Spatial Audio support
                </li>
              </ul>
              <button className="w-full py-4 rounded-xl font-semibold bg-neutral-800 hover:bg-neutral-700 transition-colors group-hover:text-amber-400">Pre-order Premium</button>
            </div>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="py-32 px-6 bg-neutral-950 relative overflow-hidden">
        <div className="absolute -left-1/4 top-0 w-[500px] h-[500px] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-5xl font-bold flex items-center gap-4 tracking-tight">
                <Icon name="Compass" className="w-10 h-10 text-emerald-400" />
                Our Genres
              </h2>
              <p className="text-neutral-400 text-lg">Dive into a universe of stories curated just for you.</p>
            </div>
            <Link href="/genres" className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 hover:bg-emerald-400/20 px-4 py-2 rounded-full">
              Explore Library <Icon name="ChevronRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Action & Thriller", color: "from-red-600/60", hoverColor: "group-hover:from-red-500/80", emoji: "🔥" },
              { title: "Comedy", color: "from-amber-500/60", hoverColor: "group-hover:from-amber-400/80", emoji: "😂" },
              { title: "Sci-Fi & Fantasy", color: "from-indigo-600/60", hoverColor: "group-hover:from-indigo-500/80", emoji: "👽" },
              { title: "Horror", color: "from-zinc-800/80", hoverColor: "group-hover:from-zinc-700/90", emoji: "👻" },
              { title: "Romance", color: "from-pink-600/60", hoverColor: "group-hover:from-pink-500/80", emoji: "❤️" },
              { title: "Documentary", color: "from-teal-600/60", hoverColor: "group-hover:from-teal-500/80", emoji: "🌍" },
            ].map((genre, i) => (
              <div
                key={i}
                className="group relative aspect-[3/4] md:aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer bg-neutral-900/50 border border-neutral-800/50 flex flex-col justify-end p-5 transition-all duration-500 hover:scale-105 hover:border-neutral-700"
              >
                <div className={`absolute inset-0 bg-gradient-to-t ${genre.color} to-transparent opacity-80 ${genre.hoverColor} transition-all duration-500`}></div>

                <div className="relative z-20 space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-3xl filter drop-shadow-md">{genre.emoji}</span>
                  <h3 className="text-lg font-bold leading-tight text-white/90 group-hover:text-white transition-colors">{genre.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
