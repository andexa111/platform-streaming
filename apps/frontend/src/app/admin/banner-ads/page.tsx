"use client";

import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/Switch";
import { StatusModal } from "@/components/ui/StatusModal";
import { api, getMediaUrl } from "@/lib/api";

interface BannerAd {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  createdAt: string;
}

export default function BannerAdsPage() {
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [modal, setModal] = useState<{ open: boolean; type: "success" | "error"; title: string; message: string }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/banner-ad");
      setBanners(res.data);
    } catch (err) {
      console.error("Gagal memuat banner ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setModal({
        open: true,
        type: "error",
        title: "Format Salah",
        message: "Berkas harus berupa file gambar.",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/image", formData);
      setImageUrl(res.data.url);
      setModal({
        open: true,
        type: "success",
        title: "Berhasil Upload",
        message: "Gambar banner berhasil diunggah.",
      });
    } catch (err) {
      console.error("Gagal upload gambar:", err);
      setModal({
        open: true,
        type: "error",
        title: "Gagal Upload",
        message: "Terjadi kesalahan saat mengunggah gambar banner.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      setModal({
        open: true,
        type: "error",
        title: "Form Tidak Lengkap",
        message: "Judul iklan dan Gambar wajib diisi/diunggah.",
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      image_url: imageUrl,
      link_url: linkUrl || undefined,
      is_active: isActive,
    };

    try {
      if (editingId) {
        await api.patch(`/banner-ad/${editingId}`, payload);
        setModal({
          open: true,
          type: "success",
          title: "Berhasil Diperbarui",
          message: "Banner iklan berhasil diperbarui.",
        });
      } else {
        await api.post("/banner-ad", payload);
        setModal({
          open: true,
          type: "success",
          title: "Berhasil Ditambahkan",
          message: "Banner iklan baru berhasil ditambahkan.",
        });
      }
      resetForm();
      fetchBanners();
    } catch (err) {
      console.error("Gagal menyimpan banner ad:", err);
      setModal({
        open: true,
        type: "error",
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan data banner iklan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner: BannerAd) => {
    setEditingId(banner.id);
    setTitle(banner.title);
    setImageUrl(banner.image_url);
    setLinkUrl(banner.link_url || "");
    setIsActive(banner.is_active);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner iklan ini?")) return;
    try {
      await api.delete(`/banner-ad/${id}`);
      setModal({
        open: true,
        type: "success",
        title: "Berhasil Dihapus",
        message: "Banner iklan berhasil dihapus.",
      });
      fetchBanners();
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("Gagal menghapus banner ad:", err);
      setModal({
        open: true,
        type: "error",
        title: "Gagal Menghapus",
        message: "Terjadi kesalahan saat menghapus banner iklan.",
      });
    }
  };

  const toggleBannerStatus = async (banner: BannerAd) => {
    try {
      const updatedStatus = !banner.is_active;
      await api.patch(`/banner-ad/${banner.id}`, { is_active: updatedStatus });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: updatedStatus } : b))
      );
    } catch (err) {
      console.error("Gagal mengubah status banner:", err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setImageUrl("");
    setLinkUrl("");
    setIsActive(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Kelola Banner Iklan</h1>
          <p className="text-muted-foreground text-sm font-bold">
            Tambahkan dan atur banner iklan lonjong dinamis yang tampil di antara baris film pada halaman utama.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 bg-card rounded-[2rem] border border-border p-6 md:p-8 shadow-sm h-fit">
          <h3 className="text-lg font-black text-foreground uppercase italic mb-6">
            {editingId ? "Edit Banner" : "Tambah Banner Baru"}
          </h3>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground">Judul Iklan</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masukkan judul banner..."
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-all text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground">Link URL Tujuan (Opsional)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com/promo..."
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-brand transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground">Gambar Banner</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2 transition-all"
                  disabled={uploading}
                >
                  <Icon name="download-cloud" className="w-4 h-4 text-brand" />
                  {uploading ? "Mengunggah..." : "Pilih File"}
                </button>
              </div>

              {imageUrl && (
                <div className="mt-4 border border-border rounded-2xl overflow-hidden aspect-[21/9] bg-muted relative group">
                  <img
                    src={getMediaUrl(imageUrl)}
                    alt="Preview Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-black/60 px-3 py-1.5 rounded-full border border-white/10">Preview Banner Lonjong</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-y border-border">
              <span className="text-xs font-black uppercase text-muted-foreground">Aktifkan Iklan</span>
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-brand hover:bg-brand/90 text-white text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-md"
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan Banner"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-border text-sm font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-black text-foreground uppercase italic mb-6">Daftar Banner Ads Aktif</h3>
          {banners.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
                <Icon name="ads" className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-bold text-sm">Belum ada banner iklan. Silakan buat yang pertama!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {banners.map((banner) => (
                <div key={banner.id} className="p-4 bg-secondary/30 border border-border rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between hover:border-brand/40 transition-all duration-300">
                  <div className="w-full md:w-48 aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-muted flex-shrink-0">
                    <img
                      src={getMediaUrl(banner.image_url)}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 w-full text-center md:text-left">
                    <h4 className="text-sm font-black text-foreground uppercase italic tracking-wider truncate">{banner.title}</h4>
                    {banner.link_url && (
                      <p className="text-[11px] text-brand hover:underline font-bold truncate">
                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                          {banner.link_url}
                        </a>
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground font-bold">
                      Dibuat: {new Date(banner.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                        {banner.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                      <Switch checked={banner.is_active} onChange={() => toggleBannerStatus(banner)} />
                    </div>
                    
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2.5 bg-card hover:bg-secondary border border-border rounded-xl text-foreground transition-all hover:scale-105"
                      title="Edit Banner"
                    >
                      <Icon name="edit" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2.5 bg-card hover:bg-red-500/10 border border-border hover:border-red-500/20 rounded-xl text-red-500 transition-all hover:scale-105"
                      title="Hapus Banner"
                    >
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StatusModal
        isOpen={modal.open}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
}
