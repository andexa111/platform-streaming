"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { ALL_MOVIES } from "@/constants/video-data";
import { cn } from "@/lib/utils";

// --- Components ---

// 1. Sparkline (Mini Line Chart) using SVG
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="animate-in fade-in duration-1000"
      />
    </svg>
  );
};

// 2. Metric Card
const MetricCard = ({ title, value, sub, trend, data, colorClass, icon }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm group hover:shadow-md transition-all">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">{title}</p>
        <h3 className="text-3xl font-black text-neutral-900 tracking-tight">{value}</h3>
      </div>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", colorClass)}>
        <Icon name={icon} className="w-5 h-5" />
      </div>
    </div>
    <div className="space-y-3">
      <Sparkline data={data} color={trend === "up" ? "#10b981" : "#f59e0b"} />
      <div className="flex items-center gap-2">
        <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded", trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
          {trend === "up" ? "↑" : "↓"} 12%
        </span>
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{sub}</span>
      </div>
    </div>
  </div>
);

// --- Main Page ---

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [selectedMovieId, setSelectedMovieId] = useState<string | number>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  const selectedMovie = useMemo(() => {
    return ALL_MOVIES.find(m => String(m.id) === String(selectedMovieId));
  }, [selectedMovieId]);

  // Filtered dropdown list based on search input
  const dropdownMovies = useMemo(() => {
    return ALL_MOVIES.filter(m => 
      m.title.toLowerCase().includes(filterSearch.toLowerCase())
    );
  }, [filterSearch]);

  // Simulated Metrics based on selection
  const metrics = useMemo(() => {
    const isFiltered = selectedMovieId !== "All";
    const baseMult = isFiltered ? 1 : 10; // Scaling down for single movie vs platform total
    
    return [
      { title: isFiltered ? "Movie Views" : "Total Views", value: isFiltered ? "1.2K" : "142.8K", sub: "VS Last Month", trend: "up", data: isFiltered ? [2, 5, 3, 8, 5, 12, 10] : [10, 20, 15, 30, 25, 45, 40], icon: "eye", colorClass: "bg-blue-50 text-blue-600" },
      { title: isFiltered ? "Voters" : "Unique Viewers", value: isFiltered ? "840" : "48.2K", sub: "Individual visitors", trend: "up", data: isFiltered ? [1, 3, 2, 5, 4, 8, 7] : [5, 12, 8, 20, 18, 30, 28], icon: "user", colorClass: "bg-purple-50 text-purple-600" },
      { title: "Avg. Completion", value: isFiltered ? `${selectedMovie?.rating ? Number(selectedMovie.rating) * 18 : 75}%` : "72.4%", sub: "Audience retention", trend: "down", data: [80, 75, 78, 70, 72, 68, 72], icon: "monitor-play", colorClass: "bg-emerald-50 text-emerald-600" },
      { title: isFiltered ? "Total Hours" : "Watch Time", value: isFiltered ? "210h" : "12.5K", sub: "Total Hours", trend: "up", data: [2, 5, 4, 8, 7, 12, 10], icon: "play", colorClass: "bg-amber-50 text-amber-600" },
    ];
  }, [selectedMovieId, selectedMovie]);

  // Sorting movies for leaderboard (mocking completion rate)
  const sortedMovies = useMemo(() => [...ALL_MOVIES].sort((a, b) => Number(b.id) - Number(a.id)), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Statistik Performa</h1>
          <p className="text-neutral-500 text-sm font-medium">Monitor performa konten dan perilaku audiens untuk acuan penjurian.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Movie Filter (Searchable Combobox) */}
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-3 pl-3 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand shadow-sm transition-all hover:bg-neutral-50 min-w-[180px]"
            >
              <Icon name="film" className="w-3.5 h-3.5 text-neutral-400" />
              <span className="flex-1 text-left truncate">
                {selectedMovieId === "All" ? "Semua Film (Global)" : selectedMovie?.title}
              </span>
              <Icon name="chevron-down" className={cn("w-3 h-3 text-neutral-400 transition-transform", isFilterOpen ? "rotate-180" : "")} />
            </button>

            {isFilterOpen && (
              <>
                {/* Backdrop to close */}
                <div className="fixed inset-0 z-[60]" onClick={() => setIsFilterOpen(false)} />
                
                {/* Dropdown Content */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-neutral-100 rounded-2xl shadow-2xl z-[70] p-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
                  {/* Search Input */}
                  <div className="relative mb-2">
                    <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                    <input 
                      autoFocus
                      type="text"
                      placeholder="Cari judul..."
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-100 rounded-lg text-[11px] focus:outline-none focus:border-brand"
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                    <button 
                      onClick={() => {
                        setSelectedMovieId("All");
                        setIsFilterOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                        selectedMovieId === "All" ? "bg-brand/10 text-brand" : "text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      Semua Film (Global)
                    </button>
                    <div className="h-px bg-neutral-50 mx-2 my-1" />
                    {dropdownMovies.map(m => (
                      <button 
                        key={m.id}
                        onClick={() => {
                          setSelectedMovieId(m.id);
                          setIsFilterOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate",
                          selectedMovieId === m.id ? "bg-brand/10 text-brand font-bold" : "text-neutral-600 hover:bg-neutral-50"
                        )}
                        title={m.title}
                      >
                        {m.title}
                      </button>
                    ))}
                    {dropdownMovies.length === 0 && (
                      <p className="p-3 text-[10px] text-neutral-400 text-center italic">Tidak ada hasil</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200">
            {["7d", "30d", "90d"].map(r => (
              <button 
                key={r}
                onClick={() => setSelectedRange(r)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-widest",
                  selectedRange === r ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Retention Analysis (Left) */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-neutral-200 p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900 uppercase italic">
                {selectedMovieId === "All" ? "Global Retention" : `Retention: ${selectedMovie?.title}`}
              </h2>
              <p className="text-[10px] font-black uppercase text-neutral-400">Monitoring di menit mana audiens berhenti menonton.</p>
            </div>
            <button className="p-2 hover:bg-neutral-50 rounded-xl transition-colors">
              <Icon name="download-cloud" className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Retention Chart (Custom SVG Area Chart) */}
          <div className="relative h-64 w-full">
            <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#024d94" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#024d94" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map(y => (
                <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#f5f5f5" strokeWidth="1" />
              ))}
              {/* Area */}
              <path
                d="M 0,200 L 0,20 L 100,30 L 200,60 L 300,50 L 400,90 L 500,85 L 600,120 L 700,110 L 800,140 L 900,135 L 1000,160 L 1000,200 Z"
                fill="url(#gradient-area)"
              />
              {/* Line */}
              <path
                d="M 0,20 L 100,30 L 200,60 L 300,50 L 400,90 L 500,85 L 600,120 L 700,110 L 800,140 L 900,135 L 1000,160"
                fill="none"
                stroke="#024d94"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Legend Overlay */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest pt-4">
              <span>Start</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>End (Credits)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Satisfied</p>
              <p className="text-xl font-black text-emerald-900">84%</p>
              <p className="text-[10px] text-emerald-600 font-bold italic">Watch {">"} 75%</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Dropped</p>
              <p className="text-xl font-black text-amber-900">12%</p>
              <p className="text-[10px] text-amber-600 font-bold italic">Stop {"<"} 25%</p>
            </div>
          </div>
        </div>

        {/* Judging Leaderboard (Right) */}
        <div className="bg-white rounded-[2rem] border border-neutral-200 p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-neutral-900 uppercase italic">Judge's Top Tier</h2>
            <p className="text-xs text-neutral-400 font-medium">Peringkat film berdasarkan kriteria penjurian.</p>
          </div>

          <div className="space-y-4">
            {sortedMovies.slice(0, 5).map((movie, i) => (
              <div key={movie.id} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                    i === 0 ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-neutral-100 text-neutral-400"
                  )}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-neutral-900 line-clamp-1">{movie.title}</p>
                    <div className="flex items-center gap-1.5 opacity-60">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[9px] font-black uppercase text-neutral-500">{movie.genre}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-brand italic">{(90 - (i * 4.5)).toFixed(1)}%</p>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Completion</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-3 bg-neutral-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            Lihat Laporan Lengkap
          </button>
        </div>
      </div>

      {/* Comparison View (Bottom) */}
      <div className="bg-neutral-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <div className="w-12 h-12 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center">
              <Icon name="compass" className="w-6 h-6 text-brand" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Siap Mengevaluasi Film?</h2>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              Gunakan mode perbandingan untuk melihat statistik dua film secara berdampingan. Memudahkan juri dalam menentukan kualitas narasi dan visual.
            </p>
          </div>
          <button className="px-10 py-4 bg-brand hover:bg-brand-dark rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-brand/40 transition-all hover:scale-105 active:scale-95">
            Buka Mode Perbandingan
          </button>
        </div>
      </div>
    </div>
  );
}
