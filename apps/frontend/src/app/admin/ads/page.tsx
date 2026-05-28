"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { StatusModal } from "@/components/ui/StatusModal";

const ADS_STORAGE_KEY = "lalakon_ads_slots";

interface AdSlot {
  id: number;
  imageData: string; // base64 data URL
  active: boolean;
}

const DEFAULT_SLOTS: AdSlot[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  imageData: "",
  active: true,
}));

export default function AdsPage() {
  const [slots, setSlots] = useState<AdSlot[]>(DEFAULT_SLOTS);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; type: "success" | "error"; title: string; message: string }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [dragging, setDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === 6) {
          setSlots(parsed);
        }
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  // Convert uploaded file to base64
  const handleFileChange = (id: number, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSlots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, imageData: result } : s))
      );
    };
    reader.readAsDataURL(file);
  };

  const toggleActive = (id: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const clearSlot = (id: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, imageData: "" } : s))
    );
  };

  const handleDrop = (id: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(id, file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(slots));
      setModal({ open: true, type: "success", title: "Berhasil Disimpan", message: "Data iklan berhasil disimpan dan akan tampil di homepage member." });
    } catch {
      setModal({ open: true, type: "error", title: "Gagal Menyimpan", message: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi." });
    } finally {
      setSaving(false);
    }
  };

  const activeCount = slots.filter((s) => s.active && s.imageData).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <StatusModal
        isOpen={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Manajemen Iklan
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Upload logo / gambar partner untuk 6 slot iklan di homepage.{" "}
            <span className="text-brand font-semibold">{activeCount}/6</span>{" "}
            slot aktif &amp; terisi.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="self-start sm:self-auto bg-brand hover:brightness-110 text-white font-bold rounded-xl h-12 px-6 gap-2 disabled:opacity-60 transition-all duration-200 shrink-0"
        >
          <Icon name="save" className="w-5 h-5" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className={`group bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
              slot.active
                ? "border-border hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
                : "border-border/40 opacity-55"
            }`}
          >
            {/* Slot Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                  <span className="text-brand font-black text-xs">#{index + 1}</span>
                </div>
                <span className="font-bold text-sm text-foreground">Slot {slot.id}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Clear button */}
                {slot.imageData && (
                  <button
                    type="button"
                    onClick={() => clearSlot(slot.id)}
                    title="Hapus gambar"
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Active Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-xs text-muted-foreground font-medium">
                    {slot.active ? "Aktif" : "Nonaktif"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={slot.active}
                    onClick={() => toggleActive(slot.id)}
                    className={`relative w-9 h-5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                      slot.active ? "bg-brand" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                        slot.active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>
              </div>
            </div>

            {/* Upload Area */}
            <div className="p-4">
              <input
                ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(slot.id, e.target.files?.[0] ?? null)}
              />

              <div
                onClick={() => fileInputRefs.current[slot.id]?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(slot.id); }}
                onDragLeave={() => setDragging(null)}
                onDrop={(e) => handleDrop(slot.id, e)}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center overflow-hidden
                  ${dragging === slot.id
                    ? "border-brand bg-brand/5 scale-[1.02]"
                    : slot.imageData
                    ? "border-border/50 bg-muted/20 hover:border-brand/40"
                    : "border-border hover:border-brand/50 hover:bg-muted/30 bg-muted/10"
                  }`}
                style={{ minHeight: "140px" }}
              >
                {slot.imageData ? (
                  <>
                    <img
                      src={slot.imageData}
                      alt={`Slot ${slot.id}`}
                      className="max-h-[120px] max-w-full w-auto object-contain p-3"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <span className="text-white text-xs font-bold bg-black/60 rounded-lg px-3 py-1.5">
                        Ganti Gambar
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8 px-4 text-center pointer-events-none">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Icon name="image" className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground/70">
                        Klik atau drag &amp; drop
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        PNG, JPG, SVG, WebP
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
