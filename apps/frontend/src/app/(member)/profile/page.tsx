"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/auth-store";

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  
  // Gunakan data dummy jika user belum login (untuk keperluan preview UI)
  const user = authUser || {
    name: "Pengguna Demo",
    email: "pengguna.demo@example.com",
    avatar_url: null,
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordChange = () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Harap isi semua kolom password.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    // Simulasi sukses
    setPasswordSuccess("Password berhasil diubah!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="container mx-auto py-24 px-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground mb-10 dark:text-shadow-glow">Pengaturan Profil</h1>
      
      <div className="space-y-8 bg-card/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-border shadow-2xl">
        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border">
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
            <div className="absolute -bottom-2 -right-2 bg-card border border-border rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 bg-brand rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">{user.name}</h3>
            <p className="text-muted-foreground text-sm font-medium">{user.email}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <Button variant="outline" className="h-9 px-4 rounded-xl text-muted-foreground border-border hover:bg-muted hover:text-foreground transition-all text-sm">
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
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
            <Input 
              defaultValue={user.name} 
              className="h-14 bg-background dark:bg-neutral-950/50 border-border rounded-2xl text-foreground focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all px-6"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Alamat Email</label>
            <Input 
              defaultValue={user.email} 
              disabled 
              className="h-14 bg-muted/50 border-border rounded-2xl text-muted-foreground cursor-not-allowed px-6" 
            />
            <p className="text-[10px] text-muted-foreground/60 ml-1 italic">*Email tidak dapat diubah (Tautan Google)</p>
          </div>
        </div>

        <div className="pt-6">
          <Button className="w-full md:w-auto h-14 px-12 rounded-2xl bg-brand hover:bg-brand-dark text-white font-black uppercase tracking-widest shadow-lg shadow-brand/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            Simpan Profil
          </Button>
        </div>
      </div>

      {/* Bagian Keamanan Akun */}
      <div className="mt-8 space-y-8 bg-card/40 dark:bg-neutral-900/40 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] border border-border shadow-2xl">
        <div className="pb-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Ganti Password</h2>
          <p className="text-muted-foreground text-sm mt-1">Perbarui password Anda untuk menjaga keamanan akun.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Password Saat Ini</label>
            <Input 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="h-14 bg-background dark:bg-neutral-950/50 border-border rounded-2xl text-foreground focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all px-6"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Password Baru</label>
              <Input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className="h-14 bg-background dark:bg-neutral-950/50 border-border rounded-2xl text-foreground focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all px-6"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Konfirmasi Password Baru</label>
              <Input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="h-14 bg-background dark:bg-neutral-950/50 border-border rounded-2xl text-foreground focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all px-6"
              />
            </div>
          </div>

          {passwordError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
              {passwordSuccess}
            </div>
          )}

          <div className="pt-2">
            <Button 
              onClick={handlePasswordChange}
              className="w-full md:w-auto h-14 px-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Ganti Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

