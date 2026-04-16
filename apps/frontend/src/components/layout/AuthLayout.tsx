"use client";

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

  const [phase, setPhase] = useState<"entering" | "visible">("entering");

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("visible")));
    return () => cancelAnimationFrame(id);
  }, []);

  const imageInitX = phase === "entering" ? (isLogin ? "100%" : "-100%") : "0%";
  const formInitX = phase === "entering" ? (isLogin ? "-100%" : "100%") : "0%";

  const panelTransition = "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div className="min-h-screen flex bg-neutral-950 selection:bg-brand/30 selection:text-white overflow-hidden">
      {/* TEXT PANEL */}
      <div
        className={`hidden lg:flex relative overflow-hidden bg-neutral-950 ${isLogin ? "w-1/2" : "w-1/2 order-last"}`}
        style={{
          transform: `translateX(${imageInitX})`,
          opacity: phase === "entering" ? 0 : 1,
          transition: panelTransition,
        }}
      >
        <div className={`relative z-10 w-full h-full flex flex-col justify-start pt-28 xl:pt-40 ${isLogin ? "pl-6 xl:pl-[calc((100vw-1280px)/2+24px)] pr-16 xl:pr-24" : "pr-6 xl:pr-[calc((100vw-1280px)/2+24px)] pl-16 xl:pl-24"}`}>
          <div className={`w-full max-w-lg ${!isLogin ? "ml-auto" : ""}`}>
            {/* Logo */}
            <div className={`flex items-center gap-3 mb-12 ${!isLogin ? "justify-end" : "justify-start"}`}>
              <div className="w-8 h-8 rounded-md bg-brand/20 flex items-center justify-center">
                <Icon name="film" className="w-4 h-4 text-brand" />
              </div>
              <span className="text-3xl font-black text-brand tracking-tighter">LALAKON</span>
            </div>

            {/* Headline */}
            <div className={`space-y-4 ${!isLogin ? "text-right" : "text-left"}`}>
              <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-tight">
                Temukan pesona seni <br />
                budaya Kudus.
              </h1>
              <p className="text-neutral-400 text-lg leading-relaxed mt-4">
                Ribuan mahakarya video tari, teater, dan tradisi lokal.
                <br />
                Jelajahi kekayaan budaya Kudus dalam satu platform.
              </p>
            </div>

            {/* Features */}
            <div className={`flex items-center gap-8 mt-12 ${!isLogin ? "justify-end" : "justify-start"}`}>
              <span className="flex items-center gap-2 text-sm text-neutral-500">
                <Icon name="play" className="w-4 h-4 text-brand" />
                Streaming tanpa batas
              </span>
              <span className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                Akses kebudayaan eksklusif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FORM PANEL */}
      <div
        className={`relative w-full lg:w-1/2 flex items-start justify-center sm:p-12 lg:py-5 ${!isLogin ? "order-first" : ""}`}
        style={{
          transform: `translateX(${formInitX})`,
          opacity: phase === "entering" ? 0 : 1,
          transition: panelTransition,
        }}
      >
        <div className="w-full">
          <div key={mode} className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
