"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GENRES as GENRE_LIST } from "@/constants/video-data";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Informasi Dasar", icon: "film" },
  { id: 2, name: "Aset Visual", icon: "image" },
  { id: 3, name: "Konten Video", icon: "monitor-play" },
];

export default function AddMoviePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    quality: "4K",
    rating: "4.5",
    description: "",
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const simulateUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          alert("Film Berhasil Ditambahkan!");
          window.location.href = "/admin/movies";
        }, 1000);
      }
      setUploadProgress(progress);
    }, 400);
  };

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
            <div 
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all border",
                currentStep === step.id 
                  ? "bg-brand text-white border-brand shadow-lg shadow-brand/20" 
                  : "bg-white text-neutral-400 border-neutral-200"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                currentStep === step.id ? "bg-white/20" : "bg-neutral-100"
              )}>
                <Icon name={step.icon as any} className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Step 0{step.id}</p>
                <p className="text-sm font-bold">{step.name}</p>
              </div>
            </div>
          ))}
          
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 mt-10">
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Pastikan metadata telah sesuai dengan pedoman konten LALAKON sebelum mempublikasikan.
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
                  <label className="text-xs font-black uppercase text-neutral-400">Judul Film</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Interstellar"
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400">Genre</label>
                  <select 
                    className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-medium"
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  >
                    <option value="">Pilih Genre</option>
                    {GENRE_LIST.map(g => <option key={g.title} value={g.title}>{g.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-neutral-400">Kualitas</label>
                  <div className="flex gap-4">
                    {["4K", "HDR", "HD+"].map(q => (
                      <button 
                        key={q}
                        onClick={() => setFormData({...formData, quality: q})}
                        className={cn(
                          "flex-1 py-3.5 rounded-2xl border font-bold text-xs transition-all",
                          formData.quality === q ? "bg-neutral-900 border-neutral-900 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-500"
                        )}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase text-neutral-400">Sinopsis / Deskripsi</label>
                  <textarea 
                    rows={4}
                    placeholder="Tuliskan jalan cerita film secara singkat tetapi menarik..."
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-brand transition-all text-sm resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assets */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 border-b border-neutral-100 pb-4">
                <h2 className="text-2xl font-black text-neutral-900 uppercase italic">Aset Visual</h2>
                <p className="text-neutral-500 text-sm font-medium">Upload poster dan backdrop untuk tampilan di katalog.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Poster Upload Area */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-neutral-400 tracking-widest">Main Poster (2:3)</label>
                  <div className="aspect-[2/3] w-full rounded-[2.5rem] border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-center p-6 group hover:border-brand/40 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Icon name="image" className="w-8 h-8 text-neutral-300" />
                    </div>
                    <p className="text-sm font-bold text-neutral-900">Drop Poster Here</p>
                    <p className="text-xs text-neutral-500 mt-1">Recommended: 1200 x 1800 px</p>
                  </div>
                </div>

                {/* Backdrop Upload Area */}
                <div className="space-y-4">
                  <label className="text-xs font-black uppercase text-neutral-400 tracking-widest">Wide Backdrop (16:9)</label>
                  <div className="aspect-video w-full rounded-[2.5rem] border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-center p-6 group hover:border-brand/40 transition-colors cursor-pointer">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-neutral-200 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Icon name="image" className="w-8 h-8 text-neutral-300" />
                    </div>
                    <p className="text-sm font-bold text-neutral-900">Drop Backdrop Here</p>
                    <p className="text-xs text-neutral-500 mt-1">Recommended: 1920 x 1080 px</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Video Content */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2 border-b border-neutral-100 pb-4">
                <h2 className="text-2xl font-black text-neutral-900 uppercase italic">File Video</h2>
                <p className="text-neutral-500 text-sm font-medium">Upload master file video dengan kualitas terbaik (MP4/MKV).</p>
              </div>

              {!isUploading ? (
                <div className="w-full py-20 px-10 rounded-[2.5rem] border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center text-center group hover:border-brand/40 transition-colors cursor-pointer">
                  <div className="w-24 h-24 rounded-[2rem] bg-brand/5 border border-brand/10 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform animate-bounce-subtle">
                    <Icon name="monitor-play" className="w-10 h-10 text-brand" />
                  </div>
                  <h4 className="text-xl font-black text-neutral-900">Pilih File Video Master</h4>
                  <p className="text-sm text-neutral-500 mt-2 max-w-xs">Drag and drop file video Anda di sini untuk diproses menjadi kualitas HD/4K.</p>
                  <div className="mt-8 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold text-xs">Pilih File Dari Komputer</div>
                </div>
              ) : (
                <div className="w-full py-20 px-10 rounded-[2.5rem] bg-neutral-900 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                  {/* Decorative Glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand/20 blur-[100px] pointer-events-none" />
                  
                  <div className="relative z-10 w-full max-w-md space-y-10">
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-3xl bg-brand/20 flex items-center justify-center mx-auto mb-6">
                        <div className="w-12 h-12 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
                      </div>
                      <h4 className="text-2xl font-black text-white italic tracking-tight">Uploading Movie Content...</h4>
                      <p className="text-neutral-500 text-sm">Mohon jangan tutup halaman ini hingga proses selesai.</p>
                    </div>

                    <div className="space-y-3 text-left">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span className="text-brand">Progress</span>
                        <span className="text-white">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div 
                          className="h-full bg-brand rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(2,77,148,0.5)]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-tighter">Uploading: {formData.title || "Untitled_Movie"}.mp4 ...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 pt-8 border-t border-neutral-100 flex items-center justify-between">
            <button 
              onClick={prevStep}
              disabled={currentStep === 1 || isUploading}
              className={cn(
                "px-8 py-3.5 rounded-2xl font-bold text-sm transition-all",
                currentStep === 1 || isUploading ? "opacity-30 cursor-not-allowed" : "hover:bg-neutral-100 text-neutral-900"
              )}
            >
              Kembali
            </button>
            
            {currentStep < 3 ? (
              <button 
                onClick={nextStep}
                className="px-10 py-3.5 bg-neutral-900 text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-neutral-200"
              >
                Selanjutnya
              </button>
            ) : (
              !isUploading && (
                <button 
                  onClick={simulateUpload}
                  className="px-12 py-3.5 bg-brand text-white rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand/20"
                >
                  Publikasikan Sekarang
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
