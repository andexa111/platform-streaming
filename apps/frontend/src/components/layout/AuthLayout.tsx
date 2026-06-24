"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

interface AuthLayoutProps {
  mode: "login" | "register";
  children: React.ReactNode;
}

export default function AuthLayout({ mode, children }: AuthLayoutProps) {
  const router = useRouter();
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex bg-background selection:bg-brand/30 selection:text-foreground overflow-hidden">
      {/* TEXT PANEL */}
      <div
        className={`hidden lg:flex relative overflow-hidden bg-background ${
          isLogin 
            ? "w-1/2 animate-in fade-in slide-in-from-right-8 duration-1000" 
            : "w-1/2 order-last animate-in fade-in slide-in-from-left-8 duration-1000"
        }`}
      >
        <div className={`relative z-10 w-full h-full flex flex-col justify-start pt-28 xl:pt-40 ${isLogin ? "pl-6 xl:pl-[calc((100vw-1280px)/2+24px)] pr-16 xl:pr-24" : "pr-6 xl:pr-[calc((100vw-1280px)/2+24px)] pl-16 xl:pl-24"}`}>
          <div className={`w-full max-w-lg ${!isLogin ? "ml-auto" : ""}`}>
            {/* Logo */}
            <div className={`flex items-center gap-3 mb-12 ${!isLogin ? "justify-end" : "justify-start"}`}>
              <Image 
                src="/SINEA - Logo Horisontal.webp?v=3" 
                alt="SINEA" 
                width={200}
                height={56}
                priority
                className="h-14 w-auto object-contain dark:brightness-[1.6] brightness-[1.1] contrast-[1.2] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]" 
              />
            </div>

            {/* Headline */}
            <div className={`space-y-4 ${!isLogin ? "text-right" : "text-left"}`}>
              <h1 className="text-4xl xl:text-5xl font-bold text-foreground tracking-tight leading-tight">
                {isLogin ? "Login Sinea" : "Register Sinea"}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                A new streaming space for 
                <br />
                Visual Storytellers
              </p>
            </div>

            {/* Features */}
            <div className={`flex items-center gap-8 mt-12 ${!isLogin ? "justify-end" : "justify-start"}`}>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="play" className="w-4 h-4 text-brand" />
                Streaming Platform Exclusive
              </span>
              {/* <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                Akses kebudayaan eksklusif
              </span> */}
            </div>
          </div>
        </div>
      </div>

      {/* FORM PANEL */}
      <div
        className={`relative w-full lg:w-1/2 flex items-center justify-center sm:p-12 lg:py-5 ${!isLogin ? "order-first" : ""}`}
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
