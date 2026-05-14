"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV_LINKS } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const links = NAV_LINKS.admin;

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
          "fixed top-0 left-0 h-full bg-card border-r border-border shadow-xl z-50 transition-all duration-300 transform lg:translate-x-0 lg:static",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-24" : "w-72"
        )}
      >
        <div className="flex flex-col h-full relative">
          {/* Collapse Toggle Button (Desktop Only) */}
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-blue-600 text-white rounded-full items-center justify-center shadow-lg hover:bg-blue-700 transition-all z-10"
          >
            <Icon 
              name={isCollapsed ? "chevron-right" : "chevron-left"} 
              className="w-5 h-5" 
            />
          </button>

          <div className={cn("flex flex-col h-full p-6", isCollapsed ? "items-center px-4" : "")}>
            {/* Logo Section */}
            <div className={cn(
              "flex items-center justify-between mb-10 px-2 mt-2",
              isCollapsed ? "justify-center" : ""
            )}>
              {!isCollapsed ? (
                <Link href="/admin" className="flex items-center gap-3 group" onClick={onClose}>
                  <img 
                    src="/SINEA - Logo Horisontal.webp" 
                    alt="SINEA" 
                    className="h-10 w-auto object-contain brightness-[1.6] contrast-[1.2] group-hover:scale-105 transition-transform" 
                  />
                  <span className="px-2 py-0.5 rounded-md bg-brand/5 border border-brand/10 text-[10px] font-bold text-brand uppercase tracking-widest">
                    Admin
                  </span>
                </Link>
              ) : (
                <Link href="/admin" className="flex items-center justify-center w-full" onClick={onClose}>
                  <img 
                    src="/SINEA - Logo Vertikal.webp" 
                    alt="SINEA" 
                    className="h-12 w-auto object-contain brightness-[1.6] contrast-[1.2] hover:scale-110 transition-transform" 
                  />
                </Link>
              )}
              <button 
                className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-2 relative">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center h-12 rounded-xl transition-all duration-200 group overflow-hidden",
                      isActive 
                        ? "bg-brand text-white font-bold shadow-lg shadow-brand/20" 
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                      isCollapsed ? "justify-center px-0 w-12 mx-auto" : "gap-4 px-5"
                    )}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    title={isCollapsed ? link.name : ""}
                  >
                    {/* Active Indicator */}
                    {isActive && !isCollapsed && (
                      <div className="absolute left-0 w-1.5 h-8 bg-white rounded-r-full" />
                    )}
                    
                    <Icon 
                      name={link.icon as any} 
                      className={cn(
                        "w-5 h-5 transition-transform duration-300 flex-shrink-0",
                        isActive ? "text-white scale-110" : "text-brand group-hover:scale-110"
                      )}
                    />
                    
                    {!isCollapsed && (
                      <span className="text-sm tracking-wide leading-none flex items-center">
                        {link.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className={cn("pt-6 border-t border-border", isCollapsed ? "flex justify-center" : "")}>
              <Link 
                href="/"
                className={cn(
                  "flex items-center bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all group shadow-lg shadow-red-200/50",
                  isCollapsed ? "w-12 h-12 justify-center" : "gap-3 px-5 py-3.5"
                )}
                title={isCollapsed ? "Exit Dashboard" : ""}
              >
                <Icon name="logout" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {!isCollapsed && <span className="text-sm font-bold">Exit Dashboard</span>}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
