"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { GENRES as INITIAL_GENRES } from "@/constants/video-data";
import { cn } from "@/lib/utils";

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-xl font-black text-neutral-900 uppercase italic">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-neutral-50 rounded-xl transition-colors">
            <Icon name="x" className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default function AdminGenresPage() {
  const [genres, setGenres] = useState(INITIAL_GENRES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<any>(null);
  const [genreName, setGenreName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGenres = useMemo(() => {
    return genres.filter(g => g.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [genres, searchQuery]);

  const handleOpenAdd = () => {
    setEditingGenre(null);
    setGenreName("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (genre: any) => {
    setEditingGenre(genre);
    setGenreName(genre.title);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genreName.trim()) return;

    if (editingGenre) {
      setGenres(genres.map(g => g.title === editingGenre.title ? { ...g, title: genreName } : g));
    } else {
      setGenres([...genres, { title: genreName, emoji: "🎬", color: "from-neutral-600/20" }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus genre "${title}"?`)) {
      setGenres(genres.filter(g => g.title !== title));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Kelola Genre</h1>
          <p className="text-neutral-500 text-sm font-medium">Tambah, edit, atau hapus kategori film untuk katalog Anda.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95 whitespace-nowrap"
        >
          <Icon name="user-plus" className="w-4 h-4" />
          <span className="uppercase tracking-widest text-xs font-black">Tambah Genre</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative max-w-md">
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input 
          type="text" 
          placeholder="Cari genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:border-brand shadow-sm transition-all"
        />
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Simple Add Card */}
        <button 
          onClick={handleOpenAdd}
          className="group border-2 border-dashed border-neutral-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-brand/40 hover:bg-brand/5 transition-all text-neutral-400 hover:text-brand"
        >
          <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Icon name="chevron-right" className="w-6 h-6 rotate-90" />
          </div>
          <span className="font-black uppercase tracking-widest text-[10px]">Add Category</span>
        </button>

        {filteredGenres.map((genre) => (
          <div 
            key={genre.title}
            className="group bg-white rounded-[2rem] border border-neutral-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden"
          >
            {/* Visual Accent */}
            <div className={cn("absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r", genre.color || "from-neutral-200")} />
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-neutral-900 group-hover:text-brand transition-colors uppercase">{genre.title}</h3>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    {(Math.random() * 50).toFixed(0)} Movies
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={() => handleOpenEdit(genre)}
                  className="flex-1 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(genre.title)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Hapus"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingGenre ? `Edit Genre: ${editingGenre.title}` : "Tambah Genre Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Nama Genre</label>
            <input 
              autoFocus
              type="text" 
              placeholder="Contoh: Thriller, Action, dll"
              value={genreName}
              onChange={(e) => setGenreName(e.target.value)}
              className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-bold"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3.5 bg-neutral-100 text-neutral-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3.5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
            >
              {editingGenre ? "Simpan Perubahan" : "Simpan Genre"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
