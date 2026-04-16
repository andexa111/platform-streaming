import React from "react";
import { Button } from "@/components/ui/Button";

export default function MembershipPage() {
  return (
    <div className="container mx-auto py-24 px-6 text-center max-w-2xl">
      <h1 className="text-4xl font-bold text-white mb-6 tracking-tight">Upgrade ke Premium</h1>
      <p className="text-neutral-400 mb-8">Dapatkan akses tak terbatas ke semua film dan fitur premium lainnya selamanya.</p>
      
      <div className="bg-neutral-900 border border-emerald-500/20 p-8 rounded-2xl">
        <h2 className="text-emerald-400 font-bold mb-2">Paket Bulanan</h2>
        <p className="text-3xl font-black text-white mb-6">Rp 49.000 / Bln</p>
        <Button className="w-full h-12 bg-emerald-500 text-neutral-950 font-bold hover:bg-emerald-400">Pilih Paket</Button>
      </div>
    </div>
  );
}
