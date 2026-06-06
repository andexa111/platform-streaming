"use client";

import React, { useEffect, useState } from "react";
import { api, getMediaUrl } from "@/lib/api";

interface PartnerLogo {
  id: number;
  name: string;
  logo_url: string;
  slot: number;
  is_active: boolean;
}

export function Ads() {
  const [ads, setAds] = useState<PartnerLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerLogos = async () => {
      try {
        const res = await api.get("/partner-logos");
        setAds(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil data logo partner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerLogos();
  }, []);

  if (loading || ads.length === 0) return null;

  return (
    <section className="w-full py-12 px-6 bg-background relative border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/3 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-10 md:gap-16 relative z-10">
        {ads.map((ad) => (
          <div
            key={ad.id}
            className="w-[120px] md:w-[160px] h-[80px] md:h-[100px] flex items-center justify-center relative group"
          >
            {/* Ambient Background Glow (Multi-layered for rich depth) */}
            <div className="absolute w-[130%] h-[130%] bg-brand/20 dark:bg-brand/30 rounded-full blur-2xl opacity-50 group-hover:opacity-85 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
            <div className="absolute w-[80%] h-[80%] bg-blue-500/15 dark:bg-cyan-500/20 rounded-full blur-xl opacity-40 group-hover:opacity-90 group-hover:scale-125 transition-all duration-500 pointer-events-none" />

            <img
              src={getMediaUrl(ad.logo_url)}
              alt={ad.name || `Partner ${ad.slot}`}
              className="relative z-10 max-h-[44px] md:max-h-[64px] max-w-[85%] w-auto object-contain transition-all duration-500
                brightness-90 dark:brightness-100 
                hover:scale-110 hover:brightness-110
                drop-shadow-[0_0_10px_rgba(2,77,148,0.35)] 
                dark:drop-shadow-[0_0_16px_rgba(59,130,246,0.5)]
                group-hover:drop-shadow-[0_0_20px_rgba(2,77,148,0.6)]
                dark:group-hover:drop-shadow-[0_0_28px_rgba(59,130,246,0.8)]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
