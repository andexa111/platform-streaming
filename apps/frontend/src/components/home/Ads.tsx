"use client";

import React, { useEffect, useState } from "react";

const ADS_STORAGE_KEY = "lalakon_ads_slots";

interface AdSlot {
  id: number;
  imageData: string; // base64 data URL
  active: boolean;
}

export function Ads() {
  const [ads, setAds] = useState<AdSlot[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADS_STORAGE_KEY);
      if (stored) {
        const parsed: AdSlot[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAds(parsed.filter((a) => a.active && a.imageData));
          return;
        }
      }
    } catch {
      // no-op
    }
    setAds([]);
  }, []);

  // Don't render section if no active ads with images
  if (ads.length === 0) return null;

  return (
    <section className="w-full py-12 px-6 bg-background relative border-t border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand/3 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Logos */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="w-[90px] md:w-[130px] flex items-center justify-center"
            >
              <img
                src={ad.imageData}
                alt={`Partner ${ad.id}`}
                className="max-h-[36px] md:max-h-[54px] w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
