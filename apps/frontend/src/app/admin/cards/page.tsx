"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonAction } from "@/components/ui/ButtonAction";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

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

export default function AdminCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardData, setEditingCardData] = useState<any>(null); // This is the API response data if it exists
  const [position, setPosition] = useState<number>(1);
  const [subtitle, setSubtitle] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, catsRes] = await Promise.all([
        api.get("/home-cards/admin").catch(() => ({ data: [] })),
        api.get("/category").catch(() => ({ data: [] }))
      ]);
      setCards(cardsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtitle.trim() || categoryId === "") {
      alert("Semua field wajib diisi");
      return;
    }

    const selectedCategory = categories.find(c => c.id === Number(categoryId));
    const computedTitle = selectedCategory ? selectedCategory.name : "";

    try {
      if (editingCardData?.id) {
        // Update existing
        await api.put(`/home-cards/${editingCardData.id}`, { 
          title: computedTitle, 
          subtitle, 
          categoryId: Number(categoryId),
          is_active: isActive
        });
      } else {
        // Create new
        await api.post("/home-cards", { 
          position: Number(position),
          title: computedTitle, 
          subtitle, 
          categoryId: Number(categoryId),
          is_active: isActive
        });
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Gagal menyimpan card:", err);
      alert(err.response?.data?.message || "Gagal menyimpan card");
    }
  };

  const handleEdit = (pos: number) => {
    const existing = cards.find(c => c.position === pos);
    setPosition(pos);
    if (existing) {
      setEditingCardData(existing);
      setSubtitle(existing.subtitle);
      setCategoryId(existing.categoryId);
      setIsActive(existing.is_active);
    } else {
      setEditingCardData(null);
      setSubtitle("");
      setCategoryId("");
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const card1 = cards.find(c => c.position === 1);
  const card3 = cards.find(c => c.position === 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Kelola Home Card</h1>
          <p className="text-muted-foreground text-sm font-medium">Atur Card dinamis untuk posisi 1 dan 3 di beranda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Memuat data card...</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl">
            
            {/* Card 1 (Editable) */}
            <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center font-black text-2xl border border-brand/20">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">
                    {card1 ? card1.title : <span className="text-muted-foreground italic">Belum Diatur</span>}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {card1 ? card1.subtitle : "Klik Atur untuk mengkonfigurasi card ini."}
                  </p>
                  {card1 && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-lg border border-border">
                      <Icon name="folder" className="w-3.5 h-3.5 text-brand" />
                      <span className="text-xs font-bold">{card1.category?.name || "Kategori tidak ditemukan"}</span>
                      {!card1.is_active && (
                        <span className="ml-2 bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">Nonaktif</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEdit(1)}
                className="px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-xl font-bold transition-all border border-border shadow-sm text-sm"
              >
                {card1 ? "Edit" : "Atur"}
              </button>
            </div>

            {/* Card 2 (Fixed) */}
            <div className="bg-secondary/30 rounded-[2rem] border border-border/50 p-6 shadow-sm relative flex items-center justify-between opacity-80">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center font-black text-2xl border border-border">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-black text-muted-foreground">Segera Hadir</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Bagian ini tidak dapat diubah (fixed).
                  </p>
                </div>
              </div>
              <div className="px-6 py-3 bg-muted/50 text-muted-foreground rounded-xl font-bold border border-border/50 text-sm cursor-not-allowed">
                Terkunci
              </div>
            </div>

            {/* Card 3 (Editable) */}
            <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm relative flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center font-black text-2xl border border-brand/20">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">
                    {card3 ? card3.title : <span className="text-muted-foreground italic">Belum Diatur</span>}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {card3 ? card3.subtitle : "Klik Atur untuk mengkonfigurasi card ini."}
                  </p>
                  {card3 && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-lg border border-border">
                      <Icon name="folder" className="w-3.5 h-3.5 text-brand" />
                      <span className="text-xs font-bold">{card3.category?.name || "Kategori tidak ditemukan"}</span>
                      {!card3.is_active && (
                        <span className="ml-2 bg-red-500/20 text-red-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest">Nonaktif</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEdit(3)}
                className="px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-xl font-bold transition-all border border-border shadow-sm text-sm"
              >
                {card3 ? "Edit" : "Atur"}
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Modal CRUD */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={`Konfigurasi Card #${position}`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pilih Kategori (Sekaligus Menjadi Judul)</label>
            <select 
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-bold text-foreground appearance-none"
            >
              <option value="" disabled>Pilih kategori...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subtitle (Deskripsi Pendek)</label>
            <input 
              type="text" 
              placeholder="Contoh: Kumpulan film paling banyak ditonton"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-bold text-foreground"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl border border-border">
            <label className="text-sm font-bold text-foreground">Status Aktif</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
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
              Simpan Card
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
