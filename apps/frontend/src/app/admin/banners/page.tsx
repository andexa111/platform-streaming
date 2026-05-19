"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface Film {
  id: number;
  title: string;
  poster_url: string | null;
  trailer_url: string | null;
  video_id: string | null;
  clip_start: number | null;
  clip_end: number | null;
}

interface FeaturedItem {
  id: number;
  filmId: number;
  position: number;
  film: Film;
}

export default function BannersPage() {
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFilmId, setSelectedFilmId] = useState("");
  const [clipStart, setClipStart] = useState("");
  const [clipEnd, setClipEnd] = useState("");
  const [editingClipFilmId, setEditingClipFilmId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [featRes, filmRes] = await Promise.all([
        api.get("/featured-films"),
        api.get("/films/admin/all?limit=100"),
      ]);
      setFeatured(featRes.data);
      setAllFilms(filmRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const addFilm = () => {
    if (!selectedFilmId) return;
    const filmId = Number(selectedFilmId);
    if (featured.some((f) => f.filmId === filmId)) return;
    if (featured.length >= 10) return;

    const film = allFilms.find((f) => f.id === filmId);
    if (!film) return;

    setFeatured([
      ...featured,
      {
        id: 0,
        filmId: film.id,
        position: featured.length + 1,
        film,
      },
    ]);
    setSelectedFilmId("");
  };

  const removeFilm = (filmId: number) => {
    setFeatured(featured.filter((f) => f.filmId !== filmId).map((f, i) => ({ ...f, position: i + 1 })));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...featured];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    setFeatured(items.map((f, i) => ({ ...f, position: i + 1 })));
  };

  const moveDown = (index: number) => {
    if (index === featured.length - 1) return;
    const items = [...featured];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setFeatured(items.map((f, i) => ({ ...f, position: i + 1 })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/featured-films", {
        items: featured.map((f) => ({ filmId: f.filmId, position: f.position })),
      });
      alert("Banners berhasil disimpan!");
      fetchData();
    } catch (err) {
      console.error("Failed to save", err);
      alert("Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClip = async () => {
    if (!editingClipFilmId) return;
    try {
      await api.patch(`/films/${editingClipFilmId}/clip`, {
        clip_start: Number(clipStart),
        clip_end: Number(clipEnd),
      });
      setEditingClipFilmId(null);
      setClipStart("");
      setClipEnd("");
      fetchData();
    } catch (err) {
      console.error("Failed to save clip", err);
    }
  };

  const availableFilms = allFilms.filter((f) => !featured.some((ff) => ff.filmId === f.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Banners</h1>
          <p className="text-muted-foreground mt-1">Kelola banner 5-10 film pilihan yang tampil di hero section homepage ({featured.length}/10)</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || featured.length < 1}
          className="bg-brand hover:brightness-110 text-white font-bold rounded-xl h-12 px-6 gap-2 disabled:opacity-50"
        >
          <Icon name="save" className="w-5 h-5" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {/* Add Film */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-foreground mb-4">Tambah Film ke Banner</h3>
        <div className="flex gap-3">
          <select
            value={selectedFilmId}
            onChange={(e) => setSelectedFilmId(e.target.value)}
            className="flex-1 h-12 rounded-xl bg-muted/50 border border-border px-4 text-foreground"
          >
            <option value="">Pilih film...</option>
            {availableFilms.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
          <Button onClick={addFilm} disabled={!selectedFilmId || featured.length >= 10}
            className="bg-brand text-white font-bold rounded-xl h-12 px-6">
            Tambah
          </Button>
        </div>
      </div>

      {/* Featured Films List */}
      <div className="space-y-3">
        {featured.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-muted-foreground">Belum ada banner. Tambahkan film dari daftar di atas.</p>
          </div>
        ) : featured.map((item, index) => (
          <div key={item.filmId} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-5 group hover:border-brand/30 transition-all">
            {/* Position Badge */}
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
              <span className="text-brand font-black text-lg">#{item.position}</span>
            </div>

            {/* Poster */}
            <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
              {item.film.poster_url && (
                <img src={item.film.poster_url} alt={item.film.title} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-foreground truncate">{item.film.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Clip: {item.film.clip_start != null ? `${item.film.clip_start}s — ${item.film.clip_end}s` : "Belum diatur"}
              </p>
            </div>

            {/* Clip Edit */}
            {editingClipFilmId === item.filmId ? (
              <div className="flex items-center gap-2">
                <Input type="number" value={clipStart} onChange={(e) => setClipStart(e.target.value)}
                  placeholder="Start (detik)" className="w-28 h-10 bg-muted/50 border-border text-sm" />
                <span className="text-muted-foreground">—</span>
                <Input type="number" value={clipEnd} onChange={(e) => setClipEnd(e.target.value)}
                  placeholder="End (detik)" className="w-28 h-10 bg-muted/50 border-border text-sm" />
                <button onClick={handleSaveClip} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20">
                  <Icon name="check" className="w-4 h-4 text-emerald-500" />
                </button>
                <button onClick={() => setEditingClipFilmId(null)} className="p-2 rounded-lg hover:bg-muted">
                  <Icon name="x" className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingClipFilmId(item.filmId);
                  setClipStart(item.film.clip_start != null ? String(item.film.clip_start) : "");
                  setClipEnd(item.film.clip_end != null ? String(item.film.clip_end) : "");
                }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Edit clip highlight"
              >
                <Icon name="edit" className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            {/* Move / Delete Controls */}
            <div className="flex items-center gap-1">
              <button onClick={() => moveUp(index)} disabled={index === 0}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-30">
                <Icon name="chevron-left" className="w-4 h-4 text-muted-foreground rotate-90" />
              </button>
              <button onClick={() => moveDown(index)} disabled={index === featured.length - 1}
                className="p-2 rounded-lg hover:bg-muted disabled:opacity-30">
                <Icon name="chevron-right" className="w-4 h-4 text-muted-foreground rotate-90" />
              </button>
              <button onClick={() => removeFilm(item.filmId)}
                className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                <Icon name="trash" className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
