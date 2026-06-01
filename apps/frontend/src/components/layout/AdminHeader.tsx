import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NAV_LINKS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

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

  // Find current link name for breadcrumbs/title across both admin and superadmin menus
  const allAdminLinks = [...NAV_LINKS.adminBasic, ...NAV_LINKS.adminSuper];
  const currentLink = allAdminLinks.find((link) => link.href === pathname);
  const pageTitle = currentLink ? currentLink.name : "Dashboard";

  return (
    <header className="sticky top-0 z-30 w-full h-20 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 lg:px-8 shadow-sm">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors" onClick={onMenuClick}>
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-black text-xs uppercase tracking-widest hidden sm:inline">Pages</span>
          <span className="text-muted-foreground hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-black text-foreground tracking-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-4 sm:gap-6">
        <ThemeToggle />
        
        {/* Vertical Divider */}
        <div className="w-px h-6 bg-border hidden sm:block" />

        {/* Admin Profile Section */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 pl-2 group transition-all">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-foreground group-hover:text-brand transition-colors">
                {user?.name || (user?.role === 'superadmin' ? 'Super Admin' : 'Admin')}
              </p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {user?.role === 'superadmin' ? 'Superadministrator' : 'Administrator'}
              </p>
            </div>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm group-hover:scale-105 active:scale-95",
              isProfileOpen 
                ? "bg-brand/90 text-white" 
                : "bg-brand text-white border border-brand/20 group-hover:bg-brand/90"
            )}>
              <Icon name="user" className="w-5 h-5" />
            </div>
          </button>

          {/* Profile Dropdown */}
          <div
            className={cn(
              "absolute right-0 top-full mt-3 w-56 bg-card border border-border rounded-2xl shadow-xl transition-all duration-200 z-50 p-2",
              isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2",
            )}
          >
            <div className="space-y-1">
              <Link
                href="/home"
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"
                onClick={() => setIsProfileOpen(false)}
              >
                <Icon name="compass" className="w-4 h-4" />
                Halaman User
              </Link>

              <div className="h-px bg-border mx-1 my-2" />

              <button
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                onClick={() => {
                  setIsProfileOpen(false);
                  useAuthStore.getState().logout();
                  window.location.href = "/";
                }}
              >
                <Icon name="logout" className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
