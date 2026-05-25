"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { api, getMediaUrl } from "@/lib/api";
import axios from "axios";
import { useRouter } from "next/navigation";
import { GENRES } from "@/constants/video-data";

const STEPS = [
  { id: 1, name: "Informasi Dasar", icon: "film" },
  { id: 2, name: "Aset & Video", icon: "image" },
  { id: 3, name: "Review & Simpan", icon: "monitor-play" },
];

export default function AddMoviePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    producer: "",
    genre: "",
    release_year: "",
    video_id: "",
    trailer_url: "",
    poster_url: "",
    production_house: "",
    production_house_logo: "",
    is_published: false,
    actors: [] as string[],
  });

  const [actorInput, setActorInput] = useState("");
  const [genresList, setGenresList] = useState<{ id: number; name: string }[]>([]);

  React.useEffect(() => {
    api.get("/genre").then((res) => setGenresList(res.data)).catch(console.error);
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddActor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newActor = actorInput.trim();
      if (newActor && !formData.actors.includes(newActor)) {
        updateField("actors", [...formData.actors, newActor]);
      }
      setActorInput("");
    }
  };

  const handleRemoveActor = (actorToRemove: string) => {
    updateField("actors", formData.actors.filter(a => a !== actorToRemove));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const [uploadingTrailer, setUploadingTrailer] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const handleImageUpload = async (file: File, field: "poster_url" | "production_house_logo") => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/poster", formData);
      updateField(field, res.data.url);
    } catch (err: any) {
      console.error(`Gagal upload ${field}:`, err);
      alert(err.response?.data?.message || `Gagal mengunggah gambar. Pastikan formatnya jpg/png/webp dan ukuran maks 100MB.`);
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
      alert(err.response?.data?.message || "Gagal mengunggah trailer. Pastikan formatnya video (mp4/webm) dan ukuran maks 5GB.");
    } finally {
      setUploadingTrailer(false);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description || undefined,
        director: formData.director || undefined,
        producer: formData.producer || undefined,
        actorNames: formData.actors.length > 0 ? formData.actors : undefined,
        genreIds: formData.genre ? [parseInt(formData.genre)] : undefined,
        release_year: formData.release_year ? parseInt(formData.release_year) : undefined,
        video_id: formData.video_id || undefined,
        trailer_url: formData.trailer_url || undefined,
        poster_url: formData.poster_url || undefined,
        production_house: formData.production_house || undefined,
        production_house_logo: formData.production_house_logo || undefined,
        is_published: formData.is_published,
      };

      const res = await api.post("/films", payload);
      const newFilm = res.data;

      // Unggah video jika dipilih
      if (selectedVideoFile) {
        setUploadingVideo(true);
        setVideoUploadProgress(0);

        // 1. Dapatkan presigned URL dari backend
        const presignedRes = await api.get(`/films/${newFilm.id}/presigned-upload`, {
          params: { contentType: selectedVideoFile.type }
        });
        const { upload_url } = presignedRes.data;

        // 2. Upload file langsung ke Cloudflare R2 via presigned URL (menggunakan axios mentah agar tidak memicu auth interceptor default)
        await axios.put(upload_url, selectedVideoFile, {
          headers: {
            "Content-Type": selectedVideoFile.type,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setVideoUploadProgress(percentCompleted);
            }
          }
        });

        // 3. Memicu backend untuk mendownload dan memproses HLS di background
        await api.post(`/films/${newFilm.id}/process-uploaded-video`);
      }

      alert("Film berhasil ditambahkan!");
      router.push("/admin/movies");
    } catch (err: any) {
      console.error("Gagal menyimpan film:", err);
      setError(err.response?.data?.message || "Gagal menyimpan film atau mengunggah video. Coba lagi.");
    } finally {
      setIsSaving(false);
      setUploadingVideo(false);
    }
  };

  const isStep1Valid = formData.title.trim().length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Back Link */}
      <Link href="/admin/movies" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group px-2">
        <Icon name="chevron-right" className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Kembali Ke Katalog</span>
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Stepper Indicator */}
        <div className="lg:w-72 space-y-2">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all border text-left",
                currentStep === step.id
                  ? "bg-brand text-white border-brand shadow-lg shadow-brand/20"
                  : step.id < currentStep
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-pointer"
                    : "bg-card text-foreground border-border",
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", currentStep === step.id ? "bg-white/20" : step.id < currentStep ? "bg-emerald-500/20" : "bg-secondary")}>
                {step.id < currentStep ? <span className="text-emerald-500 font-bold">✓</span> : <Icon name={step.icon as any} className="w-5 h-5" />}
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 0{step.id}</p>
                <p className="text-sm font-bold">{step.name}</p>
              </div>
            </button>
          ))}

          <div className="p-6 bg-brand/5 rounded-2xl border border-brand/20 mt-10">
            <p className="text-xs text-brand leading-relaxed font-medium">
              Film akan disimpan sebagai <strong>Draft</strong> kecuali kamu aktifkan &quot;Publish&quot; di step terakhir.
            </p>
          </div>
        </div>

        {/* Right: Form Content */}
        <div className="flex-1 bg-card rounded-[2rem] border border-border p-8 shadow-sm h-fit">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 border-b border-border pb-4 mb-8">
                <h2 className="text-2xl font-black text-foreground uppercase italic">Informasi Film</h2>
                <p className="text-muted-foreground text-sm font-medium">Berikan judul dan rincian deskriptif untuk film ini.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase text-foreground">Judul Film *</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bersandiwara di Balik Layar"
                    className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Sutradara</label>
                  <input
                    type="text"
                    placeholder="Nama sutradara"
                    className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                    value={formData.director}
                    onChange={(e) => updateField("director", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Produser</label>
                  <input
                    type="text"
                    placeholder="Nama produser"
                    className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                    value={formData.producer}
                    onChange={(e) => updateField("producer", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase text-foreground">Aktor</label>
                  <div className="p-3 bg-secondary border border-border rounded-2xl focus-within:border-brand transition-all">
                    {formData.actors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.actors.map((actor) => (
                          <span key={actor} className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-bold">
                            {actor}
                            <button type="button" onClick={() => handleRemoveActor(actor)} className="hover:text-red-400 ml-1 transition-colors">
                              <Icon name="x" className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder={formData.actors.length === 0 ? "Ketik nama aktor lalu tekan Enter..." : "Tambah aktor lain..."}
                      className="w-full bg-transparent focus:outline-none text-sm px-2 py-1.5 text-foreground placeholder:text-muted-foreground"
                      value={actorInput}
                      onChange={(e) => setActorInput(e.target.value)}
                      onKeyDown={handleAddActor}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Genre</label>
                  <div className="relative">
                    <select
                      className={cn(
                        "w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm appearance-none pr-12 text-foreground",
                        !formData.genre ? "opacity-50" : "opacity-100",
                      )}
                      value={formData.genre}
                      onChange={(e) => updateField("genre", e.target.value)}
                    >
                      <option value="" disabled>
                        Pilih Genre
                      </option>
                      {genresList.map((g) => (
                        <option key={g.id} value={g.id.toString()} className="bg-card text-foreground">
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground">
                      <Icon name="chevron-down" className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Tahun Rilis</label>
                  <input
                    type="number"
                    placeholder="2026"
                    className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                    value={formData.release_year}
                    onChange={(e) => updateField("release_year", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Rumah Produksi</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sinea Studios"
                    className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                    value={formData.production_house}
                    onChange={(e) => updateField("production_house", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Logo Rumah Produksi</label>
                  <div className="flex gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="relative group">
                        <div className="w-full h-[54px] bg-secondary border border-border rounded-2xl flex items-center px-5 gap-3 group-hover:border-brand transition-all border-dashed">
                          <Icon name="image" className="w-5 h-5 text-muted-foreground group-hover:text-brand transition-colors" />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground">
                            {formData.production_house_logo ? "Ganti Logo" : "Klik untuk upload logo (maks. 100MB)..."}
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
                      </div>
                    </label>
                    {formData.production_house_logo && (
                      <div className="w-[54px] h-[54px] rounded-2xl border border-border bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img src={formData.production_house_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase text-foreground">Sinopsis / Deskripsi</label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan jalan cerita film secara singkat tetapi menarik..."
                    className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assets & Video */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 border-b border-border pb-4 mb-8">
                <h2 className="text-2xl font-black text-foreground uppercase italic">Aset & Video</h2>
                <p className="text-muted-foreground text-sm font-medium">Masukkan URL poster dari Bunny Storage dan Video ID dari Bunny Stream.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Poster Film</label>
                  <label className="block cursor-pointer">
                    <div className="w-full px-5 py-3.5 bg-secondary border border-border border-dashed rounded-2xl flex items-center gap-3 hover:border-brand transition-all">
                      <Icon name="image" className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground">Upload poster film (rekomendasi portrait 2:3) · <span className="font-semibold">Maks. 100MB</span></p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Video Utama Film (Local MP4)</label>
                  <div className="flex flex-col gap-3">
                    <label className="block cursor-pointer">
                      <div className="w-full px-5 py-3.5 bg-secondary border border-border border-dashed rounded-2xl flex flex-col gap-2 hover:border-brand transition-all">
                        <div className="flex items-center gap-3">
                          {uploadingVideo ? (
                            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Icon name="film" className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {uploadingVideo
                              ? `Sedang mengunggah video utama (${videoUploadProgress}%)...`
                              : selectedVideoFile
                              ? `File terpilih: ${selectedVideoFile.name}`
                              : "Klik untuk memilih video utama (.mp4)..."}
                          </span>
                        </div>
                        {uploadingVideo && (
                          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-brand transition-all duration-300" style={{ width: `${videoUploadProgress}%` }} />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="video/mp4"
                        className="hidden"
                        disabled={uploadingVideo}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setSelectedVideoFile(file);
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">Pilih file MP4 terkompresi. Sistem akan melakukan segmentasi HLS secara otomatis di VPS.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-foreground">Video Trailer Film (Local MP4/WebM)</label>
                  <div className="flex flex-col gap-3">
                    <label className="block cursor-pointer">
                      <div className="w-full px-5 py-3.5 bg-secondary border border-border border-dashed rounded-2xl flex flex-col gap-2 hover:border-brand transition-all">
                        <div className="flex items-center gap-3">
                          {uploadingTrailer ? (
                            <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Icon name="film" className="w-5 h-5 text-muted-foreground" />
                          )}
                          <span className="text-sm text-muted-foreground">
                            {uploadingTrailer ? `Sedang mengunggah (${uploadProgress}%)...` : formData.trailer_url ? "Ganti Trailer Video" : "Klik untuk upload trailer (maks. 5GB)..."}
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
                      <div className="p-4 bg-secondary border border-border rounded-2xl">
                        <p className="text-[10px] font-black uppercase text-foreground mb-2">Trailer Terunggah</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono break-all bg-card p-2 rounded border border-border">
                          <span className="truncate flex-1">{getMediaUrl(formData.trailer_url)}</span>
                        </div>
                        <video src={getMediaUrl(formData.trailer_url)} controls className="w-full max-h-48 rounded-lg mt-3 bg-black" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {formData.poster_url && (
                  <div className="mt-6 p-4 bg-secondary rounded-2xl border border-border">
                    <p className="text-xs font-black uppercase text-foreground mb-3">Preview Poster</p>
                    <div className="w-32 h-48 rounded-xl overflow-hidden border border-border shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.poster_url} alt="Poster preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 border-b border-border pb-4 mb-8">
                <h2 className="text-2xl font-black text-foreground uppercase italic">Review & Simpan</h2>
                <p className="text-muted-foreground text-sm font-medium">Periksa kembali data film sebelum menyimpan.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Judul", value: formData.title },
                      { label: "Rumah Produksi", value: formData.production_house },
                      { label: "Sutradara", value: formData.director },
                      { label: "Produser", value: formData.producer },
                      { label: "Aktor", value: formData.actors.length > 0 ? formData.actors.join(", ") : "" },
                      { label: "Genre", value: genresList.find(g => g.id.toString() === formData.genre)?.name || formData.genre },
                      { label: "Tahun Rilis", value: formData.release_year },
                      { label: "Video Utama", value: selectedVideoFile ? selectedVideoFile.name : formData.video_id },
                      { label: "Trailer ID", value: formData.trailer_url },
                    ].map((item) => (
                       <div key={item.label} className="p-4 bg-secondary rounded-xl border border-border">
                        <p className="text-[10px] font-black uppercase text-foreground tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-foreground mt-1 truncate">{item.value || <span className="text-muted-foreground">—</span>}</p>
                      </div>
                    ))}
                </div>

                 {formData.description && (
                  <div className="p-4 bg-secondary rounded-xl border border-border">
                    <p className="text-[10px] font-black uppercase text-foreground tracking-widest">Sinopsis</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{formData.description}</p>
                  </div>
                )}

                 {formData.poster_url && (
                  <div className="p-4 bg-secondary rounded-xl border border-border">
                    <p className="text-[10px] font-black uppercase text-foreground tracking-widest mb-3">Poster</p>
                    <div className="w-24 h-36 rounded-lg overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getMediaUrl(formData.poster_url)} alt="Poster" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Publish Toggle */}
                <div className="p-6 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="warning" className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground uppercase tracking-tight">Langsung Publish ke Publik?</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Jika diaktifkan, film akan langsung dapat diakses oleh semua pengguna. 
                        Pastikan metadata dan aset sudah benar.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => updateField("is_published", !formData.is_published)} className={cn("relative w-14 h-7 rounded-full transition-all flex-shrink-0", formData.is_published ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-muted")}>
                    <div className={cn("absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all", formData.is_published ? "left-7" : "left-0.5")} />
                  </button>
                </div>

                {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
           <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || isSaving || uploadingVideo}
              className={cn("px-8 py-3.5 rounded-2xl font-bold text-sm transition-all", currentStep === 1 || isSaving || uploadingVideo ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary text-foreground")}
            >
              Kembali
            </button>

            {currentStep < 3 ? (
               <button
                onClick={nextStep}
                disabled={currentStep === 1 && !isStep1Valid}
                className={cn(
                  "px-10 py-3.5 bg-foreground text-background rounded-2xl font-bold text-sm transition-all shadow-xl shadow-background/10",
                  currentStep === 1 && !isStep1Valid ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95",
                )}
              >
                Selanjutnya
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSaving || uploadingVideo}
                className={cn("px-12 py-3.5 bg-brand text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand/20", isSaving || uploadingVideo ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95")}
              >
                {uploadingVideo ? `Mengunggah Video (${videoUploadProgress}%)` : isSaving ? "Menyimpan..." : "Simpan Film"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
