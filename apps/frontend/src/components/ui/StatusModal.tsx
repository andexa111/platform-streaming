import React, { useEffect } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface StatusModalProps {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

export function StatusModal({ isOpen, type, title, message, onClose, duration = 3000 }: StatusModalProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-10 right-10 z-[300] animate-in slide-in-from-right-full fade-in duration-500">
      <div className={cn(
        "relative flex items-center gap-5 p-5 rounded-[1.25rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden min-w-[350px] max-w-[450px] border-none",
        type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      )}>
        {/* Status Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg bg-white/20",
        )}>
          <Icon name={type === "success" ? "check" : "x"} className="w-6 h-6 stroke-[3px] text-white" />
        </div>
        
        {/* Text Content */}
        <div className="flex-1">
          <h3 className="text-[13px] font-black uppercase tracking-wide mb-1 leading-none text-white">{title}</h3>
          <p className="text-[11px] font-bold leading-relaxed pr-4 text-white/90">{message}</p>
        </div>
        
        {/* Manual Close Icon */}
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all flex-shrink-0"
        >
          <Icon name="x" className="w-4 h-4" />
        </button>

        {/* Minimalist Progress Timer (Bottom Line) */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10">
          <div 
            className="h-full bg-white/40"
            style={{ 
              animation: `progress-width ${duration}ms linear forwards` 
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
