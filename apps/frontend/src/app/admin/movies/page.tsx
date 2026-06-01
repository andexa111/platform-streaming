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
  published_start?: string;
  published_end?: string;
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

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState<{ id: number; title: string } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Scheduling Modal States
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [movieToSchedule, setMovieToSchedule] = useState<Film | null>(null);
  const [publishedStart, setPublishedStart] = useState("");
  const [publishedEnd, setPublishedEnd] = useState("");
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

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

  const handleDeleteClick = (id: number, title: string) => {
    setMovieToDelete({ id, title });
    setDeleteConfirmText("");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    if (deleteConfirmText.toUpperCase() !== "HAPUS") return;

    try {
      setIsDeleting(true);
      await api.delete(`/films/${movieToDelete.id}`);
      setDeleteModalOpen(false);
      setMovieToDelete(null);
      setDeleteConfirmText("");
      fetchFilms();
    } catch (err) {
      console.error("Gagal menghapus film:", err);
      alert("Gagal menghapus film");
    } finally {
      setIsDeleting(false);
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

  const handleScheduleClick = (film: Film) => {
    setMovieToSchedule(film);
    const formatToDateString = (dateStr?: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setPublishedStart(formatToDateString(film.published_start));
    setPublishedEnd(formatToDateString(film.published_end));
    setScheduleModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!movieToSchedule) return;

    try {
      setIsSavingSchedule(true);
      
      await api.patch(`/films/${movieToSchedule.id}`, {
        published_start: publishedStart || null,
        published_end: publishedEnd || null,
      });
      setScheduleModalOpen(false);
      setMovieToSchedule(null);
      fetchFilms();
    } catch (err) {
      console.error("Gagal menyimpan jadwal:", err);
      alert("Gagal menyimpan jadwal tayang.");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const getStatusBadge = (film: Film) => {
    if (film.is_deleted) return { label: "Dihapus", dotColor: "bg-red-500", textColor: "text-red-700" };
    
    if (film.is_published) {
      const now = new Date();
      const start = film.published_start ? new Date(film.published_start) : null;
      const end = film.published_end ? new Date(film.published_end) : null;

      if (start && start > now) {
        return { label: "Terjadwal", dotColor: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]", textColor: "text-blue-500" };
      }
      if (end && end < now) {
        return { label: "Kedaluwarsa", dotColor: "bg-neutral-500 shadow-[0_0_8px_rgba(107,114,128,0.5)]", textColor: "text-neutral-500" };
      }
      return { label: "Published", dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", textColor: "text-emerald-500" };
    }
    
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
                            <p className="text-xs text-muted-foreground font-bold">
                              {formatDate(film.createdAt)}{film.director ? ` • ${film.director}` : ""}
                            </p>
                            {(film.published_start || film.published_end) && (
                              <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-1 bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/10 w-fit">
                                <Icon name="calendar" className="w-3 h-3" />
                                <span>
                                  Jadwal: {film.published_start ? formatDate(film.published_start) : "Sekarang"} s/d {film.published_end ? formatDate(film.published_end) : "Selamanya"}
                                </span>
                              </div>
                            )}
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleScheduleClick(film); }}
                            className="p-2.5 bg-amber-500 text-white hover:bg-amber-600 rounded-xl transition-all shadow-md shadow-amber-200/50 border-none flex items-center justify-center cursor-pointer active:scale-95"
                            title="Atur Jadwal Tayang"
                          >
                            <Icon name="calendar" className="w-4 h-4" />
                          </button>
                          <ButtonAction 
                            onView={() => handleTogglePublish(film.id, film.is_published)}
                            onEdit={() => router.push(`/admin/movies/edit/${film.id}`)}
                            onDelete={() => handleDeleteClick(film.id, film.title)}
                          />
                        </div>
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

      {/* Custom Deletion Modal with Premium Styling */}
      {deleteModalOpen && movieToDelete && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header with warning icon */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Icon name="warning" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-wide">Hapus Film</h3>
                <p className="text-xs text-muted-foreground font-semibold">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            {/* Warning Message Card */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/15 text-xs text-red-400 space-y-2 leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[10px]">Peringatan Kritis:</p>
                <p>
                  Film <strong className="text-white font-black">"{movieToDelete.title}"</strong> akan dihapus secara permanen dari database. Seluruh folder video HLS dan kunci dekripsi di Cloudflare R2 juga akan dibersihkan.
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Untuk melanjutkan penghapusan, silakan ketik kata kunci <strong className="text-foreground font-black">"HAPUS"</strong> di bawah ini:
              </p>
            </div>

            {/* Input Box */}
            <div className="space-y-2">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='Ketik "HAPUS" di sini...'
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 text-foreground placeholder:text-muted-foreground font-black transition-all text-center tracking-widest uppercase"
                disabled={isDeleting}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setMovieToDelete(null);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary hover:bg-neutral-800 transition-colors uppercase tracking-widest"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.toUpperCase() !== "HAPUS" || isDeleting}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-xs font-black text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2",
                  deleteConfirmText.toUpperCase() === "HAPUS" && !isDeleting
                    ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 active:scale-95 cursor-pointer"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                )}
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Permanen</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Scheduling Modal */}
      {scheduleModalOpen && movieToSchedule && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header with calendar icon */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <Icon name="calendar" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-foreground uppercase tracking-wide">Jadwal Tayang Film</h3>
                <p className="text-xs text-muted-foreground font-semibold">Atur masa publikasi otomatis film Anda.</p>
              </div>
            </div>

            {/* Info text */}
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Anda sedang menjadwalkan penayangan untuk film <strong className="text-foreground font-black">"{movieToSchedule.title}"</strong>. Jika dikosongkan, film akan langsung tayang tanpa batasan waktu (indefinite).
              </p>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mulai Tayang (Awal)</label>
                <input
                  type="date"
                  value={publishedStart}
                  onChange={(e) => setPublishedStart(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-brand text-foreground placeholder:text-muted-foreground font-medium transition-all"
                  disabled={isSavingSchedule}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Selesai Tayang (Akhir)</label>
                <input
                  type="date"
                  value={publishedEnd}
                  onChange={(e) => setPublishedEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-brand text-foreground placeholder:text-muted-foreground font-medium transition-all"
                  disabled={isSavingSchedule}
                />
              </div>

              {/* Clear button */}
              {(publishedStart || publishedEnd) && (
                <button
                  type="button"
                  onClick={() => {
                    setPublishedStart("");
                    setPublishedEnd("");
                  }}
                  className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="trash" className="w-3.5 h-3.5" />
                  <span>Kosongkan / Reset Jadwal</span>
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setScheduleModalOpen(false);
                  setMovieToSchedule(null);
                }}
                disabled={isSavingSchedule}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary hover:bg-neutral-800 transition-colors uppercase tracking-widest cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black text-white bg-brand hover:bg-brand-dark shadow-lg shadow-brand/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSavingSchedule ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Jadwal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
