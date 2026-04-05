"use client";
import Link from "next/link";
import { NAV_LINKS } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";

interface NavbarProps {
  variant?: "public" | "member";
}

function Navbar({ variant = "public" }: NavbarProps) {
  const links = NAV_LINKS[variant];

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={variant === "member" ? "/home" : "/"} className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-teal-400 via-emerald-400 to-emerald-600 bg-clip-text text-transparent tracking-tighter">LALAKON</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {variant === "public" ? (
            <>
              <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center hover:bg-neutral-800 transition-colors">
                <Icon name="Search" className="w-5 h-5 text-neutral-400" />
              </button>
              <Link href="/profile" className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-all">
                <Icon name="User" className="w-5 h-5 text-emerald-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

