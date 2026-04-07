"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useState, useEffect } from "react";

interface AuthLayoutProps {
  mode: "login" | "register";
  children: React.ReactNode;
}

export default function AuthLayout({ mode, children }: AuthLayoutProps) {
  const router = useRouter();
  const isLogin = mode === "login";

  /**
   * Animation strategy:
   * - On mount, panels start offset (image off-screen on their entry side, form from opposite side).
   * - After a single rAF, we transition them to their natural position.
   * - sessionStorage tracks the previous mode to determine slide direction.
   *
   * login  → [IMAGE | FORM]  — image from left, form from right
   * register → [FORM | IMAGE] — form from left, image from right
   *
   * On switch:
   *   login→register: image slides left→right path, form slides right→left path
   *   register→login: image slides right→left path, form slides left→right path
   */

  /**
   * We don't need sessionStorage. The entry animation can be purely based on the current mode!
   *
   * When mode === "login":
   *   - Final DOM: Image on Left (0%), Form on Right (50vw)
   *   - We want Image to come from Right (100%), and Form from Left (-100%)
   *
   * When mode === "register":
   *   - Final DOM: Form on Left (0%), Image on Right (50vw)
   *   - We want Image to come from Left (-100%), and Form from Right (100%)
   */
  const [phase, setPhase] = useState<"entering" | "visible">("entering");

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("visible")));
    return () => cancelAnimationFrame(id);
  }, []); // Run only on mount

  const imageInitX = phase === "entering" ? (isLogin ? "100%" : "-100%") : "0%";
  const formInitX = phase === "entering" ? (isLogin ? "-100%" : "100%") : "0%";

  const panelTransition = "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";

  const switchMode = () => router.push(isLogin ? "/register" : "/login");

  return (
    <div className="min-h-screen flex bg-white selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      {/* IMAGE PANEL */}
      <div
        className={`hidden lg:flex relative overflow-hidden bg-neutral-950 ${isLogin ? "w-1/2" : "w-1/2 order-last"}`}
        style={{
          transform: `translateX(${imageInitX})`,
          opacity: phase === "entering" ? 0 : 1,
          transition: panelTransition,
        }}
      >
        <Image src="/login_bg.png" alt="Abstract Background" fill className="object-cover opacity-60 mix-blend-luminosity grayscale scale-105 hover:scale-100 transition-transform duration-[10000ms]" priority />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />

        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16">
          {/* Logo */}
          <div className={`flex items-center gap-2 group cursor-pointer ${!isLogin ? "justify-end" : "justify-start"}`}>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
              <Icon name="film" className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">LALAKON</span>
          </div>

          {/* Headline */}
          <div className={`space-y-4 ${!isLogin ? "text-right" : "text-left"}`}>
            <h1 className="text-8xl font-black text-white leading-none tracking-tight">
              COMING <br />
              <span className="text-white/30 outline-text">SOON</span>
            </h1>
            <div className={`flex items-center gap-8 text-white/50 text-sm font-medium tracking-widest uppercase mt-8 ${!isLogin ? "justify-end" : "justify-start"}`}>
              <span>XX . XX . XX</span>
              <div className="w-12 h-px bg-white/20" />
              <span>BY ANDEXA</span>
            </div>
          </div>

          {/* Switch CTA */}
          <div className={`flex flex-col space-y-4 ${!isLogin ? "items-end text-right" : "items-start text-left"}`}>
            <p className="text-white/40 text-sm">{isLogin ? "Belum punya akun?" : "Sudah punya akun?"}</p>
            <button
              onClick={switchMode}
              className={`inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${!isLogin ? "flex-row-reverse" : ""}`}
            >
              {isLogin ? "Daftar Sekarang" : "Masuk"}
              <Icon name="arrow-right" className={`w-4 h-4 ${!isLogin ? "rotate-180" : ""}`} />
            </button>
            <div className="text-white/30 text-xs font-mono uppercase tracking-widest pt-4">Photo Credit: Lalakon Creative Studio</div>
          </div>
        </div>
      </div>

      {/* FORM PANEL */}
      <div
        className={`relative w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 ${!isLogin ? "order-first" : ""}`}
        style={{
          transform: `translateX(${formInitX})`,
          opacity: phase === "entering" ? 0 : 1,
          transition: panelTransition,
        }}
      >
        {/* Mobile: Logo (Absolute Top Left) */}
        <div className="absolute top-6 left-6 flex lg:hidden items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
            <Icon name="film" className="w-3 h-3 text-white" />
          </div>
          <span className="text-lg font-black text-neutral-900 tracking-tighter">LALAKON</span>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Form content — key forces re-mount (and re-animation) on mode switch */}
          <div key={mode} className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
            {children}
          </div>

          {/* Mobile switch link */}
          <p className="lg:hidden text-center text-sm text-neutral-500">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <Link href={isLogin ? "/register" : "/login"} className="font-bold text-brand hover:underline">
              {isLogin ? "Daftar Sekarang" : "Masuk"}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .outline-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.3);
          color: transparent;
        }
      `}</style>
    </div>
  );
}
