"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/Switch";
import { StatusModal } from "@/components/ui/StatusModal";
import { api, getMediaUrl } from "@/lib/api";

interface AdSlot {
  id: number; // slots 1 to 6
  name: string;
  logo_url: string;
  is_active: boolean;
  preview: string;
  uploading: boolean;
}

const DEFAULT_SLOTS: AdSlot[] = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  name: "",
  logo_url: "",
  is_active: true,
  preview: "",
  uploading: false,
}));

export default function AdsPage() {
  const [slots, setSlots] = useState<AdSlot[]>(DEFAULT_SLOTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; type: "success" | "error"; title: string; message: string }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });
  const [dragging, setDragging] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Load from backend on mount
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await api.get("/partner-logos/admin");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mappedSlots = DEFAULT_SLOTS.map((defSlot) => {
            const found = res.data.find((item: any) => item.slot === defSlot.id);
            if (found) {
              return {
                id: found.slot,
                name: found.name || "",
                logo_url: found.logo_url || "",
                is_active: found.is_active,
                preview: found.logo_url ? getMediaUrl(found.logo_url) : "",
                uploading: false,
              };
            }
            return defSlot;
          });
          setSlots(mappedSlots);
        }
      } catch (err) {
        console.error("Gagal memuat logo partner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  // Upload file and update slot
  const uploadFileForSlot = async (slotId: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      setModal({
        open: true,
        type: "error",
        title: "Format Salah",
        message: "Berkas yang dipilih harus berupa file gambar.",
      });
      return;
    }

    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, uploading: true } : s))
    );

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/image", formData);
      const { url } = res.data;

      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? {
                ...s,
                logo_url: url,
                preview: getMediaUrl(url),
                uploading: false,
              }
            : s
        )
      );
    } catch (err) {
      console.error("Gagal mengunggah file:", err);
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, uploading: false } : s))
      );
      setModal({
        open: true,
        type: "error",
        title: "Gagal Upload",
        message: "Terjadi kesalahan saat mengunggah gambar. Silakan coba lagi.",
      });
    }
  };

  const handleFileChange = (slotId: number, file: File | null) => {
    if (!file) return;
    uploadFileForSlot(slotId, file);
  };

  const handleTextChange = (slotId: number, value: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, name: value } : s))
    );
  };

  const toggleActive = (slotId: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, is_active: !s.is_active } : s))
    );
  };

  const clearSlot = (slotId: number) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, logo_url: "", preview: "" } : s))
    );
  };

  const handleDrop = (slotId: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFileForSlot(slotId, file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = slots.map((s) => ({
        slot: s.id,
        name: s.name,
        logo_url: s.logo_url,
        is_active: s.is_active,
      }));

      await api.post("/partner-logos/bulk", { slots: payload });

      setModal({
        open: true,
        type: "success",
        title: "Berhasil Disimpan",
        message: "Daftar logo partner sponsor berhasil disimpan dan diperbarui di homepage member.",
      });
    } catch (err) {
      console.error("Gagal menyimpan logo partner:", err);
      setModal({
        open: true,
        type: "error",
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.",
      });
    } finally {
      setSaving(false);
    }
  };

  const activeCount = slots.filter((s) => s.is_active && s.logo_url).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-brand border-t-transparent animate-spin" />
        <span className="text-sm text-neutral-400 font-medium">Memuat data iklan...</span>
      </div>
    );
  }

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
          <h1 className="text-3xl font-black tracking-tight text-white">
            Manajemen Iklan Partner
          </h1>
          <p className="text-neutral-400 mt-1 text-sm">
            Kelola logo sponsor/partner (seperti Netflix, Google, dll) yang tampil secara dinamis di homepage member.{" "}
            <span className="text-blue-500 font-semibold">{activeCount}/6</span>{" "}
            slot terisi &amp; aktif.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="self-start sm:self-auto bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl h-12 px-6 gap-2 disabled:opacity-60 transition-all duration-200 shrink-0"
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
            className={`group bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-300 ${
              slot.is_active
                ? "border-neutral-200 dark:border-neutral-800 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
                : "border-neutral-200/50 dark:border-neutral-800/40 opacity-60 dark:opacity-55"
            }`}
          >
            {/* Slot Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800/50 bg-neutral-50 dark:bg-neutral-950/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 dark:text-blue-500 font-black text-xs">#{index + 1}</span>
                </div>
                <span className="font-bold text-sm text-neutral-900 dark:text-white">Slot {slot.id}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Clear button */}
                {slot.logo_url && (
                  <button
                    type="button"
                    onClick={() => clearSlot(slot.id)}
                    title="Hapus logo"
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Active Toggle */}
                <Switch
                  checked={slot.is_active}
                  onChange={() => toggleActive(slot.id)}
                  label={slot.is_active ? "Aktif" : "Nonaktif"}
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-4">
              {/* Brand Name Input */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider">
                  Nama Brand
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Netflix, Google, dll"
                  value={slot.name}
                  onChange={(e) => handleTextChange(slot.id, e.target.value)}
                  className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl h-10 px-3.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                />
              </div>

              {/* Upload Area */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider">
                  File Logo
                </label>
                <input
                  ref={(el) => {
                    fileInputRefs.current[slot.id] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(slot.id, e.target.files?.[0] ?? null)}
                />

                <div
                  onClick={() => !slot.uploading && fileInputRefs.current[slot.id]?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!slot.uploading) setDragging(slot.id);
                  }}
                  onDragLeave={() => setDragging(null)}
                  onDrop={(e) => !slot.uploading && handleDrop(slot.id, e)}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center overflow-hidden
                    ${
                      dragging === slot.id
                        ? "border-blue-500 bg-blue-500/5 scale-[1.02]"
                        : slot.preview
                        ? "border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 hover:border-blue-500/40"
                        : "border-neutral-300 dark:border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 bg-neutral-50 dark:bg-neutral-950/20"
                    }`}
                  style={{ minHeight: "130px" }}
                >
                  {slot.uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-neutral-600 dark:text-neutral-400">Mengunggah...</span>
                    </div>
                  ) : slot.preview ? (
                    <>
                      <img
                        src={slot.preview}
                        alt={`Slot ${slot.id}`}
                        className="max-h-[100px] max-w-full w-auto object-contain p-3"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-neutral-900 rounded-lg px-3 py-1.5 border border-neutral-700">
                          Ganti Gambar
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 px-4 text-center pointer-events-none">
                      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-900 flex items-center justify-center">
                        <Icon name="image" className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Klik / Tarik Gambar Logo
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          PNG, JPG, SVG (Maks. 100MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
