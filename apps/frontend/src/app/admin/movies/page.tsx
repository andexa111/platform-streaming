"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ButtonAction } from "@/components/ui/ButtonAction";
import { cn } from "@/lib/utils";
import { api, getMediaUrl } from "@/lib/api";

interface Film {
  id: number;
  title: string;
  description?: string;
  producer?: string;
  director?: string;
  duration?: number;
  release_year?: number;
  poster_url?: string;
  trailer_url?: string;
  video_id?: string;
  is_published: boolean;
  is_deleted: boolean;
  scheduled_at?: string;
  createdAt: string;
  updatedAt: string;
  genres: { id: number; name: string; slug: string }[];
  actors: { id: number; name: string }[];
}

// Sub-component for Statistics Cards
const StatsCard = ({ title, value, subValue, icon, color }: { title: string; value: string; subValue: string; icon: string; color: string }) => (
  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-foreground">{value}</h3>
        <p className="text-xs text-muted-foreground font-medium">{subValue}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        <Icon name={icon as any} className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function AdminMoviesPage() {
  const router = useRouter();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMovies, setSelectedMovies] = useState<number[]>([]);

  // Fetch films from API
  useEffect(() => {
    fetchFilms();
  }, []);

  const fetchFilms = async () => {
    try {
      setLoading(true);
      const res = await api.get("/films/admin/all", { params: { limit: 100 } });
      setFilms(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data film:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredMovies = useMemo(() => {
    return films.filter((film) => {
      const matchesSearch = film.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "published" && film.is_published && !film.is_deleted) ||
        (selectedStatus === "draft" && !film.is_published && !film.is_deleted) ||
        (selectedStatus === "deleted" && film.is_deleted);
      return matchesSearch && matchesStatus;
    });
  }, [films, searchQuery, selectedStatus]);

  // Stats
  const totalFilms = films.length;
  const publishedFilms = films.filter(f => f.is_published && !f.is_deleted).length;
  const draftFilms = films.filter(f => !f.is_published && !f.is_deleted).length;
  const deletedFilms = films.filter(f => f.is_deleted).length;

  const toggleSelectAll = () => {
    if (selectedMovies.length === filteredMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map((m) => m.id));
    }
  };

  const toggleSelectMovie = (id: number) => {
    if (selectedMovies.includes(id)) {
      setSelectedMovies(selectedMovies.filter((mId) => mId !== id));
    } else {
      setSelectedMovies([...selectedMovies, id]);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus film "${title}"?`)) return;
    try {
      await api.delete(`/films/${id}`);
      fetchFilms();
    } catch (err) {
      console.error("Gagal menghapus film:", err);
      alert("Gagal menghapus film");
    }
  };

  const handleTogglePublish = async (id: number, currentlyPublished: boolean) => {
    try {
      await api.patch(`/films/${id}`, { is_published: !currentlyPublished });
      fetchFilms();
    } catch (err) {
      console.error("Gagal mengubah status:", err);
      alert("Gagal mengubah status film");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusBadge = (film: Film) => {
    if (film.is_deleted) return { label: "Dihapus", dotColor: "bg-red-500", textColor: "text-red-700" };
    if (film.is_published) return { label: "Published", dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", textColor: "text-neutral-700" };
    return { label: "Draft", dotColor: "bg-amber-500", textColor: "text-amber-700" };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Katalog Film</h1>
          <p className="text-muted-foreground text-sm font-bold">Kelola konten visual, metadata, dan status publikasi film Anda.</p>
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
          title="Total Film" 
          value={totalFilms.toString()} 
          subValue={`${draftFilms} draft, ${publishedFilms} published`} 
          icon="film" 
          color="bg-brand/10 text-brand" 
        />
        <StatsCard 
          title="Published" 
          value={publishedFilms.toString()} 
          subValue="Tayang ke pengguna" 
          icon="play" 
          color="bg-emerald-500/10 text-emerald-500" 
        />
        <StatsCard 
          title="Draft" 
          value={draftFilms.toString()} 
          subValue="Belum dipublikasikan" 
          icon="sparkles" 
          color="bg-amber-500/10 text-amber-500" 
        />
        <StatsCard 
          title="Dihapus" 
          value={deletedFilms.toString()} 
          subValue="Soft deleted" 
          icon="download-cloud" 
          color="bg-red-500/10 text-red-500" 
        />
      </div>

      {/* Toolbar & Table Section */}
      <div className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 md:p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Cari judul film..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {/* Filter Status */}
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-medium focus:outline-none focus:border-brand hidden sm:block text-foreground"
            >
              <option value="all">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="deleted">Dihapus</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedMovies.length > 0 && (
              <div className="flex items-center gap-2 mr-2 animate-in slide-in-from-right-4">
                <span className="text-xs font-bold text-muted-foreground">{selectedMovies.length} terpilih</span>
              </div>
            )}
            <button 
              onClick={fetchFilms}
              className="flex items-center gap-2 px-4 py-2.5 text-muted-foreground hover:bg-secondary rounded-xl transition-all font-bold text-sm"
            >
              <Icon name="download-cloud" className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-10 h-10 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
              <p className="text-muted-foreground text-sm">Memuat data film...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand text-white">
                  <th className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedMovies.length === filteredMovies.length && filteredMovies.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-neutral-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                    />
                  </th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Film</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Genre</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Video</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMovies.map((film) => {
                  const status = getStatusBadge(film);
                  return (
                    <tr key={film.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedMovies.includes(film.id)}
                          onChange={() => toggleSelectMovie(film.id)}
                          className="w-4 h-4 rounded border-neutral-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {/* Mini Thumbnail */}
                          <div className="w-10 h-14 rounded-md bg-neutral-200 overflow-hidden relative shadow-sm group-hover:shadow-md transition-all flex-shrink-0">
                            {film.poster_url ? (
                              <Image src={getMediaUrl(film.poster_url)} alt={film.title} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                                <Icon name="image" className="w-4 h-4 text-neutral-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground group-hover:text-brand transition-colors">{film.title}</p>
                            <p className="text-xs text-muted-foreground font-bold">{formatDate(film.createdAt)}{film.director ? ` • ${film.director}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {film.genres.length > 0 ? film.genres.map(g => (
                            <span key={g.id} className="text-[10px] font-black uppercase text-muted-foreground tracking-widest whitespace-nowrap">
                              {g.name}
                            </span>
                          )) : (
                            <span className="text-xs text-neutral-300">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {film.video_id ? (
                          <span className="text-xs font-bold text-emerald-600">✓ Ada</span>
                        ) : (
                          <span className="text-xs font-bold text-red-400">✗ Belum</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", status.dotColor)} />
                          <span className={cn("text-xs font-bold", film.is_published && !film.is_deleted ? "text-foreground" : status.textColor)}>{status.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ButtonAction 
                          onView={() => handleTogglePublish(film.id, film.is_published)}
                          onEdit={() => router.push(`/admin/movies/edit/${film.id}`)}
                          onDelete={() => handleDelete(film.id, film.title)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          
          {!loading && filteredMovies.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                <Icon name="search-x" className="w-10 h-10 text-neutral-300" />
              </div>
              <div className="space-y-1">
                <p className="text-foreground font-bold">Film tidak ditemukan</p>
                <p className="text-muted-foreground text-xs">Belum ada film atau coba kata kunci lain.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Menampilkan <span className="font-bold text-foreground">{filteredMovies.length}</span> dari <span className="font-bold text-foreground">{films.length}</span> film</p>
        </div>
      </div>
    </div>
  );
}
