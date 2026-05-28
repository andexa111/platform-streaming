"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

// ─── Animated particle background ───────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }[] = [];

    const colors = [
      "rgba(2, 77, 148, 0.5)",
      "rgba(59, 130, 246, 0.3)",
      "rgba(255, 255, 255, 0.12)",
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.05,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // Connection lines
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(2, 77, 148, ${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function ComingSoon() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="relative min-h-screen bg-neutral-950 text-white overflow-hidden flex flex-col">
      <ParticleCanvas />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand/12 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-600/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-[250px] h-[250px] bg-cyan-500/6 blur-[100px] rounded-full pointer-events-none" />

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div
          className={`text-center space-y-8 transition-all duration-1000 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Animated ring behind the title */}
          <div className="relative inline-block">
            {/* Spinning orbital ring */}
            <div className="absolute -inset-16 md:-inset-24 pointer-events-none">
              <div className="w-full h-full rounded-full border border-white/[0.03] animate-[spin_25s_linear_infinite]" />
            </div>
            <div className="absolute -inset-10 md:-inset-16 pointer-events-none">
              <div className="w-full h-full rounded-full border border-brand/[0.06] animate-[spin_18s_linear_infinite_reverse]" />
            </div>

            {/* Pulsing dot on ring */}
            <div className="absolute -inset-16 md:-inset-24 pointer-events-none animate-[spin_25s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand rounded-full shadow-[0_0_8px_rgba(2,77,148,0.6)]" />
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                <span className="text-xs font-medium text-neutral-400 tracking-wider uppercase">
                  Dalam Pengembangan
                </span>
              </div>
            </div>

            {/* Title */}
            <Image
              src="/SINEA - Logo Horisontal.webp"
              alt="Sinea"
              width={400}
              height={120}
              priority
              className="w-[280px] md:w-[420px] h-auto drop-shadow-[0_0_40px_rgba(2,77,148,0.3)]"
            />
          </div>

          {/* Divider + Subtitle */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
            <p className="text-xs md:text-sm font-extralight tracking-[0.4em] uppercase text-neutral-500">
              Coming Soon
            </p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-neutral-500 max-w-md mx-auto leading-relaxed font-light">
            Nonton film & serial favorit kapan saja, di mana saja.
          </p>

          {/* Social links */}
          <div className="pt-4 flex items-center justify-center gap-3">
            {[
              {
                label: "Instagram",
                href: "#",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                ),
              },
              {
                label: "Twitter",
                href: "#",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "#",
                icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                ),
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-neutral-600 hover:text-white hover:bg-brand/15 hover:border-brand/30 transition-all duration-300 hover:scale-110"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-[10px] text-neutral-700">
          &copy; {new Date().getFullYear()} Sinea. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
