"use client";

import React, { forwardRef } from "react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider, Poster, type MediaPlayerInstance, isHLSProvider, SeekButton, Time } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { RotateCcw, RotateCw } from "lucide-react";

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
        crossOrigin={variant === "movie" ? "use-credentials" : undefined}
        onProviderChange={(provider) => {
          if (isHLSProvider(provider)) {
            let streamToken = "";
            try {
              if (src && src.includes("token=")) {
                const urlObj = new URL(src);
                streamToken = urlObj.searchParams.get("token") || "";
              }
            } catch (e) {}

            provider.config = {
              ...provider.config,
              xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                xhr.withCredentials = true;
                const token = Cookies.get("token");
                if (token) {
                  xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                }
              },
              fetchSetup: (context: any, init: any) => {
                init.credentials = 'include';
                const token = Cookies.get("token");
                if (token && init.headers) {
                  if (init.headers instanceof Headers) {
                    init.headers.set("Authorization", `Bearer ${token}`);
                  } else {
                    init.headers["Authorization"] = `Bearer ${token}`;
                  }
                }
                
                let reqUrl = context.url;
                if (streamToken && !reqUrl.includes("token=")) {
                  const separator = reqUrl.includes("?") ? "&" : "?";
                  reqUrl = `${reqUrl}${separator}token=${streamToken}`;
                }
                
                return new Request(reqUrl, init);
              },
            };
          }
        }}
      >
        <MediaProvider>
          {poster && <Poster src={poster} alt={title || "Poster"} className="object-cover w-full h-full" />}
        </MediaProvider>
        
        {!isBanner && (
          <DefaultVideoLayout 
            icons={defaultLayoutIcons} 
            smallLayoutWhen={false as any}
            noAudioGain
            slots={{
              title: null,
              endTime: (
                <div className="flex items-center gap-1">
                  <Time type="duration" className="vds-time" />
                  <div className="flex items-center gap-1 ml-2">
                    <SeekButton seconds={-15} className="vds-button relative flex items-center justify-center group" aria-label="Mundur 15s">
                      <RotateCcw className="vds-icon text-white w-6 h-6 group-hover:text-brand transition-colors" />
                      <span className="absolute text-[8px] font-bold mt-[2px] text-white group-hover:text-brand transition-colors">15</span>
                    </SeekButton>
                    <SeekButton seconds={15} className="vds-button relative flex items-center justify-center group" aria-label="Maju 15s">
                      <RotateCw className="vds-icon text-white w-6 h-6 group-hover:text-brand transition-colors" />
                      <span className="absolute text-[8px] font-bold mt-[2px] text-white group-hover:text-brand transition-colors">15</span>
                    </SeekButton>
                  </div>
                </div>
              ),
              googleCastButton: <div className="hidden" />,
            }}
            seekStep={15}
          />
        )}
      </MediaPlayer>
    </div>
  );
});

Player.displayName = "Player";
