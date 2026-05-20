"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
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
  genres: { id: number; title: string }[];
  actors: { id: number; name: string }[];
}

export default function EditMoviePage() {
  const params = useParams();
  const router = useRouter();
  const filmId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    producer: "",
    duration: "",
    release_year: "",
    video_id: "",
    trailer_url: "",
    production_house: "",
    production_house_logo: "",
    poster_url: "",
    is_published: false,
  });

  // Fetch film data
  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const res = await api.get(`/films/${filmId}`);
        const film: Film = res.data;
        setFormData({
          title: film.title || "",
          description: film.description || "",
          director: film.director || "",
          producer: film.producer || "",
          duration: film.duration?.toString() || "",
          release_year: film.release_year?.toString() || "",
          video_id: film.video_id || "",
          trailer_url: film.trailer_url || "",
          poster_url: film.poster_url || "",
          production_house: (film as any).production_house || "",
          production_house_logo: (film as any).production_house_logo || "",
          is_published: film.is_published,
        });
      } catch (err) {
        console.error("Gagal memuat data film:", err);
        setError("Film tidak ditemukan.");
      } finally {
        setLoading(false);
      }
    };
    fetchFilm();
  }, [filmId]);

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [uploadingTrailer, setUploadingTrailer] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (file: File, field: "poster_url" | "production_house_logo") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/poster", formData);
      updateField(field, res.data.url);
    } catch (err: any) {
      console.error(`Gagal upload ${field}:`, err);
      alert(err.response?.data?.message || `Gagal mengunggah gambar. Pastikan formatnya jpg/png/webp dan ukuran maks 5MB.`);
    }
  };

  const handleTrailerUpload = async (file: File) => {
    setUploadingTrailer(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/trailer", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        }
      });
      updateField("trailer_url", res.data.url);
    } catch (err: any) {
      console.error("Gagal upload trailer:", err);
      alert(err.response?.data?.message || "Gagal mengunggah trailer. Pastikan formatnya video (mp4/webm) dan ukuran maks 500MB.");
    } finally {
      setUploadingTrailer(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description || undefined,
        director: formData.director || undefined,
        producer: formData.producer || undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        release_year: formData.release_year ? parseInt(formData.release_year) : undefined,
        video_id: formData.video_id || undefined,
        trailer_url: formData.trailer_url || undefined,
        poster_url: formData.poster_url || undefined,
        is_published: formData.is_published,
      };

      await api.patch(`/films/${filmId}`, payload);
      setSuccess("Film berhasil diperbarui!");
      setTimeout(() => router.push("/admin/movies"), 1500);
    } catch (err: any) {
      console.error("Gagal menyimpan:", err);
      setError(err.response?.data?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <p className="text-red-500 font-bold">{error}</p>
        <Link href="/admin/movies" className="text-brand font-bold text-sm underline">Kembali ke Katalog</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Back Link */}
      <Link 
        href="/admin/movies" 
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group px-2"
      >
        <Icon name="chevron-right" className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Kembali Ke Katalog</span>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight uppercase italic">Edit Film</h1>
          <p className="text-neutral-500 text-sm font-medium">Perbarui metadata dan aset film.</p>
        </div>
        {/* Publish Toggle */}
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-bold uppercase", formData.is_published ? "text-emerald-600" : "text-amber-600")}>
            {formData.is_published ? "Published" : "Draft"}
          </span>
          <button
            onClick={() => updateField("is_published", !formData.is_published)}
            className={cn(
              "relative w-14 h-7 rounded-full transition-all",
              formData.is_published ? "bg-emerald-500" : "bg-neutral-300"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all",
              formData.is_published ? "left-7" : "left-0.5"
            )} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-neutral-200 p-8 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase">Informasi Film</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase text-neutral-400">Judul Film *</label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Sutradara</label>
              <input 
                type="text" 
                placeholder="Nama sutradara"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                value={formData.director}
                onChange={(e) => updateField("director", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Produser</label>
              <input 
                type="text" 
                placeholder="Nama produser"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                value={formData.producer}
                onChange={(e) => updateField("producer", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Durasi (menit)</label>
              <input 
                type="number" 
                placeholder="90"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                value={formData.duration}
                onChange={(e) => updateField("duration", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Tahun Rilis</label>
              <input 
                type="number" 
                placeholder="2026"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                value={formData.release_year}
                onChange={(e) => updateField("release_year", e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase text-neutral-400">Sinopsis</label>
              <textarea 
                rows={4}
                placeholder="Tuliskan sinopsis film..."
                className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm resize-none"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Rumah Produksi</label>
              <input 
                type="text" 
                placeholder="Contoh: Sinea Studios"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                value={formData.production_house}
                onChange={(e) => updateField("production_house", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Logo Rumah Produksi</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="w-full h-[54px] bg-neutral-50 border border-neutral-200 border-dashed rounded-2xl flex items-center px-5 gap-3 hover:border-brand transition-all">
                    <Icon name="image" className="w-5 h-5 text-neutral-400" />
                    <span className="text-sm text-neutral-400">
                      {formData.production_house_logo ? "Ganti Logo" : "Upload Logo"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, "production_house_logo");
                    }}
                  />
                </label>
                {formData.production_house_logo && (
                  <div className="w-[54px] h-[54px] rounded-2xl border border-neutral-200 bg-neutral-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={formData.production_house_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-b border-neutral-100 pb-4 pt-4">
            <h2 className="text-lg font-black text-neutral-900 uppercase">Aset & Video</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Poster Film</label>
              <label className="block cursor-pointer">
                <div className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 border-dashed rounded-2xl flex items-center gap-3 hover:border-brand transition-all">
                  <Icon name="image" className="w-5 h-5 text-neutral-400" />
                  <span className="text-sm text-neutral-400">
                    {formData.poster_url ? "Ganti Poster" : "Klik untuk upload poster..."}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "poster_url");
                  }}
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Video ID Film (Bunny Stream)</label>
              <input 
                type="text" 
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-mono"
                value={formData.video_id}
                onChange={(e) => updateField("video_id", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-neutral-400">Video Trailer Film (Local MP4/WebM)</label>
              <div className="flex flex-col gap-3">
                <label className="block cursor-pointer">
                  <div className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 border-dashed rounded-2xl flex flex-col gap-2 hover:border-brand transition-all">
                    <div className="flex items-center gap-3">
                      {uploadingTrailer ? (
                        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon name="film" className="w-5 h-5 text-neutral-400" />
                      )}
                      <span className="text-sm text-neutral-400">
                        {uploadingTrailer ? `Sedang mengunggah (${uploadProgress}%)...` : formData.trailer_url ? "Ganti Trailer Video" : "Klik untuk upload trailer..."}
                      </span>
                    </div>
                    {uploadingTrailer && (
                      <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-brand transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={uploadingTrailer}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleTrailerUpload(file);
                    }}
                  />
                </label>
                {formData.trailer_url && (
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-neutral-400 mb-2">Trailer Terunggah</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-600 font-mono break-all bg-white p-2 rounded border border-neutral-100">
                      <span className="truncate flex-1">{getMediaUrl(formData.trailer_url)}</span>
                    </div>
                    <video src={getMediaUrl(formData.trailer_url)} controls className="w-full max-h-48 rounded-lg mt-3 bg-black" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">{success}</div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
            <Link 
              href="/admin/movies" 
              className="px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-neutral-100 text-neutral-900 transition-all"
            >
              Batal
            </Link>
            <button 
              onClick={handleSubmit}
              disabled={saving || !formData.title}
              className={cn(
                "px-12 py-3.5 bg-brand text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand/20",
                saving || !formData.title ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              )}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          {/* Poster Preview */}
          <div className="bg-white rounded-[2rem] border border-neutral-200 p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-neutral-400 tracking-widest mb-4">Preview Poster</p>
            {formData.poster_url ? (
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getMediaUrl(formData.poster_url)} alt="Poster" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[2/3] w-full rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-200 flex items-center justify-center">
                <Icon name="image" className="w-10 h-10 text-neutral-300" />
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-[2rem] border border-neutral-200 p-6 shadow-sm space-y-3">
            <p className="text-xs font-black uppercase text-neutral-400 tracking-widest">Info</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Film ID</span>
                <span className="font-bold text-neutral-900">#{filmId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Video</span>
                <span className={cn("font-bold", formData.video_id ? "text-emerald-600" : "text-red-400")}>
                  {formData.video_id ? "✓ Ada" : "✗ Belum"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Trailer</span>
                <span className={cn("font-bold", formData.trailer_url ? "text-emerald-600" : "text-red-400")}>
                  {formData.trailer_url ? "✓ Ada" : "✗ Belum"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Poster</span>
                <span className={cn("font-bold", formData.poster_url ? "text-emerald-600" : "text-red-400")}>
                  {formData.poster_url ? "✓ Ada" : "✗ Belum"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
