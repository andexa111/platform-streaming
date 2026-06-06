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
            className="w-[140px] md:w-[180px] h-[80px] md:h-[100px] flex items-center justify-center relative group bg-neutral-500/[0.03] dark:bg-white/[0.02] border border-neutral-500/[0.08] dark:border-white/[0.05] rounded-3xl p-4 transition-all duration-500 hover:bg-neutral-500/[0.06] dark:hover:bg-white/[0.04] hover:border-brand/20 dark:hover:border-brand/30"
          >
            {/* Ambient Background Glow on Hover */}
            <div className="absolute w-[120%] h-[120%] bg-brand/10 dark:bg-brand/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none" />

            <img
              src={getMediaUrl(ad.logo_url)}
              alt={ad.name || `Partner ${ad.slot}`}
              className="relative z-10 max-h-[44px] md:max-h-[60px] max-w-[90%] w-auto object-contain transition-all duration-500
                brightness-95 dark:brightness-100 hover:scale-105
                drop-shadow-[0_0_1.5px_rgba(0,0,0,0.55)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.06)]
                dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
