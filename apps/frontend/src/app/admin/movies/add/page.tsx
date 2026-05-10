"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

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
    duration: "",
    release_year: "",
    video_id: "",
    trailer_url: "",
    poster_url: "",
    is_published: false,
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSaving(true);
    setError("");

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

      await api.post("/films", payload);
      alert("Film berhasil ditambahkan!");
      router.push("/admin/movies");
    } catch (err: any) {
      console.error("Gagal menyimpan film:", err);
      setError(err.response?.data?.message || "Gagal menyimpan film. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = formData.title.trim().length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Back Link */}
      <Link 
        href="/admin/movies" 
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors group px-2"
      >
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
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-pointer"
                    : "bg-white text-neutral-400 border-neutral-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                currentStep === step.id ? "bg-white/20" : step.id < currentStep ? "bg-emerald-200" : "bg-neutral-100"
              )}>
                {step.id < currentStep ? (
                  <span className="text-emerald-700 font-bold">✓</span>
                ) : (
                  <Icon name={step.icon as any} className="w-5 h-5" />
                )}
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 0{step.id}</p>
                <p className="text-sm font-bold">{step.name}</p>
              </div>
            </button>
          ))}
          
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mt-10">
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Film akan disimpan sebagai <strong>Draft</strong> kecuali kamu aktifkan &quot;Publish&quot; di step terakhir.
            </p>
          </div>
        </div>

        {/* Right: Form Content */}
        <div className="flex-1 bg-white rounded-[2rem] border border-neutral-200 p-8 shadow-sm h-fit">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 border-b border-neutral-100 pb-4 mb-8">
                <h2 className="text-2xl font-black text-neutral-900 uppercase italic">Informasi Film</h2>
                <p className="text-neutral-500 text-sm font-medium">Berikan judul dan rincian deskriptif untuk film ini.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase text-neutral-400">Judul Film *</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Bersandiwara di Balik Layar"
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
                  <label className="text-xs font-black uppercase text-neutral-400">Sinopsis / Deskripsi</label>
                  <textarea 
                    rows={4}
                    placeholder="Tuliskan jalan cerita film secara singkat tetapi menarik..."
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm resize-none"
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
              <div className="space-y-2 border-b border-neutral-100 pb-4 mb-8">
                <h2 className="text-2xl font-black text-neutral-900 uppercase italic">Aset & Video</h2>
                <p className="text-neutral-500 text-sm font-medium">Masukkan URL poster dari Bunny Storage dan Video ID dari Bunny Stream.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400">Poster URL (Bunny CDN)</label>
                  <input 
                    type="text" 
                    placeholder="https://sinea-cdn.b-cdn.net/posters/nama-poster.png"
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                    value={formData.poster_url}
                    onChange={(e) => updateField("poster_url", e.target.value)}
                  />
                  <p className="text-xs text-neutral-400">URL poster yang sudah diupload ke Bunny Storage</p>
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
                  <p className="text-xs text-neutral-400">Copy Video ID dari dashboard Bunny Stream</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400">Trailer Video ID (Bunny Stream)</label>
                  <input 
                    type="text" 
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-mono"
                    value={formData.trailer_url}
                    onChange={(e) => updateField("trailer_url", e.target.value)}
                  />
                  <p className="text-xs text-neutral-400">Copy Video ID trailer dari dashboard Bunny Stream</p>
                </div>

                {/* Preview */}
                {formData.poster_url && (
                  <div className="mt-6 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
                    <p className="text-xs font-black uppercase text-neutral-400 mb-3">Preview Poster</p>
                    <div className="w-32 h-48 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
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
              <div className="space-y-2 border-b border-neutral-100 pb-4 mb-8">
                <h2 className="text-2xl font-black text-neutral-900 uppercase italic">Review & Simpan</h2>
                <p className="text-neutral-500 text-sm font-medium">Periksa kembali data film sebelum menyimpan.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Judul", value: formData.title },
                    { label: "Sutradara", value: formData.director },
                    { label: "Produser", value: formData.producer },
                    { label: "Durasi", value: formData.duration ? `${formData.duration} menit` : "" },
                    { label: "Tahun Rilis", value: formData.release_year },
                    { label: "Video ID", value: formData.video_id },
                    { label: "Trailer ID", value: formData.trailer_url },
                  ].map(item => (
                    <div key={item.label} className="p-4 bg-neutral-50 rounded-xl">
                      <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{item.label}</p>
                      <p className="text-sm font-bold text-neutral-900 mt-1 truncate">{item.value || <span className="text-neutral-300">—</span>}</p>
                    </div>
                  ))}
                </div>

                {formData.description && (
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Sinopsis</p>
                    <p className="text-sm text-neutral-700 mt-1 leading-relaxed">{formData.description}</p>
                  </div>
                )}

                {formData.poster_url && (
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-3">Poster</p>
                    <div className="w-24 h-36 rounded-lg overflow-hidden border border-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.poster_url} alt="Poster" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {/* Publish Toggle */}
                <div className="p-6 bg-amber-50/50 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Langsung Publish?</p>
                    <p className="text-xs text-neutral-500 mt-1">Jika diaktifkan, film langsung tampil ke pengguna. Jika tidak, disimpan sebagai draft.</p>
                  </div>
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

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={currentStep === 1 || isSaving}
              className={cn(
                "px-8 py-3.5 rounded-2xl font-bold text-sm transition-all",
                currentStep === 1 || isSaving ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100 text-neutral-900"
              )}
            >
              Kembali
            </button>
            
            {currentStep < 3 ? (
              <button 
                onClick={nextStep}
                disabled={currentStep === 1 && !isStep1Valid}
                className={cn(
                  "px-10 py-3.5 bg-neutral-900 text-white rounded-2xl font-bold text-sm transition-all shadow-xl shadow-neutral-200",
                  currentStep === 1 && !isStep1Valid ? "opacity-30 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                )}
              >
                Selanjutnya
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSaving}
                className={cn(
                  "px-12 py-3.5 bg-brand text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand/20",
                  isSaving ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                )}
              >
                {isSaving ? "Menyimpan..." : "Simpan Film"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
