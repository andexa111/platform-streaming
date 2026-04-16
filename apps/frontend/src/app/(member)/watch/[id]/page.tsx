import React from "react";
import { Button } from "@/components/ui/Button";

// Renamed and moved to /(member)/watch/[id]/page.tsx to resolve routing conflict with (public)/movies/[id]
export default function WatchPage({ params }: { params: { id: string } }) {
  return (
    <div className="bg-neutral-950 min-h-screen text-white pt-24 pb-32">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-video bg-neutral-900 rounded-3xl border border-white/5 flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Player Video Lalakon</h2>
            <p className="text-neutral-500 mb-8 max-w-md">Anda sedang menonton film ID: <span className="text-emerald-400">{params.id}</span>. Dapatkan pengalaman menonton terbaik dengan akses Premium.</p>
            <Button className="h-12 px-10 bg-emerald-500 text-neutral-950 font-black hover:bg-emerald-400">Play Video Now</Button>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black">Streaming Movie — ID: {params.id}</h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl">
              Sinopsis film ini belum tersedia. Tim Lalakon sedang menyiapkan deskripsi terbaik untuk pengalaman hiburan Anda.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold border-l-4 border-emerald-500 pl-4 uppercase tracking-widest text-neutral-400">Similar Content</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer group">
                <div className="w-24 h-32 bg-neutral-800 rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform" />
                <div className="space-y-2 py-2">
                  <div className="h-4 w-32 bg-neutral-800 rounded group-hover:bg-neutral-700 transition-colors" />
                  <div className="h-3 w-48 bg-neutral-800/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
