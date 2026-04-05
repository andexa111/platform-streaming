import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-24 px-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-10">Pengaturan Profil</h1>
      
      <div className="space-y-8 bg-neutral-900/50 p-10 rounded-3xl border border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold text-neutral-900">U</div>
          <div>
            <Button variant="outline" className="h-10">Ubah Foto</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Nama Pengguna</label>
            <Input defaultValue="User Lalakon" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-400">Email</label>
            <Input defaultValue="user@example.com" disabled />
          </div>
        </div>

        <Button className="h-12 px-10 bg-white text-black font-bold">Simpan Perubahan</Button>
      </div>
    </div>
  );
}
