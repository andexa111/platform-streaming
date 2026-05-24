"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/config/navigation";
import { useAuthStore } from "@/lib/auth-store";

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const links = user?.role === 'superadmin' ? NAV_LINKS.adminSuper : NAV_LINKS.adminBasic;

  // Filter out the home link since we're already here
  const shortcuts = links.filter(link => link.href !== "/admin");

  return (
    <div className="space-y-12 py-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-foreground tracking-tight uppercase italic">
          Dashboard <span className="text-brand">Control</span>
        </h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
          Selamat datang kembali, Admin. Pilih menu untuk mulai mengelola platform.
        </p>
      </div>

      {/* Shortcut Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {shortcuts.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="group relative bg-card p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col items-center text-center gap-4"
          >
            {/* Background Decorative Glow */}
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-brand blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
            
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-brand flex items-center justify-center text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner">
              <Icon name={item.icon as any} className="w-8 h-8" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xs font-black text-foreground uppercase italic tracking-widest group-hover:text-brand transition-colors">
                {item.name}
              </h3>
            </div>

            {/* Micro Indicator */}
            <div className="w-1 h-1 rounded-full bg-brand opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}

      </div>
    </div>
  );
}
