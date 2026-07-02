"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonAction } from "@/components/ui/ButtonAction";
import { StatusModal } from "@/components/ui/StatusModal";
import { ALL_MOVIES } from "@/constants/video-data";
import Image from "next/image";
import { Video } from "@/types/video";
import { cn } from "@/lib/utils";
import { api, getMediaUrl } from "@/lib/api";

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState<"banner" | "intro">("banner");

  // Banner States
  const [bannerSlots, setBannerSlots] = useState<(Video | null)[]>(new Array(10).fill(null));
  const [loading, setLoading] = useState(true);
  const [allMovies, setAllMovies] = useState<Video[]>([]);

  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [tempSelectedMovie, setTempSelectedMovie] = useState<Video | null>(null);
  const [clipStart, setClipStart] = useState<number>(0);
  const [clipEnd, setClipEnd] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingSlot, setPlayingSlot] = useState<number | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  // Intro Configuration States (URL and Upload only)
  const [introVideoUrl, setIntroVideoUrl] = useState("https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-glow-41753-large.mp4");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");

  // Live preview interactive state
  const [previewKey, setPreviewKey] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // Sync intro URL from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIntroVideoUrl = localStorage.getItem("intro_video_url");
      if (storedIntroVideoUrl) setIntroVideoUrl(storedIntroVideoUrl);
    }
  }, []);

  // Handle file uploading change (Frontend simulator)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadedFileUrl(objectUrl);
      setPreviewPlaying(false); // reset preview
    }
  };

  // Handle saving configurations
  const handleSaveIntroSettings = () => {
    if (uploadedFile) {
      if (uploadedFile.size > 4.5 * 1024 * 1024) {
        setStatusType("error");
        setStatusMessage("Berkas video terlalu besar! Maksimal ukuran video intro yang diunggah langsung adalah 4.5 MB agar dapat disimpan di browser. Untuk video yang lebih besar, gunakan kolom URL Video Intro (Alternatif).");
        setIsStatusOpen(true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const base64Url = e.target?.result as string;
          localStorage.setItem("intro_video_url", base64Url);
          localStorage.setItem("intro_uploaded_file_name", uploadedFile.name);
          setIntroVideoUrl(base64Url);

          setStatusType("success");
          setStatusMessage("Berkas Video Intro berhasil diunggah dan disimpan!");
          setIsStatusOpen(true);
        } catch (err) {
          console.error("Failed to save to localStorage:", err);
          setStatusType("error");
          setStatusMessage("Penyimpanan browser penuh! Gagal menyimpan file video ke lokal browser. Gunakan kolom URL Video Intro (Alternatif).");
          setIsStatusOpen(true);
        }
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      localStorage.setItem("intro_video_url", introVideoUrl);
      localStorage.removeItem("intro_uploaded_file_name");

      setStatusType("success");
      setStatusMessage("Konfigurasi Video Intro berhasil disimpan!");
      setIsStatusOpen(true);
    }
  };

  const handleStartIntroPreview = () => {
    setPreviewKey((prev) => prev + 1);
    setPreviewPlaying(true);
  };

  const mapFilm = (film: any): Video => ({
    id: film.id,
    title: film.title,
    genre: film.genres && film.genres.length > 0 ? film.genres[0].name : "Other",
    rating: "4.8",
    quality: "4K UHD",
    thumbnail: film.poster_url ? getMediaUrl(film.poster_url) : "",
    backdrop: film.poster_url ? getMediaUrl(film.poster_url) : "",
    description: film.description || "",
    trailerUrl: film.trailer_url ? getMediaUrl(film.trailer_url) : "",
    productionHouse: film.production_house || "",
    productionHouseLogo: film.production_house_logo ? getMediaUrl(film.production_house_logo) : "",
    clipStart: film.clip_start ?? undefined,
    clipEnd: film.clip_end ?? undefined,
  });

  useEffect(() => {
    Promise.all([api.get("/featured-films").catch(() => ({ data: [] })), api.get("/films?limit=100").catch(() => ({ data: { data: [] } }))])
      .then(([featuredRes, filmsRes]) => {
        const dbFilms = filmsRes.data?.data || [];
        const mappedAll = dbFilms.map(mapFilm);
        setAllMovies(mappedAll);

        const dbFeatured = featuredRes.data || [];
        const newSlots = new Array(10).fill(null);
        dbFeatured.forEach((item: any) => {
          if (item.film && item.position >= 1 && item.position <= 10) {
            newSlots[item.position - 1] = mapFilm(item.film);
          }
        });
        setBannerSlots(newSlots);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return [];
    return allMovies.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, allMovies]);

  const handleSelectMovie = (movie: Video) => {
    setTempSelectedMovie(movie);
    setSearchQuery(movie.title);
    setClipStart(movie.clipStart ?? 0);
    setClipEnd(movie.clipEnd ?? 10);
    setIsListExpanded(false);
  };

  const handleEditSlot = (slotIndex: number) => {
    const movie = bannerSlots[slotIndex];
    setEditingSlot(slotIndex);
    if (movie) {
      setTempSelectedMovie(movie);
      setSearchQuery(movie.title);
      setClipStart(movie.clipStart ?? 0);
      setClipEnd(movie.clipEnd ?? 10);
    } else {
      setTempSelectedMovie(null);
      setSearchQuery("");
      setClipStart(0);
      setClipEnd(10);
    }
  };

  const handleConfirmAssignment = () => {
    if (editingSlot !== null && tempSelectedMovie) {
      // 1. Update clip duration in backend first
      api
        .patch(`/films/${tempSelectedMovie.id}/clip`, {
          clip_start: clipStart,
          clip_end: clipEnd,
        })
        .then(() => {
          // Update the movie's clip info locally
          const updatedMovie = {
            ...tempSelectedMovie,
            clipStart,
            clipEnd,
          };

          const newSlots = [...bannerSlots];
          newSlots[editingSlot] = updatedMovie;

          const items = newSlots.map((movie, idx) => (movie ? { filmId: movie.id, position: idx + 1 } : null)).filter(Boolean) as { filmId: number; position: number }[];

          // 2. Put to featured-films
          return api.put("/featured-films", { items }).then(() => {
            setBannerSlots(newSlots);
            setEditingSlot(null);
            setTempSelectedMovie(null);
            setSearchQuery("");

            setStatusType("success");
            setStatusMessage(`Film "${tempSelectedMovie.title}" berhasil dipasang dengan cuplikan ${clipStart}s - ${clipEnd}s pada slot #${editingSlot + 1}.`);
            setIsStatusOpen(true);
          });
        })
        .catch((err) => {
          console.error("Gagal menyimpan banner:", err);
          setStatusType("error");
          setStatusMessage("Gagal menyimpan konfigurasi banner atau durasi cuplikan ke server.");
          setIsStatusOpen(true);
        });
    }
  };

  const handleRemoveMovie = (slotIndex: number) => {
    const newSlots = [...bannerSlots];
    newSlots[slotIndex] = null;

    const items = newSlots.map((movie, idx) => (movie ? { filmId: movie.id, position: idx + 1 } : null)).filter(Boolean) as { filmId: number; position: number }[];

    api
      .put("/featured-films", { items })
      .then(() => {
        setBannerSlots(newSlots);
        if (playingSlot === slotIndex) setPlayingSlot(null);

        setStatusType("success");
        setStatusMessage(`Slot #${slotIndex + 1} berhasil dikosongkan.`);
        setIsStatusOpen(true);
      })
      .catch(() => {
        setStatusType("error");
        setStatusMessage("Gagal menghapus banner dari server.");
        setIsStatusOpen(true);
      });
  };

  // Sync search query with temp selection if cleared manually
  useEffect(() => {
    if (!searchQuery) setTempSelectedMovie(null);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Banner & Intro</h1>
          <p className="text-muted-foreground text-sm font-medium">Atur konten banner promosi dan video intro halaman utama.</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 p-1.5 bg-secondary/30 border border-border rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab("banner")}
          className={cn(
            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300",
            activeTab === "banner" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Atur Banner
        </button>
        <button
          onClick={() => setActiveTab("intro")}
          className={cn(
            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300",
            activeTab === "intro" ? "bg-brand text-white shadow-lg shadow-brand/20" : "text-muted-foreground hover:text-foreground",
          )}
        >
          Atur Intro
        </button>
      </div>

      {activeTab === "banner" ? (
        <>
          {/* Main Table Container */}
          {loading ? (
            <div className="bg-card rounded-xl border border-border p-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground">Memuat data banner...</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-brand text-white">
                      <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide w-24 text-center">Slot</th>
                      <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide w-40">Preview</th>
                      <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide">Film Name</th>
                      <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide">Production</th>
                      <th className="px-8 py-5 text-[13px] font-bold uppercase tracking-wide text-right w-40">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bannerSlots.map((movie, index) => (
                      <tr key={index} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-8 py-6 text-center">
                          <span className="text-[14px] font-black text-foreground">{index + 1}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-secondary border border-border shadow-sm group/thumb">
                            {movie ? (
                              <>
                                <Image src={movie.backdrop || movie.thumbnail} alt={movie.title} fill className="object-cover group-hover/thumb:scale-110 transition-transform duration-500" />
                                <button
                                  onClick={() => setPlayingSlot(playingSlot === index ? null : index)}
                                  className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity"
                                >
                                  <Icon name={playingSlot === index ? "x" : "play"} className="w-8 h-8 text-white" />
                                </button>
                                {playingSlot === index && movie.trailerUrl && (
                                  <div className="absolute inset-0 z-20 bg-black">
                                    <video src={movie.trailerUrl} autoPlay muted loop className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                                <Icon name="image" className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[15px] font-bold text-foreground">{movie?.title || "Empty Slot"}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[14px] font-medium text-muted-foreground">{movie?.productionHouse || "-"}</span>
                        </td>
                        <td className="px-8 py-6">
                          <ButtonAction onEdit={() => handleEditSlot(index)} onDelete={movie ? () => handleRemoveMovie(index) : undefined} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-5 duration-500">
          {/* Form Configuration (Left Col - 5 cols) */}
          <div className="lg:col-span-5 bg-card rounded-2xl border border-border p-8 space-y-6 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight italic mb-1">Konfigurasi Video</h2>
              <p className="text-xs text-muted-foreground font-medium">Atur properti pemutaran video intro utama.</p>
            </div>
            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block">Unggah Berkas Video</label>
              <div className="relative border-2 border-dashed border-border hover:border-brand rounded-2xl p-6 transition-colors duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer bg-secondary/10 group">
                <input type="file" accept="video/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Icon name="folder" className="w-8 h-8 text-muted-foreground group-hover:text-brand transition-colors duration-300" />
                <span className="text-xs font-bold text-foreground">{uploadedFile ? uploadedFile.name : "Pilih Berkas Video (.mp4, .webm, dll.)"}</span>
                <span className="text-[10px] text-muted-foreground/60">{uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB` : "Tarik & lepas file video di sini"}</span>
              </div>
            </div>

            {/* Input Video URL */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block">URL Video Intro (Alternatif)</label>
              <input
                type="text"
                value={introVideoUrl}
                onChange={(e) => {
                  setIntroVideoUrl(e.target.value);
                  setUploadedFile(null); // clear uploaded file if user decides to use URL
                  setUploadedFileUrl("");
                  setPreviewPlaying(false);
                }}
                placeholder="https://example.com/intro.mp4"
                className="w-full px-5 py-4 bg-secondary/10 border-2 border-border rounded-xl text-foreground font-semibold placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand transition-all text-sm"
              />
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleSaveIntroSettings}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-2"
            >
              <Icon name="save" className="w-4 h-4" />
              Simpan Konfigurasi
            </button>
          </div>

          {/* Interactive Live Preview (Right Col - 7 cols) */}
          <div className="lg:col-span-7 bg-neutral-950 rounded-2xl border border-neutral-800 p-8 space-y-6 text-white shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-center">
              <div>
                <span className="px-2.5 py-1 bg-brand text-[9px] font-black rounded-md uppercase tracking-wider">Live Preview Monitor</span>
              </div>
              <button
                onClick={handleStartIntroPreview}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
              >
                <Icon name="refresh-cw" className="w-3.5 h-3.5" />
                Mulai Ulang
              </button>
            </div>

            {/* Simulated Screen Container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-2xl flex items-center justify-center group">
              {previewPlaying ? (
                <>
                  <video key={previewKey} src={uploadedFileUrl || introVideoUrl} autoPlay controls className="w-full h-full object-cover" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand animate-pulse">
                    <Icon name="play" className="w-8 h-8 fill-brand translate-x-0.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide">Simulator Siap</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-[280px]">Klik tombol diatas atau lingkaran play untuk memicu video intro</p>
                  </div>
                  <button onClick={handleStartIntroPreview} className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand/20">
                    Putar Intro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <StatusModal isOpen={isStatusOpen} type={statusType} title={statusType === "success" ? "Berhasil!" : "Gagal!"} message={statusMessage} onClose={() => setIsStatusOpen(false)} />

      {/* Selection & Preview Modal */}
      {editingSlot !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto"
          onClick={() => {
            setEditingSlot(null);
            setTempSelectedMovie(null);
            setSearchQuery("");
          }}
        >
          <div
            className="relative w-full max-w-5xl bg-card rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-visible flex flex-col md:flex-row animate-in slide-in-from-bottom-10 duration-500 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setEditingSlot(null);
                setTempSelectedMovie(null);
                setSearchQuery("");
              }}
              className="absolute -top-3 -right-3 p-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 hover:scale-110 transition-all z-[60] ring-2 ring-white"
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
            {/* Left Side: Autocomplete Selection */}
            <div className="w-full md:w-[380px] md:shrink-0 bg-secondary/30 relative z-20 border-r border-border rounded-l-3xl">
              <div className="p-8">
                <h2 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Atur Banner</h2>
                <p className="text-sm text-muted-foreground font-bold mt-1 uppercase tracking-wider mb-6">Pilih Film untuk Slot #{editingSlot + 1}</p>

                {/* Autocomplete Input Container */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Ketik Judul Film</label>
                  <div className="relative group">
                    <Icon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-brand transition-colors" />
                    <input
                      type="text"
                      placeholder="Contoh: Midnight Journey..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsListExpanded(true);
                      }}
                      onFocus={() => setIsListExpanded(true)}
                      className="w-full pl-14 pr-6 py-5 bg-card border-2 border-border rounded-2xl text-foreground font-bold placeholder:text-muted-foreground focus:outline-none focus:border-brand focus:shadow-xl focus:shadow-brand/10 transition-all shadow-sm"
                    />

                    {/* Suggestions Dropdown */}
                    {isListExpanded && filteredMovies.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
                          {filteredMovies.map((movie) => (
                            <button key={movie.id} onClick={() => handleSelectMovie(movie)} className="w-full flex items-center gap-4 p-4 hover:bg-secondary transition-colors text-left group border-b border-border last:border-none">
                              <div className="relative w-12 h-8 rounded bg-secondary overflow-hidden">
                                <Image src={movie.backdrop || movie.thumbnail} alt={movie.title} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-foreground group-hover:text-brand transition-colors">{movie.title}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase">{movie.productionHouse}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Preview & Actions */}
            <div className="w-full md:flex-1 flex flex-col bg-neutral-900 text-white relative z-10 rounded-r-3xl overflow-hidden">
              {tempSelectedMovie ? (
                <div className="flex flex-col p-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5">
                    {tempSelectedMovie.trailerUrl ? (
                      <video key={tempSelectedMovie.id} src={tempSelectedMovie.trailerUrl} autoPlay muted loop className="w-full h-full object-cover" />
                    ) : (
                      <Image src={tempSelectedMovie.backdrop || tempSelectedMovie.thumbnail} alt={tempSelectedMovie.title} fill className="object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1.5 bg-brand text-[10px] font-black rounded-lg uppercase tracking-tighter">Live Preview</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1.5">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-tight">{tempSelectedMovie.title}</h3>
                    <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{tempSelectedMovie.productionHouse || "-"}</p>
                  </div>

                  {/* Clip Settings */}
                  <div className="mt-4 grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Mulai Cuplikan (Detik)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={clipStart}
                        onChange={(e) => setClipStart(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-brand text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">Selesai Cuplikan (Detik)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="10"
                        value={clipEnd}
                        onChange={(e) => setClipEnd(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-brand text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-row gap-3 pt-5">
                    <button
                      onClick={() => {
                        setEditingSlot(null);
                        setTempSelectedMovie(null);
                        setSearchQuery("");
                      }}
                      className="flex-1 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] transition-all border border-white/10"
                    >
                      Batal
                    </button>
                    <button onClick={handleConfirmAssignment} className="flex-[2] py-5 bg-brand hover:bg-brand-dark text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl shadow-brand/20">
                      Konfirmasi Pasang
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center opacity-20">
                  <Icon name="eye" className="w-14 h-14 mb-4" />
                  <h3 className="text-lg font-black uppercase italic">Preview Monitor</h3>
                  <p className="text-xs mt-1.5 font-medium max-w-[200px]">Pilih film untuk melihat cuplikan di sini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
