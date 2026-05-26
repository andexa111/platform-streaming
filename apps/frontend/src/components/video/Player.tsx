"use client";

import React, { forwardRef } from "react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider, Poster, type MediaPlayerInstance, isHLSProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

export type PlayerVariant = "banner" | "trailer" | "movie";

export interface PlayerProps {
  variant: PlayerVariant;
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  onTimeUpdate?: (e: any) => void;
  onEnded?: () => void;
}

export const Player = forwardRef<MediaPlayerInstance, PlayerProps>(
  ({ variant, src, poster, title, className, onTimeUpdate, onEnded }, ref) => {

  const isBanner = variant === "banner";

  return (
    <div className={cn(
      "w-full h-full overflow-hidden bg-black", 
      isBanner ? "banner-player" : "rounded-[2rem] shadow-2xl border border-white/5",
      className
    )}>
      <MediaPlayer 
        ref={ref}
        src={src} 
        title={title}
        autoplay={isBanner}
        muted={isBanner}
        loop={isBanner}
        playsInline={true}
        className="w-full h-full object-cover"
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        crossOrigin="use-credentials"
        onProviderChange={(provider) => {
          if (isHLSProvider(provider)) {
            provider.config = {
              ...provider.config,
              xhrSetup: (xhr: XMLHttpRequest) => {
                xhr.withCredentials = true;
                const token = Cookies.get("token");
                if (token) {
                  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                }
              }
            };
          }
        }}
      >
        <MediaProvider>
          {poster && <Poster src={poster} alt={title || "Poster"} className="object-cover w-full h-full" />}
        </MediaProvider>
        
        {/* Hanya tampilkan kontrol bawaan jika bukan banner */}
        {!isBanner && (
          <DefaultVideoLayout 
            icons={defaultLayoutIcons} 
            smallLayoutWhen={false as any}
            noAudioGain
          />
        )}
      </MediaPlayer>
    </div>
  );
});

Player.displayName = "Player";
