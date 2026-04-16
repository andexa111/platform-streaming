"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV_LINKS } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const links = NAV_LINKS.admin;
  
  // Find the index of the active link to calculate the position of the moving background
  const activeIndex = links.findIndex((link) => link.href === pathname);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-full w-72 bg-white border-r border-neutral-200 shadow-xl z-50 transition-transform duration-300 transform lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-10 px-2 mt-2">
            <Link href="/admin" className="flex items-center gap-2" onClick={onClose}>
              <span className="text-2xl font-black bg-gradient-to-r from-brand via-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tighter">
                LALAKON
              </span>
              <span className="px-2 py-0.5 rounded-md bg-brand/5 border border-brand/10 text-[10px] font-bold text-brand uppercase tracking-widest">
                Admin
              </span>
            </Link>
            <button 
              className="lg:hidden p-2 text-neutral-400 hover:text-neutral-900"
              onClick={onClose}
            >
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2 relative">
            {/* Navigasi - Background & Indikator kini menyatu di dalam Link untuk centering presisi */}

            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-4 px-5 h-12 rounded-xl transition-all duration-200 group overflow-hidden",
                    isActive 
                      ? "bg-brand text-white font-bold shadow-lg shadow-brand/20" 
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                  )}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  {/* Indikator Putih Tebal (Pasti Center secara Vertikal) */}
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full" />
                  )}
                  <Icon 
                    name={link.icon as any} 
                    className={cn(
                      "w-5 h-5 transition-transform duration-300 flex-shrink-0",
                      isActive ? "text-white scale-110" : "group-hover:scale-110"
                    )}
                  />
                  <span className="text-sm tracking-wide leading-none flex items-center">
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="pt-6 border-t border-neutral-200">
            <Link 
              href="/"
              className="flex items-center gap-3 px-5 py-3.5 bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all group shadow-lg shadow-red-200/50"
            >
              <Icon name="logout" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold">Exit Dashboard</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
