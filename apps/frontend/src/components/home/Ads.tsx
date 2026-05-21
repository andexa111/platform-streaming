import React from "react";

// Data dummy untuk logo iklan/partner. 
// Nantinya data ini akan di-fetch dari halaman admin/ads.
const DUMMY_ADS = [
  {
    id: 1,
    name: "Brand 1",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    id: 2,
    name: "Brand 2",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
  },
  {
    id: 3,
    name: "Brand 3",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    id: 4,
    name: "Brand 4",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  },
  {
    id: 5,
    name: "Brand 5",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg",
  },
  {
    id: 6,
    name: "Brand 6",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
  },
];

export function Ads() {
  return (
    <section className="w-full py-12 px-6 bg-background relative border-t border-border overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-10 md:gap-16">
        {DUMMY_ADS.map((ad) => (
          <div
            key={ad.id}
            className="w-[100px] md:w-[140px] flex items-center justify-center"
          >
            {/* Menggunakan tag img biasa karena next/image memerlukan konfigurasi domain di next.config.js */}
            <img
              src={ad.logoUrl}
              alt={ad.name}
              className="max-h-[40px] md:max-h-[60px] w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
