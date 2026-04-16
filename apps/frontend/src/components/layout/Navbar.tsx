"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";
import { useState, useRef, useEffect } from "react";

interface NavbarProps {
  variant?: "public" | "member";
}

function Navbar({ variant = "public" }: NavbarProps) {
  const links = NAV_LINKS[variant];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
        
        {/* Left Section: Mobile Hamburger & Desktop Logo */}
        <div className="flex items-center flex-1 md:flex-none">
          <button 
            className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? "x" : "menu"} className="w-6 h-6" />
          </button>
          
          <Link href={variant === "member" ? "/home" : "/"} className="hidden md:flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-brand via-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tighter">LALAKON</span>
          </Link>
        </div>

        {/* Center Section: Desktop Menu & Mobile Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          {/* Mobile Logo */}
          <Link href={variant === "member" ? "/home" : "/"} className="md:hidden flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-brand via-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tighter">LALAKON</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`relative py-1 transition-colors ${isActive ? "text-white font-bold" : "text-neutral-400 hover:text-white"}`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-brand rounded-full shadow-[0_0_10px_var(--tw-colors-brand)] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
        
        {/* Right Section: Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {variant === "public" ? (
            <>
              <Link href="/login" className="hidden md:block text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium bg-brand text-white px-5 py-2.5 rounded-full hover:bg-brand-dark transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(2,77,148,0.2)]">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* Search Component */}
              <div ref={searchRef} className="relative flex items-center">
                {/* Expanded Search Input */}
                <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                  isSearchOpen 
                    ? "w-56 bg-neutral-900 border border-white/10 rounded-full px-4 py-2 shadow-lg shadow-black/20" 
                    : "w-10"
                }`}>
                  <button
                    className={`flex-shrink-0 transition-colors ${isSearchOpen ? "text-brand" : "w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white"}`}
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <Icon name="search" className="w-4 h-4" />
                  </button>

                  {isSearchOpen && (
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") { setIsSearchOpen(false); setSearchQuery(""); }
                        if (e.key === "Enter" && searchQuery.trim()) {
                          // handle search here
                        }
                      }}
                      placeholder="Search movies..."
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-500 outline-none min-w-0"
                    />
                  )}

                  {isSearchOpen && searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="flex-shrink-0 text-neutral-500 hover:text-white transition-colors"
                    >
                      <Icon name="x" className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="relative group">
                <Link href="/profile" className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center hover:bg-brand/20 transition-all cursor-pointer">
                  <Icon name="user" className="w-5 h-5 text-brand" />
                </Link>

                {/* Profile Overlay */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-brand/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-3 group-hover:translate-y-0 p-3 z-50">
                  <div className="px-3 py-3 border-b border-white/5 mb-2">
                    <p className="text-sm font-bold text-white">Lalakon User</p>
                    <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-brand/10 border border-brand/20">
                      <Icon name="crown" className="w-3 h-3 text-brand" />
                      <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Premium Member</span>
                    </div>
                  </div>
                  
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Icon name="user" className="w-4 h-4" />
                    My Profile
                  </Link>
                  
                  <Link href="/billing" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    <Icon name="ticket" className="w-4 h-4" />
                    Subscription
                  </Link>

                  <div className="h-px bg-white/5 my-2" />

                  <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                    <Icon name="logout" className="w-4 h-4" />
                    Log Out
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-neutral-950/95 backdrop-blur-md border-b border-white/5 py-4 px-6 flex flex-col gap-4 absolute top-20 left-0 w-full shadow-xl">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${isActive ? "bg-brand/10 text-brand font-bold border border-brand/20 shadow-[0_0_15px_rgba(2,77,148,0.1)]" : "text-neutral-400 hover:text-white hover:bg-white/5 font-medium"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex-1">{link.name}</div>
                {isActive && <Icon name="chevron-right" className="w-4 h-4 text-brand animate-pulse" />}
              </Link>
            );
          })}
          {variant === "public" && (
            <Link 
              href="/login" 
              className="text-neutral-400 hover:text-white py-2 font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;

