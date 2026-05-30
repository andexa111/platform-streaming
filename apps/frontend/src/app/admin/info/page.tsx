"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";
import Link from "next/link";

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card rounded-[2rem] w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 border border-border">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-black text-foreground uppercase italic">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <Icon name="x" className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

export default function AdminInfoPage() {
  const [genres, setGenres] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Search & Filter
  const [genreSearch, setGenreSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"genre" | "category">("genre");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemName, setItemName] = useState("");

  // Show Movies State
  const [showMoviesModal, setShowMoviesModal] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [relatedMovies, setRelatedMovies] = useState<{ id: number; title: string }[]>([]);

  const handleShowMovies = async (type: "genre" | "category", item: any) => {
    setSelectedItemName(item.name);
    setRelatedMovies([]);
    setLoadingMovies(true);
    setShowMoviesModal(true);

    const endpoint = type === "genre" ? "/genre" : "/category";
    try {
      const res = await api.get(`${endpoint}/${item.id}`);
      setRelatedMovies(res.data?.films || []);
    } catch (err) {
      console.error("Gagal memuat film:", err);
      alert("Gagal memuat daftar film");
    } finally {
      setLoadingMovies(false);
    }
  };

  const fetchGenres = async () => {
    try {
      setLoadingGenres(true);
      const res = await api.get("/genre");
      setGenres(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data genre:", err);
    } finally {
      setLoadingGenres(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await api.get("/category");
      setCategories(res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data kategori:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchGenres();
    fetchCategories();
  }, []);

  const filteredGenres = useMemo(() => {
    return genres.filter((g) => g.name.toLowerCase().includes(genreSearch.toLowerCase()));
  }, [genres, genreSearch]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  // Handle Submit (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const slug = itemName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");

    const endpoint = modalType === "genre" ? "/genre" : "/category";

    try {
      if (editingItem) {
        await api.patch(`${endpoint}/${editingItem.id}`, { name: itemName, slug });
      } else {
        await api.post(endpoint, { name: itemName, slug });
      }

      if (modalType === "genre") fetchGenres();
      else fetchCategories();

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(`Gagal menyimpan ${modalType}:`, err);
      alert(err.response?.data?.message || `Gagal menyimpan ${modalType}`);
    }
  };

  // Open Modal Helpers
  const handleOpenAdd = (type: "genre" | "category") => {
    setModalType(type);
    setEditingItem(null);
    setItemName("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: "genre" | "category", item: any) => {
    setModalType(type);
    setEditingItem(item);
    setItemName(item.name);
    setIsModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (type: "genre" | "category", item: any) => {
    const term = type === "genre" ? "genre" : "kategori";
    if (confirm(`Apakah Anda yakin ingin menghapus ${term} "${item.name}"?`)) {
      const endpoint = type === "genre" ? "/genre" : "/category";
      try {
        await api.delete(`${endpoint}/${item.id}`);
        if (type === "genre") fetchGenres();
        else fetchCategories();
      } catch (err: any) {
        console.error(`Gagal menghapus ${term}:`, err);
        alert(err.response?.data?.message || `Gagal menghapus ${term}`);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Kelola Informasi</h1>
        <p className="text-muted-foreground text-sm font-medium">Manajemen Referensi Genre Film dan Kategori Tag.</p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Genre Section (LEFT) */}
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Icon name="tag" className="w-5 h-5 text-brand" />
              </div>
              <h2 className="text-xl font-black text-foreground uppercase italic tracking-tight">Daftar Genre</h2>
            </div>
            <button
              onClick={() => handleOpenAdd("genre")}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-dark transition-all active:scale-95"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              Tambah Genre
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari genre..."
              value={genreSearch}
              onChange={(e) => setGenreSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 scrollbar-thin">
            {loadingGenres ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
              </div>
            ) : filteredGenres.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest font-black">
                Tidak ada genre ditemukan
              </div>
            ) : (
              filteredGenres.map((genre) => (
                <div
                  key={genre.id}
                  className="flex items-center justify-between p-4 bg-secondary/35 rounded-2xl border border-border/50 hover:bg-secondary/70 transition-all group"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground group-hover:text-brand transition-all text-sm uppercase">
                      {genre.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-mono">
                      /{genre.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleShowMovies("genre", genre)}
                      className="p-2 hover:bg-brand/10 hover:text-brand rounded-lg text-muted-foreground transition-colors"
                      title="Tampilkan Film"
                    >
                      <Icon name="eye" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit("genre", genre)}
                      className="p-2 hover:bg-brand/10 hover:text-brand rounded-lg text-muted-foreground transition-colors"
                      title="Edit Genre"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete("genre", genre)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground transition-colors"
                      title="Hapus Genre"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Section (RIGHT) */}
        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                <Icon name="compass" className="w-5 h-5 text-brand" />
              </div>
              <h2 className="text-xl font-black text-foreground uppercase italic tracking-tight">Daftar Kategori</h2>
            </div>
            <button
              onClick={() => handleOpenAdd("category")}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-brand-dark transition-all active:scale-95"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              Tambah Kategori
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 scrollbar-thin">
            {loadingCategories ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest font-black">
                Tidak ada kategori ditemukan
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-4 bg-secondary/35 rounded-2xl border border-border/50 hover:bg-secondary/70 transition-all group"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground group-hover:text-brand transition-all text-sm uppercase">
                      {cat.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground font-mono">
                      /{cat.slug}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleShowMovies("category", cat)}
                      className="p-2 hover:bg-brand/10 hover:text-brand rounded-lg text-muted-foreground transition-colors"
                      title="Tampilkan Film"
                    >
                      <Icon name="eye" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit("category", cat)}
                      className="p-2 hover:bg-brand/10 hover:text-brand rounded-lg text-muted-foreground transition-colors"
                      title="Edit Kategori"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete("category", cat)}
                      className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground transition-colors"
                      title="Hapus Kategori"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modal CRUD */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? `Edit ${modalType === "genre" ? "Genre" : "Kategori"}: ${editingItem.name}`
            : `Tambah ${modalType === "genre" ? "Genre" : "Kategori"} Baru`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Nama {modalType === "genre" ? "Genre" : "Kategori"}
            </label>
            <input
              autoFocus
              type="text"
              placeholder={modalType === "genre" ? "Contoh: Action, Comedy" : "Contoh: Populer, Rekomendasi"}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-bold text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-4 bg-secondary text-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all border border-border"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all"
            >
              {editingItem ? "Simpan Perubahan" : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Show Movies */}
      <Modal
        isOpen={showMoviesModal}
        onClose={() => setShowMoviesModal(false)}
        title={`Film Terkait: ${selectedItemName}`}
      >
        <div className="space-y-4">
          {loadingMovies ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
              <p className="text-xs text-muted-foreground mt-2">Memuat daftar film...</p>
            </div>
          ) : relatedMovies.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs uppercase tracking-widest font-black">
              Tidak ada film dalam genre/kategori ini
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {relatedMovies.map((film, index) => (
                <div
                  key={film.id}
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border/50 text-sm font-bold text-foreground"
                >
                  <span className="text-xs text-muted-foreground font-mono">{index + 1}.</span>
                  <span className="flex-1">{film.title}</span>
                  <Link
                    href={`/movies/${film.id}`}
                    target="_blank"
                    className="p-1.5 hover:bg-brand/10 text-brand rounded-lg transition-colors"
                    title="Lihat Detail Film"
                  >
                    <Icon name="arrow-right" className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              onClick={() => setShowMoviesModal(false)}
              className="px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-border"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
