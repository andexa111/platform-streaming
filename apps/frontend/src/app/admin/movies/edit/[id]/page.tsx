"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { api, getMediaUrl } from "@/lib/api";
import axios from "axios";

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
  genres: { id: number; name: string }[];
  directors?: { id: number; name: string; photo_url?: string }[];
  actors: { id: number; name: string; photo_url?: string }[];
  categories: { id: number; name: string }[];
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
    producers: [{ name: "", photo_url: "" }] as { name: string; photo_url: string }[],
    genreIds: [] as number[],
    genreNames: [] as string[],
    categories: [] as string[],
    release_year: "",
    video_id: "",
    trailer_url: "",
    production_house: "",
    production_house_logo: "",
    poster_url: "",
    is_published: false,
    directors: [{ name: "", photo_url: "" }] as { name: string; photo_url: string }[],
    actors: [{ name: "", photo_url: "" }] as { name: string; photo_url: string }[],
  });

  const [genresList, setGenresList] = useState<{ id: number; name: string }[]>([]);
  const [categoriesList, setCategoriesList] = useState<{ id: number; name: string }[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  // Fetch genres & categories
  useEffect(() => {
    api.get("/genre")
      .then((res) => setGenresList(res.data))
      .catch(console.error);
    api.get("/category")
      .then((res) => setCategoriesList(res.data))
      .catch(console.error);
  }, []);

  // Fetch film data
  useEffect(() => {
    const fetchFilm = async () => {
      try {
        const res = await api.get(`/films/${filmId}`);
        const film: Film = res.data;
        setFormData({
          title: film.title || "",
          description: film.description || "",
          producers: (film as any).producers && (film as any).producers.length > 0
            ? (film as any).producers.map((p: any) => ({ name: p.name, photo_url: p.photo_url || "" }))
            : [{ name: film.producer || "", photo_url: "" }],
          genreIds: film.genres ? film.genres.map((g) => g.id) : [],
          genreNames: [] as string[],
          categories: film.categories ? film.categories.map((c) => c.name) : [],
          release_year: film.release_year?.toString() || "",
          video_id: film.video_id || "",
          trailer_url: film.trailer_url || "",
          poster_url: film.poster_url || "",
          production_house: (film as any).production_house || "",
          production_house_logo: (film as any).production_house_logo || "",
          is_published: film.is_published,
          directors: film.directors && film.directors.length > 0
            ? film.directors.map((d) => ({ name: d.name, photo_url: d.photo_url || "" }))
            : [{ name: film.director || "", photo_url: "" }],
          actors: film.actors && film.actors.length > 0
            ? film.actors.map((a) => ({ name: a.name, photo_url: a.photo_url || "" }))
            : [{ name: "", photo_url: "" }],
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

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await api.post("/upload/image", data);
      return res.data.url;
    } catch (err: any) {
      console.error("Gagal upload foto:", err);
      alert(err.response?.data?.message || "Gagal mengunggah foto. Pastikan formatnya jpg/png/webp.");
      return "";
    }
  };

  const handleAddGenre = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = genreInput.trim();
      if (!val) return;

      const existing = genresList.find(g => g.name.toLowerCase() === val.toLowerCase());
      if (existing) {
        if (!formData.genreIds.includes(existing.id)) {
          updateField("genreIds", [...formData.genreIds, existing.id]);
        }
      } else {
        if (!formData.genreNames.includes(val)) {
          updateField("genreNames", [...formData.genreNames, val]);
        }
      }
      setGenreInput("");
    }
  };

  const handleSelectGenreDropdown = (genreId: number) => {
    if (!formData.genreIds.includes(genreId)) {
      updateField("genreIds", [...formData.genreIds, genreId]);
    }
  };

  const handleRemoveGenreId = (idToRemove: number) => {
    updateField("genreIds", formData.genreIds.filter(id => id !== idToRemove));
  };

  const handleRemoveGenreName = (nameToRemove: string) => {
    updateField("genreNames", formData.genreNames.filter(name => name !== nameToRemove));
  };

  const handleAddCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newCat = categoryInput.trim();
      if (newCat && !formData.categories.includes(newCat)) {
        updateField("categories", [...formData.categories, newCat]);
      }
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    updateField("categories", formData.categories.filter(c => c !== catToRemove));
  };

  const handleSelectCategoryDropdown = (catName: string) => {
    if (!formData.categories.includes(catName)) {
      updateField("categories", [...formData.categories, catName]);
    }
  };

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
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const cleanDirectors = formData.directors.filter(d => d.name.trim() !== "");
      const cleanActors = formData.actors.filter(a => a.name.trim() !== "");
      const cleanProducers = formData.producers.filter(p => p.name.trim() !== "");

      const payload: any = {
        title: formData.title,
        description: formData.description || undefined,
        producer: cleanProducers.map(p => p.name).join(', ') || undefined,
        directorsInput: cleanDirectors.length > 0 ? cleanDirectors : undefined,
        actorsInput: cleanActors.length > 0 ? cleanActors : undefined,
        producersInput: cleanProducers.length > 0 ? cleanProducers : undefined,
        release_year: formData.release_year ? parseInt(formData.release_year) : undefined,
        video_id: formData.video_id || undefined,
        trailer_url: formData.trailer_url || undefined,
        poster_url: formData.poster_url || undefined,
        production_house: formData.production_house || undefined,
        production_house_logo: formData.production_house_logo || undefined,
        is_published: formData.is_published,
        genreIds: formData.genreIds.length > 0 ? formData.genreIds : undefined,
        genreNames: formData.genreNames.length > 0 ? formData.genreNames : undefined,
        categoryNames: formData.categories.length > 0 ? formData.categories : undefined,
      };

      await api.patch(`/films/${filmId}`, payload);

      // Unggah video jika dipilih
      if (selectedVideoFile) {
        setUploadingVideo(true);
        setVideoUploadProgress(0);

        // 1. Dapatkan presigned URL dari backend
        const presignedRes = await api.get(`/films/${filmId}/presigned-upload`, {
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
        await api.post(`/films/${filmId}/process-uploaded-video`);
      }

      setSuccess("Film berhasil diperbarui!");
      setTimeout(() => router.push("/admin/movies"), 1500);
    } catch (err: any) {
      console.error("Gagal menyimpan:", err);
      setError(err.response?.data?.message || "Gagal menyimpan perubahan atau mengunggah video.");
    } finally {
      setSaving(false);
      setUploadingVideo(false);
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
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group px-2"
      >
        <Icon name="chevron-right" className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Kembali Ke Katalog</span>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground tracking-tight uppercase italic">Edit Film</h1>
          <p className="text-muted-foreground text-sm font-medium">Perbarui metadata dan aset film.</p>
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
              formData.is_published ? "bg-emerald-500" : "bg-muted"
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
        <div className="lg:col-span-2 bg-card rounded-[2rem] border border-border p-8 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-border pb-4">
            <h2 className="text-lg font-black text-foreground uppercase">Informasi Film</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Judul Film *</label>
              <input 
                type="text" 
                className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>

            {/* Directors Section */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Sutradara (Maks. 2)</label>
              <div className="space-y-3">
                {formData.directors.map((director, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 bg-secondary/35 border border-border/50 rounded-2xl">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Nama sutradara ${index + 1}`}
                        className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        value={director.name}
                        onChange={(e) => {
                          const newDirs = [...formData.directors];
                          newDirs[index].name = e.target.value;
                          updateField("directors", newDirs);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex-shrink-0">
                        <div className="h-[54px] px-5 bg-secondary border border-border rounded-2xl flex items-center gap-2 hover:border-brand transition-all text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground">
                          <Icon name="image" className="w-4 h-4" />
                          {director.photo_url ? "Ganti Foto" : "Upload Foto"}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handlePhotoUpload(file);
                              const newDirs = [...formData.directors];
                              newDirs[index].photo_url = url;
                              updateField("directors", newDirs);
                            }
                          }}
                        />
                      </label>
                      {director.photo_url && (
                        <div className="w-[54px] h-[54px] rounded-2xl border border-border overflow-hidden bg-secondary flex-shrink-0">
                          <img src={director.photo_url} alt="Sutradara" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {formData.directors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            updateField("directors", formData.directors.filter((_, i) => i !== index));
                          }}
                          className="p-3.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-2xl transition-colors border border-transparent hover:border-red-500/20"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {formData.directors.length < 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      updateField("directors", [...formData.directors, { name: "", photo_url: "" }]);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    Tambah Sutradara
                  </button>
                )}
              </div>
            </div>

            {/* Producers Section */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Produser</label>
              <div className="space-y-3">
                {formData.producers.map((producer, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 bg-secondary/35 border border-border/50 rounded-2xl">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Nama produser ${index + 1}`}
                        className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        value={producer.name}
                        onChange={(e) => {
                          const newProds = [...formData.producers];
                          newProds[index].name = e.target.value;
                          updateField("producers", newProds);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex-shrink-0">
                        <div className="h-[54px] px-5 bg-secondary border border-border rounded-2xl flex items-center gap-2 hover:border-brand transition-all text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground">
                          <Icon name="image" className="w-4 h-4" />
                          {producer.photo_url ? "Ganti Foto" : "Upload Foto"}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handlePhotoUpload(file);
                              const newProds = [...formData.producers];
                              newProds[index].photo_url = url;
                              updateField("producers", newProds);
                            }
                          }}
                        />
                      </label>
                      {producer.photo_url && (
                        <div className="w-[54px] h-[54px] rounded-2xl border border-border overflow-hidden bg-secondary flex-shrink-0">
                          <img src={producer.photo_url} alt="Produser" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {formData.producers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            updateField("producers", formData.producers.filter((_, i) => i !== index));
                          }}
                          className="p-3.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-2xl transition-colors border border-transparent hover:border-red-500/20"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updateField("producers", [...formData.producers, { name: "", photo_url: "" }]);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" />
                  Tambah Produser
                </button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Genre</label>
              <div className="p-3 bg-secondary border border-border rounded-2xl focus-within:border-brand transition-all space-y-3">
                {/* Selected genre tags */}
                {(formData.genreIds.length > 0 || formData.genreNames.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {formData.genreIds.map((id) => {
                      const gName = genresList.find((g) => g.id === id)?.name || `ID: ${id}`;
                      return (
                        <span key={`id-${id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-bold">
                          {gName}
                          <button type="button" onClick={() => handleRemoveGenreId(id)} className="hover:text-red-400 ml-1 transition-colors">
                            <Icon name="x" className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    {formData.genreNames.map((name) => (
                      <span key={`name-${name}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                        {name} (Baru)
                        <button type="button" onClick={() => handleRemoveGenreName(name)} className="hover:text-red-400 ml-1 transition-colors">
                          <Icon name="x" className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <select
                      className="w-full px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:border-brand transition-all text-xs appearance-none pr-10 text-foreground"
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) handleSelectGenreDropdown(parseInt(val));
                      }}
                    >
                      <option value="">Pilih dari daftar...</option>
                      {genresList
                        .filter((g) => !formData.genreIds.includes(g.id))
                        .map((g) => (
                          <option key={g.id} value={g.id.toString()}>
                            {g.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground">
                      <Icon name="chevron-down" className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-[1.5]">
                    <input
                      type="text"
                      placeholder="Atau ketik genre baru lalu tekan Enter..."
                      className="w-full px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:border-brand transition-all text-xs text-foreground placeholder:text-muted-foreground"
                      value={genreInput}
                      onChange={(e) => setGenreInput(e.target.value)}
                      onKeyDown={handleAddGenre}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Kategori (Tags)</label>
              <div className="p-3 bg-secondary border border-border rounded-2xl focus-within:border-brand transition-all space-y-3">
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((cat) => (
                      <span key={cat} className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-bold">
                        {cat}
                        <button type="button" onClick={() => handleRemoveCategory(cat)} className="hover:text-red-400 ml-1 transition-colors">
                          <Icon name="x" className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <select
                      className="w-full px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:border-brand transition-all text-xs appearance-none pr-10 text-foreground"
                      value=""
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) handleSelectCategoryDropdown(val);
                      }}
                    >
                      <option value="">Pilih dari daftar...</option>
                      {categoriesList
                        .filter((c) => !formData.categories.includes(c.name))
                        .map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground">
                      <Icon name="chevron-down" className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex-[1.5]">
                    <input
                      type="text"
                      placeholder="Atau ketik kategori baru lalu tekan Enter..."
                      className="w-full px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:border-brand transition-all text-xs text-foreground placeholder:text-muted-foreground"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyDown={handleAddCategory}
                    />
                  </div>
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

            {/* Actors Section */}
            <div className="space-y-4 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Aktor / Pemeran</label>
              <div className="space-y-3">
                {formData.actors.map((actor, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 bg-secondary/35 border border-border/50 rounded-2xl">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Nama aktor ${index + 1}`}
                        className="w-full px-5 py-3.5 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm text-foreground placeholder:text-muted-foreground"
                        value={actor.name}
                        onChange={(e) => {
                          const newActs = [...formData.actors];
                          newActs[index].name = e.target.value;
                          updateField("actors", newActs);
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer flex-shrink-0">
                        <div className="h-[54px] px-5 bg-secondary border border-border rounded-2xl flex items-center gap-2 hover:border-brand transition-all text-xs font-black uppercase tracking-wider text-muted-foreground hover:text-foreground">
                          <Icon name="image" className="w-4 h-4" />
                          {actor.photo_url ? "Ganti Foto" : "Upload Foto"}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handlePhotoUpload(file);
                              const newActs = [...formData.actors];
                              newActs[index].photo_url = url;
                              updateField("actors", newActs);
                            }
                          }}
                        />
                      </label>
                      {actor.photo_url && (
                        <div className="w-[54px] h-[54px] rounded-2xl border border-border overflow-hidden bg-secondary flex-shrink-0">
                          <img src={actor.photo_url} alt="Aktor" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {formData.actors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            updateField("actors", formData.actors.filter((_, i) => i !== index));
                          }}
                          className="p-3.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-2xl transition-colors border border-transparent hover:border-red-500/20"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    updateField("actors", [...formData.actors, { name: "", photo_url: "" }]);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary hover:bg-muted border border-border rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" />
                  Tambah Aktor
                </button>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black uppercase text-foreground">Sinopsis</label>
              <textarea 
                rows={4}
                placeholder="Tuliskan sinopsis film..."
                className="w-full px-5 py-4 bg-secondary border border-border rounded-2xl focus:outline-none focus:border-brand transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
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
                  <div className="w-full h-[54px] bg-secondary border border-border border-dashed rounded-2xl flex items-center px-5 gap-3 hover:border-brand transition-all">
                    <Icon name="image" className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formData.production_house_logo ? "Ganti Logo" : "Upload Logo (maks. 100MB)"}
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
                  <div className="w-[54px] h-[54px] rounded-2xl border border-border bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={formData.production_house_logo} alt="Logo" className="w-full h-full object-contain p-2" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 border-b border-border pb-4 pt-4">
            <h2 className="text-lg font-black text-foreground uppercase">Aset & Video</h2>
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
              <p className="text-xs text-muted-foreground mt-1">Format: jpg/png/webp · <span className="font-semibold">Maks. 100MB</span></p>
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
                          : "Klik/Seret untuk memilih file video utama baru (.mp4)..."}
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
                {formData.video_id && !selectedVideoFile && (
                  <div className="p-4 bg-secondary border border-border rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Video Utama Saat Ini (R2)</p>
                    <div className="flex items-center gap-2 text-xs text-foreground font-mono break-all bg-card p-2 rounded border border-border">
                      <span className="truncate flex-1">{formData.video_id}</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Biarkan kosong jika Anda tidak ingin memperbarui video utama.</p>
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
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Trailer Terunggah</p>
                    <div className="flex items-center gap-2 text-xs text-foreground font-mono break-all bg-card p-2 rounded border border-border">
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
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500">{error}</div>
          )}
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-500">{success}</div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-border flex items-center justify-between">
            <Link 
              href="/admin/movies" 
              className="px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-secondary text-foreground transition-all"
            >
              Batal
            </Link>
            <button 
              onClick={handleSubmit}
              disabled={saving || uploadingVideo || !formData.title}
              className={cn(
                "px-12 py-3.5 bg-brand text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-brand/20",
                saving || uploadingVideo || !formData.title ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
              )}
            >
              {uploadingVideo ? `Mengunggah Video (${videoUploadProgress}%)` : saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          {/* Poster Preview */}
          <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm">
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest mb-4">Preview Poster</p>
            {formData.poster_url ? (
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border border-border shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getMediaUrl(formData.poster_url)} alt="Poster" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[2/3] w-full rounded-2xl bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                <Icon name="image" className="w-10 h-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-card rounded-[2rem] border border-border p-6 shadow-sm space-y-3">
            <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Info</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Film ID</span>
                <span className="font-bold text-foreground">#{filmId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Video</span>
                <span className={cn("font-bold", formData.video_id ? "text-emerald-600" : "text-red-400")}>
                  {formData.video_id ? "✓ Ada" : "✗ Belum"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trailer</span>
                <span className={cn("font-bold", formData.trailer_url ? "text-emerald-600" : "text-red-400")}>
                  {formData.trailer_url ? "✓ Ada" : "✗ Belum"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Poster</span>
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
