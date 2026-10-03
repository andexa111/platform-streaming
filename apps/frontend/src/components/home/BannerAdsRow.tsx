"use client";

import React, { useEffect, useState } from "react";
import { api, getMediaUrl } from "@/lib/api";

interface BannerAd {
  id: number;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
}

export function BannerAdsRow() {
  const [banners, setBanners] = useState<BannerAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveBanners = async () => {
      try {
        const res = await api.get("/banner-ad/active");
        setBanners(res.data || []);
      } catch (err) {
        console.error("Gagal mengambil banner ads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveBanners();
  }, []);

  if (loading || banners.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
      {banners.map((banner) => {
        const BannerContent = (
          <div className="w-full relative rounded-2xl md:rounded-[2rem] overflow-hidden border border-border bg-card shadow-lg aspect-[21/9] sm:aspect-[7/2] md:aspect-[8/2] max-h-[140px] md:max-h-[180px] group transition-all duration-300 hover:border-brand/40">
            {/* Overlay Tag "AD" */}
            <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white/80 border border-white/10 pointer-events-none select-none">
              IKLAN / AD
            </div>
            
            <img
              src={getMediaUrl(banner.image_url)}
              alt={banner.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        );

        if (banner.link_url) {
          return (
            <a
              key={banner.id}
              href={banner.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block cursor-pointer"
            >
              {BannerContent}
            </a>
          );
        }

        return <div key={banner.id}>{BannerContent}</div>;
      })}
    </div>
  );
}
