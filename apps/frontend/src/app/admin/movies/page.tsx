"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { ALL_MOVIES, GENRES as GENRE_LIST } from "@/constants/video-data";
import { cn } from "@/lib/utils";

// Sub-component for Statistics Cards
const StatsCard = ({ title, value, subValue, icon, color }: { title: string; value: string; subValue: string; icon: string; color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-neutral-900">{value}</h3>
        <p className="text-xs text-neutral-400 font-medium">{subValue}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        <Icon name={icon as any} className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function AdminMoviesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedMovies, setSelectedMovies] = useState<(number | string)[]>([]);

  // Filter logic
  const filteredMovies = useMemo(() => {
    return ALL_MOVIES.filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === "All" || movie.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  const toggleSelectAll = () => {
    if (selectedMovies.length === filteredMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map((m) => m.id));
    }
  };

  const toggleSelectMovie = (id: number | string) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter((mId) => mId !== id));
    } else {
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Katalog Film</h1>
          <p className="text-neutral-500 text-sm font-medium">Kelola konten visual, metadata, dan status publikasi film Anda.</p>
        </div>
        <Link 
          href="/admin/movies/add"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 whitespace-nowrap"
        >
          <Icon name="user-plus" className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs font-black">Tambah Film Baru</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Movies" 
          value={ALL_MOVIES.length.toString()} 
          subValue="+2 added this week" 
          icon="film" 
          color="bg-brand/10 text-brand" 
        />
        <StatsCard 
          title="Active Now" 
          value="12" 
          subValue="Streaming in 4K" 
          icon="play" 
          color="bg-emerald-50 text-emerald-600" 
        />
        <StatsCard 
          title="Total Views" 
          value="24.8K" 
          subValue="+12% from last month" 
          icon="sparkles" 
          color="bg-purple-50 text-purple-600" 
        />
        <StatsCard 
          title="Storage Used" 
          value="1.2 TB" 
          subValue="85% of total quota" 
          icon="download-cloud" 
          color="bg-amber-50 text-amber-600" 
        />
      </div>

      {/* Toolbar & Table Section */}
      <div className="bg-white rounded-[2rem] border border-neutral-200 overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-neutral-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Cari judul film..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-brand transition-all"
              />
            </div>
            {/* Filter Genre */}
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand hidden sm:block"
            >
              <option value="All">Semua Genre</option>
              {GENRE_LIST.map(g => (
                <option key={g.title} value={g.title}>{g.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedMovies.length > 0 && (
              <div className="flex items-center gap-2 mr-2 animate-in slide-in-from-right-4">
                <span className="text-xs font-bold text-neutral-500">{selectedMovies.length} terpilih</span>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Masal">
                  <Icon name="x" className="w-5 h-5" />
                </button>
              </div>
            )}
            <button className="flex items-center gap-2 px-4 py-2.5 text-neutral-600 hover:bg-neutral-50 rounded-xl transition-all font-bold text-sm">
              <Icon name="download-cloud" className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-neutral-50/50 border-b border-neutral-100">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedMovies.length === filteredMovies.length && filteredMovies.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-neutral-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Movie info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Genre</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Quality</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Ratings</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-neutral-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedMovies.includes(movie.id)}
                      onChange={() => toggleSelectMovie(movie.id)}
                      className="w-4 h-4 rounded border-neutral-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Mini Thumbnail */}
                      <div className="w-10 h-14 rounded-md bg-neutral-200 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all">
                        {movie.thumbnail ? (
                          <Image src={movie.thumbnail} alt={movie.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                            <Icon name="image" className="w-4 h-4 text-neutral-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900 group-hover:text-brand transition-colors">{movie.title}</p>
                        <p className="text-xs text-neutral-400">Added on Oct 12, 2024</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-neutral-100 text-[10px] font-bold text-neutral-600 uppercase tracking-tighter">
                      {movie.genre}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-xs font-bold",
                      movie.quality === "4K" ? "text-brand" : "text-neutral-500"
                    )}>
                      {movie.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Icon name="star" className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-neutral-700">{movie.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      <span className="text-xs font-bold text-neutral-700">Published</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-neutral-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-all" title="Edit">
                        <Icon name="settings" className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Icon name="x" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMovies.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                <Icon name="search-x" className="w-10 h-10 text-neutral-300" />
              </div>
              <div className="space-y-1">
                <p className="text-neutral-900 font-bold">Film tidak ditemukan</p>
                <p className="text-neutral-400 text-xs">Coba gunakan kata kunci pencarian yang berbeda.</p>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-6 border-t border-neutral-100 flex items-center justify-between">
          <p className="text-xs text-neutral-500">Menampilkan <span className="font-bold text-neutral-900">{filteredMovies.length}</span> dari <span className="font-bold text-neutral-900">{ALL_MOVIES.length}</span> film</p>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 border border-neutral-200 rounded-lg text-neutral-300 cursor-not-allowed">
              <Icon name="chevron-right" className="w-4 h-4 rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand text-white font-bold text-xs ring-4 ring-brand/10 shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-50 text-neutral-500 font-bold text-xs transition-colors">2</button>
            <button className="p-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors shadow-sm">
              <Icon name="chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
