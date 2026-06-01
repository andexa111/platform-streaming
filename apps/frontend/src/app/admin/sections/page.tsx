"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";

interface HomeSectionConfig {
  id: number;
  sectionNum: number;
  title: string;
  description: string | null;
  categorySlug: string | null;
}

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<HomeSectionConfig[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Individual save states
  const [savingMap, setSavingMap] = useState<Record<number, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<number, string>>({});

  // Local form states
  const [formData, setFormData] = useState<Record<number, { title: string; description: string; categorySlug: string }>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sectionsRes, categoriesRes] = await Promise.all([
        api.get("/home-sections"),
        api.get("/category"),
      ]);

      const sectionsData: HomeSectionConfig[] = sectionsRes.data || [];
      setSections(sectionsData);
      setCategories(categoriesRes.data || []);

      // Populate local form states
      const initialFormData: typeof formData = {};
      sectionsData.forEach((sec) => {
        initialFormData[sec.sectionNum] = {
          title: sec.title || "",
          description: sec.description || "",
          categorySlug: sec.categorySlug || "",
        };
      });
      setFormData(initialFormData);
    } catch (err: any) {
      console.error("Gagal memuat data:", err);
      setError("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (sectionNum: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionNum]: {
        ...prev[sectionNum],
        [field]: value,
      },
    }));
    // Clear success message when user edits again
    if (successMap[sectionNum]) {
      setSuccessMap((prev) => ({ ...prev, [sectionNum]: "" }));
    }
  };

  const handleSave = async (sectionNum: number) => {
    const data = formData[sectionNum];
    if (!data) return;

    try {
      setSavingMap((prev) => ({ ...prev, [sectionNum]: true }));
      setSuccessMap((prev) => ({ ...prev, [sectionNum]: "" }));

      await api.put(`/home-sections/${sectionNum}`, {
        title: data.title,
        description: data.description || null,
        categorySlug: sectionNum === 2 ? null : data.categorySlug || null,
      });

      setSuccessMap((prev) => ({
        ...prev,
        [sectionNum]: "Pengaturan berhasil disimpan!",
      }));
    } catch (err: any) {
      console.error(`Gagal menyimpan section ${sectionNum}:`, err);
      alert(err.response?.data?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [sectionNum]: false }));
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500 space-y-4">
        <Icon name="warning" className="w-12 h-12 mx-auto" />
        <p className="font-bold">{error}</p>
        <button onClick={fetchData} className="px-5 py-2.5 bg-brand text-white rounded-xl text-xs font-black uppercase">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Pengaturan Section Home</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Kelola judul, deskripsi, dan kategori film yang ditampilkan di 3 section utama halaman Home & Public.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 gap-8">
        {[1, 2, 3].map((sectionNum) => {
          const config = sections.find((s) => s.sectionNum === sectionNum);
          const local = formData[sectionNum] || { title: "", description: "", categorySlug: "" };
          const isSaving = savingMap[sectionNum] || false;
          const successMsg = successMap[sectionNum] || "";

          return (
            <div
              key={sectionNum}
              className="bg-card rounded-[2.5rem] border border-border p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 relative overflow-hidden group hover:border-brand/35 transition-all duration-300"
            >
              {/* Left Column: Info & Number badge */}
              <div className="w-full md:w-1/4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center font-black text-brand text-sm">
                      {sectionNum}
                    </span>
                    <h2 className="text-lg font-black uppercase italic tracking-tight text-foreground">
                      Section {sectionNum}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sectionNum === 1 && "Section kurasi utama. Default menampilkan 'Lolos Kurasi FFAB 2026'."}
                    {sectionNum === 2 && "Section Segera Hadir (Locked). Hanya menampilkan film Coming Soon yang rilis H-1."}
                    {sectionNum === 3 && "Section Kategori Dinamis. Bebas memilih kategori film apa saja untuk ditampilkan."}
                  </p>
                </div>

                <div className="pt-4 md:pt-0">
                  <button
                    onClick={() => handleSave(sectionNum)}
                    disabled={isSaving}
                    className="w-full md:w-auto px-6 py-3.5 bg-brand text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="save" className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Editable Fields */}
              <div className="flex-1 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Header (Judul Section)
                  </label>
                  <input
                    type="text"
                    value={local.title}
                    onChange={(e) => handleChange(sectionNum, "title", e.target.value)}
                    placeholder="Contoh: Lolos Kurasi FFAB 2026"
                    className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-bold text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Deskripsi Singkat (Hanya muncul saat login)
                  </label>
                  <textarea
                    value={local.description}
                    onChange={(e) => handleChange(sectionNum, "description", e.target.value)}
                    placeholder="Contoh: Koleksi film pilihan terbaik..."
                    rows={3}
                    className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-medium text-foreground placeholder:text-muted-foreground/60 resize-none"
                  />
                </div>

                {/* Category Dropdown (Only for Section 1 and 3) */}
                {sectionNum !== 2 ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Kategori Film
                    </label>
                    <select
                      value={local.categorySlug}
                      onChange={(e) => handleChange(sectionNum, "categorySlug", e.target.value)}
                      className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm font-bold text-foreground cursor-pointer"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name} ({cat.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Kategori Film
                    </label>
                    <div className="w-full px-5 py-4 bg-secondary/40 border border-border/50 rounded-2xl text-xs font-bold text-muted-foreground/60 select-none flex items-center gap-2">
                      <Icon name="lock" className="w-3.5 h-3.5" />
                      <span>Terkunci secara logika untuk film Segera Hadir (Coming Soon)</span>
                    </div>
                  </div>
                )}

                {/* Success alert message */}
                {successMsg && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 animate-in slide-in-from-top-1 duration-200">
                    <Icon name="check" className="w-4 h-4" />
                    <span>{successMsg}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
