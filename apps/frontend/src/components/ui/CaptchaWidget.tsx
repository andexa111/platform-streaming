"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface CaptchaWidgetProps {
  onVerify: (isValid: boolean) => void;
  className?: string;
}

export function CaptchaWidget({ onVerify, className }: CaptchaWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaCode, setCaptchaCode] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  // Generate random 5-character alphanumeric string (excluding confusing characters like 0/O, 1/I)
  const generateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Draw CAPTCHA image onto HTML5 Canvas with noise, distortion & random colors
  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#1e293b");
    bgGradient.addColorStop(1, "#0f172a");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines to hinder OCR bots
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)}, 0.4)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Draw characters with rotation & distinct colors
    const charSpacing = width / (code.length + 1);
    ctx.font = "bold 24px 'Courier New', monospace";
    ctx.textBaseline = "middle";

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = (i + 1) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Distinct vibrant text colors
      const colors = ["#38bdf8", "#4ade80", "#f43f5e", "#fbbf24", "#c084fc"];
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;

      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    const newCode = generateRandomCode();
    setCaptchaCode(newCode);
    setUserInput("");
    setIsMatch(null);
    onVerify(false);
    setTimeout(() => drawCaptcha(newCode), 50);
  }, [drawCaptcha, onVerify]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);

    if (val.length === captchaCode.length) {
      const match = val === captchaCode;
      setIsMatch(match);
      onVerify(match);
    } else {
      setIsMatch(null);
      onVerify(false);
    }
  };

  return (
    <div className={cn("p-4 rounded-2xl bg-muted/40 border border-border space-y-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="shield-check" className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-foreground">
            Verifikasi Keamanan (Anti-Spam CAPTCHA)
          </span>
        </div>

        <button
          type="button"
          onClick={refreshCaptcha}
          className="flex items-center gap-1 text-[11px] font-bold text-brand hover:underline focus:outline-none cursor-pointer"
          title="Acak / Buat Kode Baru"
        >
          <Icon name="refresh-cw" className="w-3.5 h-3.5" />
          <span>Acak Kode</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Canvas Display */}
        <div className="relative border border-border/80 rounded-xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center flex-shrink-0 self-center sm:self-auto">
          <canvas
            ref={canvasRef}
            width={160}
            height={44}
            className="block select-none pointer-events-none"
          />
        </div>

        {/* Input Code Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Ketik 5 karakter di atas..."
            maxLength={5}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl bg-background border text-xs font-mono font-bold tracking-widest text-foreground outline-none transition-all uppercase placeholder:font-sans placeholder:tracking-normal placeholder:text-muted-foreground/60",
              isMatch === true
                ? "border-emerald-500 ring-1 ring-emerald-500/50 bg-emerald-500/5"
                : isMatch === false
                ? "border-red-500 ring-1 ring-red-500/50 bg-red-500/5"
                : "border-border focus:border-brand"
            )}
          />

          {/* Validation Status Indicator */}
          {isMatch === true && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
              <Icon name="check" className="w-4 h-4" />
              <span>Cocok</span>
            </div>
          )}

          {isMatch === false && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-500 text-[10px] font-bold">
              <Icon name="x" className="w-4 h-4" />
              <span>Salah</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground font-medium">
        Ketik 5 kode huruf/angka acak di atas untuk memastikan Anda bukan bot spam.
      </p>
    </div>
  );
}
