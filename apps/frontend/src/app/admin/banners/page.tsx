"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { ButtonAction } from "@/components/ui/ButtonAction";
import { StatusModal } from "@/components/ui/StatusModal";
import { ALL_MOVIES } from "@/constants/video-data";
import Image from "next/image";
import { Video } from "@/types/video";
import { cn } from "@/lib/utils";

export default function BannersPage() {
  const [bannerSlots, setBannerSlots] = useState<(Video | null)[]>(() => {
    const slots = new Array(10).fill(null);
    return slots;
  });

  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [tempSelectedMovie, setTempSelectedMovie] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingSlot, setPlayingSlot] = useState<number | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(false);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return [];
    return ALL_MOVIES.filter((m) => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const handleSelectMovie = (movie: Video) => {
    setTempSelectedMovie(movie);
    setSearchQuery(movie.title);
    setIsListExpanded(false);
  };

  const handleSaveConfig = () => {
    setStatusType("success");
    setStatusMessage("Konfigurasi banner berhasil disimpan.");
    setIsStatusOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (editingSlot !== null && tempSelectedMovie) {
      const newSlots = [...bannerSlots];
      newSlots[editingSlot] = tempSelectedMovie;
      setBannerSlots(newSlots);
      setEditingSlot(null);
      setTempSelectedMovie(null);
      setSearchQuery("");

      setStatusType("success");
      setStatusMessage(`Film "${tempSelectedMovie.title}" berhasil dipasang pada slot #${editingSlot + 1}.`);
      setIsStatusOpen(true);
    }
  };

  const handleRemoveMovie = (slotIndex: number) => {
    const newSlots = [...bannerSlots];
    newSlots[slotIndex] = null;
    setBannerSlots(newSlots);
    if (playingSlot === slotIndex) setPlayingSlot(null);
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
          <h1 className="text-3xl font-black text-black tracking-tight uppercase italic">Banner Penayangan</h1>
          <p className="text-neutral-600 text-sm font-medium">Atur konten yang tampil pada halaman utama.</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-neutral-200">
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
            <tbody className="divide-y divide-neutral-100">
              {bannerSlots.map((movie, index) => (
                <tr key={index} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-8 py-6 text-center">
                    <span className="text-[14px] font-black text-black">{index + 1}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-sm group/thumb">
                      {movie ? (
                        <>
                          <Image src={movie.backdrop} alt={movie.title} fill className="object-cover group-hover/thumb:scale-110 transition-transform duration-500" />
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
                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                          <Icon name="image" className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[15px] font-bold text-black">{movie?.title || "Empty Slot"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[14px] font-medium text-black">{movie?.productionHouse || "-"}</span>
                  </td>
                  <td className="px-8 py-6">
                    <ButtonAction onEdit={() => setEditingSlot(index)} onDelete={movie ? () => handleRemoveMovie(index) : undefined} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <StatusModal isOpen={isStatusOpen} type={statusType} title={statusType === "success" ? "Gagal!" : "Gagal"} message={statusMessage} onClose={() => setIsStatusOpen(false)} />

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
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.25)] overflow-visible flex flex-col md:flex-row animate-in slide-in-from-bottom-10 duration-500 border border-neutral-200"
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
            <div className="w-full md:w-[380px] md:shrink-0 bg-neutral-50 relative z-20 border-r border-neutral-200 rounded-l-3xl">
              <div className="p-8">
                <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter">Atur Banner</h2>
                <p className="text-sm text-neutral-500 font-bold mt-1 uppercase tracking-wider mb-6">Pilih Film untuk Slot #{editingSlot + 1}</p>

                {/* Autocomplete Input Container */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Ketik Judul Film</label>
                  <div className="relative group">
                    <Icon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand transition-colors" />
                    <input
                      type="text"
                      placeholder="Contoh: Midnight Journey..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsListExpanded(true);
                      }}
                      onFocus={() => setIsListExpanded(true)}
                      className="w-full pl-14 pr-6 py-5 bg-white border-2 border-neutral-300 rounded-2xl text-black font-bold placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:shadow-xl focus:shadow-brand/10 transition-all shadow-sm"
                    />

                    {/* Suggestions Dropdown */}
                    {isListExpanded && filteredMovies.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300">
                          {filteredMovies.map((movie) => (
                            <button key={movie.id} onClick={() => handleSelectMovie(movie)} className="w-full flex items-center gap-4 p-4 hover:bg-brand/5 transition-colors text-left group border-b border-neutral-100 last:border-none">
                              <div className="relative w-12 h-8 rounded bg-neutral-200 overflow-hidden">
                                <Image src={movie.backdrop} alt={movie.title} fill className="object-cover" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-black group-hover:text-brand transition-colors">{movie.title}</p>
                                <p className="text-[10px] text-neutral-500 font-bold uppercase">{movie.productionHouse}</p>
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
                      <Image src={tempSelectedMovie.backdrop} alt={tempSelectedMovie.title} fill className="object-cover opacity-50" />
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
                    <button
                      onClick={handleConfirmAssignment}
                      className="flex-[2] py-5 bg-brand hover:bg-brand-dark text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl shadow-brand/20"
                    >
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
