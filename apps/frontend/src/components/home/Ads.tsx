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
            className="w-[100px] md:w-[140px] flex items-center justify-center"
          >
            <img
              src={getMediaUrl(ad.logo_url)}
              alt={ad.name || `Partner ${ad.slot}`}
              className="max-h-[40px] md:max-h-[60px] w-auto object-contain brightness-95 hover:brightness-110 transition-all duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
