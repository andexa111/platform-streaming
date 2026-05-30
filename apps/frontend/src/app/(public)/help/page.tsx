"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { Icon } from "@/components/ui/Icon";
import { api } from "@/lib/api";

export default function HelpPage() {
  const { user: authUser } = useAuthStore();
  
  // Gunakan data dummy untuk sementara sampai ada validasi login
  const user = authUser || {
    name: "Pengguna Demo",
    email: "pengguna.demo@example.com",
  };

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async () => {
    if (!message.trim()) {
      setError("Pesan tidak boleh kosong.");
      return;
    }
    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      await api.post("/support", {
        name: user.name,
        email: user.email,
        message: message.trim(),
      });
      setSuccess(true);
      setMessage("");
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message || 
        "Gagal mengirim laporan. Silakan coba lagi beberapa saat lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-24 px-6 max-w-3xl min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">Pusat Bantuan</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Punya kendala, kritik, atau saran? Jangan ragu untuk menghubungi kami. 
          Pesan Anda akan langsung dikirimkan ke tim support kami via Email.
        </p>
      </div>

      <div className="bg-card/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-border shadow-2xl">
        <div className="space-y-6">
          
          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
              <Icon name="check" className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Laporan Anda telah berhasil terkirim via email ke Sinea Support!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nama</label>
              <div className="h-14 flex items-center bg-muted/50 border border-border rounded-2xl text-muted-foreground px-6 font-medium">
                {user.name}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="h-14 flex items-center bg-muted/50 border border-border rounded-2xl text-muted-foreground px-6 font-medium">
                {user.email}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Pesan / Laporan</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tuliskan keluhan, kritik, atau saran Anda di sini..."
              className="w-full min-h-[200px] bg-background dark:bg-neutral-950/50 border border-border rounded-2xl text-foreground focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all p-6 resize-y outline-none"
              disabled={loading}
            ></textarea>
            {error && <p className="text-red-500 text-sm ml-1 mt-1">{error}</p>}
          </div>

          <div className="pt-6">
            <Button 
              onClick={handleEmailSubmit}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-brand hover:bg-brand-dark text-white font-black uppercase tracking-widest shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Mengirim..." : "Kirim"}</span>
              {!loading && <Icon name="arrow-right" className="w-5 h-5" />}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
