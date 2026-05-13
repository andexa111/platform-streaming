"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { ALL_MOVIES } from "@/constants/video-data";
import { cn } from "@/lib/utils";

// --- Components ---

// 1. Sparkline (Mini Line Chart) using SVG
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 100;
  const height = 30;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} className="animate-in fade-in duration-1000" />
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
        <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded", trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>{trend === "up" ? "↑" : "↓"} 12%</span>
        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{sub}</span>
      </div>
    </div>
  </div>
);

// --- Main Page ---

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMovieId, setSelectedMovieId] = useState<string | number>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");

  const selectedMovie = useMemo(() => {
    return ALL_MOVIES.find((m) => String(m.id) === String(selectedMovieId));
  }, [selectedMovieId]);

  // Filtered dropdown list based on search input
  const dropdownMovies = useMemo(() => {
    return ALL_MOVIES.filter((m) => m.title.toLowerCase().includes(filterSearch.toLowerCase()));
  }, [filterSearch]);

  // Simulated Metrics based on selection
  const metrics = useMemo(() => {
    const isFiltered = selectedMovieId !== "All";
    const baseMult = isFiltered ? 1 : 10; // Scaling down for single movie vs platform total

    return [
      {
        title: isFiltered ? "Movie Views" : "Total Views",
        value: isFiltered ? "1.2K" : "142.8K",
        sub: "VS Last Month",
        trend: "up",
        data: isFiltered ? [2, 5, 3, 8, 5, 12, 10] : [10, 20, 15, 30, 25, 45, 40],
        icon: "eye",
        colorClass: "bg-brand/10 text-brand",
      },
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
              <span className="flex-1 text-left truncate">{selectedMovieId === "All" ? "Semua Film (Global)" : selectedMovie?.title}</span>
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
                      className={cn("w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors", selectedMovieId === "All" ? "bg-brand/10 text-brand" : "text-neutral-600 hover:bg-neutral-50")}
                    >
                      Semua Film (Global)
                    </button>
                    <div className="h-px bg-neutral-50 mx-2 my-1" />
                    {dropdownMovies.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMovieId(m.id);
                          setIsFilterOpen(false);
                        }}
                        className={cn("w-full text-left px-3 py-2 rounded-lg text-xs transition-colors truncate", selectedMovieId === m.id ? "bg-brand/10 text-brand font-bold" : "text-neutral-600 hover:bg-neutral-50")}
                        title={m.title}
                      >
                        {m.title}
                      </button>
                    ))}
                    {dropdownMovies.length === 0 && <p className="p-3 text-[10px] text-neutral-400 text-center italic">Tidak ada hasil</p>}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Custom Date Range Filter */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-neutral-200 shadow-sm px-3 py-1.5">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black uppercase text-neutral-400">Dari</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[11px] font-bold text-neutral-900 focus:outline-none focus:text-brand" />
            </div>
            <div className="w-px h-3 bg-neutral-200 mx-1" />
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-black uppercase text-neutral-400">Sampai</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[11px] font-bold text-neutral-900 focus:outline-none focus:text-brand" />
            </div>
            <Icon name="calendar" className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* Main Analysis Section */}
      {/* Top 10 Leaderboard Section */}
      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-neutral-900 uppercase italic tracking-tight">Top 10 Film Terpopuler</h2>
            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Peringkat berdasarkan jumlah akumulasi penayangan.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-[10px] font-black uppercase tracking-widest">Live Ranking</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center w-20">Rank</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Film Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Genre</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Avg. Duration</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Total Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sortedMovies.slice(0, 10).map((movie, i) => (
                <tr key={movie.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-8 py-6 text-center">
                    <span
                      className={cn(
                        "inline-flex w-8 h-8 rounded-xl items-center justify-center text-xs font-black italic",
                        i === 0 ? "bg-brand text-white shadow-lg shadow-brand/20 scale-110" : i === 1 ? "bg-neutral-800 text-white shadow-md" : i === 2 ? "bg-neutral-400 text-white shadow-sm" : "bg-neutral-100 text-neutral-400",
                      )}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-black text-neutral-900 group-hover:text-brand transition-colors">{movie.title}</p>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">{movie.productionHouse}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-[9px] font-black uppercase text-neutral-600 tracking-widest">{movie.genre}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[11px] font-bold text-neutral-500 italic">24:15m</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="space-y-0.5">
                      <p className="text-lg font-black text-brand italic tracking-tight">{(12.5 - i * 0.8).toFixed(1)}K</p>
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <p className="text-[8px] font-black text-emerald-600 uppercase">+12%</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 bg-neutral-50/30 border-t border-neutral-100 text-center">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-brand transition-colors">Generate Detailed PDF Report ↓</button>
        </div>
      </div>
    </div>
  );
}
