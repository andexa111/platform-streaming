"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth-store";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="container mx-auto py-24 px-6 text-center">
        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-400">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-10 text-shadow-glow">Pengaturan Profil</h1>
      
      <div className="space-y-8 bg-neutral-900/40 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-white/5">
          <div className="relative group">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="w-24 h-24 rounded-3xl object-cover ring-2 ring-brand/50 shadow-2xl transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-brand/20 flex items-center justify-center text-4xl font-black text-brand ring-2 ring-brand/50 shadow-2xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-neutral-900 border border-white/10 rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 bg-brand rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{user.name}</h3>
            <p className="text-neutral-400 text-sm font-medium">{user.email}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <Button variant="outline" className="h-9 px-4 rounded-xl text-neutral-300 border-white/10 hover:bg-white/5 hover:text-white transition-all text-sm">
                Ganti Avatar
              </Button>
              <div className="px-3 py-1.5 rounded-lg bg-brand/10 border border-brand/20 text-brand text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                 Google Account Linked
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
            <Input 
              defaultValue={user.name} 
              className="h-14 bg-neutral-950/50 border-white/5 rounded-2xl text-white focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all px-6"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] ml-1">Alamat Email</label>
            <Input 
              defaultValue={user.email} 
              disabled 
              className="h-14 bg-neutral-950/20 border-white/5 rounded-2xl text-neutral-500 cursor-not-allowed px-6" 
            />
            <p className="text-[10px] text-neutral-600 ml-1 italic">*Email tidak dapat diubah (Tautan Google)</p>
          </div>
        </div>

        <div className="pt-6">
          <Button className="w-full md:w-auto h-14 px-12 rounded-2xl bg-brand hover:bg-brand-dark text-white font-black uppercase tracking-widest shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </div>
  );
}

