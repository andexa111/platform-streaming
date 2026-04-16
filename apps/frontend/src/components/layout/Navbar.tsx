"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";
import { useState, useRef, useEffect } from "react";
import { SearchOverlay } from "./SearchOverlay";

interface NavbarProps {
  variant?: "public" | "member";
}

type MembershipTier = "NONE" | "BASIC" | "STANDAR" | "PREMIUM";

const TIER_CONFIG = {
  NONE: {
    label: "Belum Berlangganan",
    color: "text-neutral-500",
    border: "border-white/10",
    bg: "bg-white/5",
    gradient: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)",
    shadow: "shadow-none",
    icon: "chess-pawn" as const,
  },
  BASIC: {
    label: "Basic Member",
    color: "text-[#E6AA68]", // Light Bronze
    border: "border-[#CD7F32]/50",
    bg: "bg-[#CD7F32]/20",
    gradient: "linear-gradient(135deg, #4A2511 0%, #CD7F32 50%, #4A2511 100%)",
    shadow: "shadow-[0_0_20px_rgba(205,127,50,0.25)]",
    icon: "chess-rook" as const,
  },
  STANDAR: {
    label: "Standar Member",
    color: "text-white", // Clearer on silver
    border: "border-[#C0C0C0]/50",
    bg: "bg-[#C0C0C0]/20",
    gradient: "linear-gradient(135deg, #333333 0%, #C0C0C0 50%, #333333 100%)",
    shadow: "shadow-[0_0_20px_rgba(192,192,192,0.25)]",
    icon: "chess-knight" as const,
  },
  PREMIUM: {
    label: "Premium Member",
    color: "text-white", // Clearer on gold
    border: "border-[#FFD700]/50",
    bg: "bg-[#FFD700]/25",
    gradient: "linear-gradient(135deg, #5F4B0B 0%, #FFD700 50%, #5F4B0B 100%)",
    shadow: "shadow-[0_0_25px_rgba(255,215,0,0.35)]",
    icon: "chess-queen" as const,
  },
};

function Navbar({ variant = "public" }: NavbarProps) {
  const links = NAV_LINKS[variant];

  // Mock membership tier - this would normally come from an auth context or API
  const [membershipTier, setMembershipTier] = useState<MembershipTier>("PREMIUM");

  const currentTier = TIER_CONFIG[membershipTier];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          {/* Left Section: Mobile Hamburger & Desktop Logo */}
          <div className="flex items-center flex-1 md:flex-none">
            <button className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
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
                  <Link key={link.href} href={link.href} className={`relative py-1 transition-colors ${isActive ? "text-white font-bold" : "text-neutral-400 hover:text-white"}`}>
                    {link.name}
                    {isActive && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-brand rounded-full shadow-[0_0_10px_var(--tw-colors-brand)] animate-pulse" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            {variant === "public" ? (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="text-sm font-medium bg-brand text-white px-5 py-2.5 rounded-full hover:bg-brand-dark transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(2,77,148,0.2)]">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Search Trigger */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all hover:scale-105 active:scale-95"
                  aria-label="Search"
                >
                  <Icon name="search" className="w-5 h-5" />
                </button>

                <div ref={profileRef} className="relative group">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`w-10 h-10 rounded-full bg-neutral-900 border-2 ${currentTier.border} flex items-center justify-center hover:brightness-125 transition-all cursor-pointer shadow-lg overflow-hidden`}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                      <Icon name="user" className={`w-5 h-5 ${currentTier.color}`} />
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <div
                    className={`absolute right-0 top-full mt-3 w-64 bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 z-50 p-4 ${
                      isProfileOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible md:group-hover:opacity-100 md:group-hover:visible md:group-hover:translate-y-2"
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Membership Status Section */}
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest pl-1">Status Membership</label>

                        {membershipTier === "NONE" ? (
                          <div className="p-4 rounded-xl bg-brand/10 border border-brand/20 space-y-3">
                            <p className="text-xs text-neutral-300 leading-relaxed font-medium">Nikmati akses tak terbatas ke semua konten premium kami.</p>
                            <Link href="/pricing" className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition-all shadow-lg shadow-brand/20">
                              Langganan Sekarang
                              <Icon name="arrow-right" className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ) : (
                          <div className={`relative p-4 rounded-xl border ${currentTier.border} ${currentTier.shadow} flex items-center gap-4 overflow-hidden group/card`} style={{ backgroundImage: currentTier.gradient }}>
                            {/* Gloss/Reflection Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 pointer-events-none" />

                            <div className={`relative z-10 w-11 h-11 rounded-full bg-black/30 border border-white/20 flex items-center justify-center shadow-lg`}>
                              {currentTier.icon && <Icon name={currentTier.icon} className={`w-6 h-6 ${membershipTier === "NONE" ? "text-neutral-500" : "text-white"} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`} />}
                            </div>
                            <div className="relative z-10 flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
                              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-0.5">Membership</p>
                              <p className={`text-[11px] font-black text-white tracking-tight drop-shadow-md whitespace-nowrap`}>{currentTier.label}</p>
                              {membershipTier !== "NONE" && <p className="text-[9px] text-white/40 font-bold mt-1.5 uppercase tracking-widest">Expires 12/2026</p>}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-white/5 mx-1" />

                      {/* Utility Links */}
                      <div className="space-y-1">
                        <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                          <Icon name="settings" className="w-4 h-4" />
                          Pengaturan Akun
                        </Link>

                        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                          <Icon name="logout" className="w-4 h-4" />
                          Log Out
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-brand border-b border-white/10 py-3 px-2 flex flex-col gap-1 absolute top-20 left-0 w-full shadow-2xl z-40 animate-in slide-in-from-top-2 duration-300">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const iconName = link.name === "Home" ? "compass" : link.name === "Movies & Shows" ? "film" : link.name === "My List" ? "star" : "play";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? "bg-white/15 text-white font-bold" : "text-white/80 hover:text-white hover:bg-white/10 font-medium"}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name={iconName as any} className="w-4 h-4" />
                  <div className="flex-1">{link.name}</div>
                </Link>
              );
            })}

            {variant === "public" && (
              <div className="flex flex-col gap-2 mt-2 px-2">
                <Link href="/login" className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-white border border-white/20 hover:bg-white/10 rounded-xl transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-brand bg-white hover:bg-white/90 rounded-xl transition-all shadow-lg shadow-black/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Search Overlay - Moved outside the filtered <nav> to fix stacking context blur issue */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} />
    </>
  );
}

export default Navbar;
