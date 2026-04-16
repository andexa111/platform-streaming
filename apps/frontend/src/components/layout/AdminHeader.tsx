import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV_LINKS } from "@/config/navigation";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find current link name for breadcrumbs/title
  const currentLink = NAV_LINKS.admin.find((link) => link.href === pathname);
  const pageTitle = currentLink ? currentLink.name : "Dashboard";

  return (
    <header className="sticky top-0 z-30 w-full h-20 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between px-6 lg:px-8 shadow-sm">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-900 transition-colors" onClick={onMenuClick}>
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-medium hidden sm:inline">Pages</span>
          <span className="text-neutral-500 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-wide">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Vertical Divider */}
        <div className="w-px h-6 bg-neutral-200 hidden sm:block" />

        {/* Admin Profile Section */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 pl-2 group transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-neutral-900 group-hover:text-brand transition-colors">Super Admin</p>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Administrator</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${isProfileOpen ? "bg-brand text-white" : "bg-brand/5 border border-brand/10 text-brand"}`}>
              <Icon name="user" className="w-5 h-5" />
            </div>
          </button>

          {/* Profile Dropdown */}
          <div
            className={cn(
              "absolute right-0 top-full mt-3 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl transition-all duration-200 z-50 p-2",
              isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2",
            )}
          >
            <div className="space-y-1">
              <div className="h-px bg-neutral-100 mx-1 my-1" />

              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold bg-red-500 text-white hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-100"
                onClick={() => {
                  setIsProfileOpen(false);
                  // Add actual logout logic here later if needed
                  window.location.href = "/";
                }}
              >
                <Icon name="logout" className="w-4 h-4" />
                Keluar (Log Out)
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
