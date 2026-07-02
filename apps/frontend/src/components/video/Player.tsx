"use client";

import React, { forwardRef, useState, useEffect } from "react";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { MediaPlayer, MediaProvider, Poster, type MediaPlayerInstance, isHLSProvider, SeekButton, Time, FullscreenButton, useMediaState, useMediaRemote } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { RotateCcw, RotateCw } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { getMediaUrl } from "@/lib/api";

export type PlayerVariant = "banner" | "trailer" | "movie";

export interface PlayerProps {
  variant: PlayerVariant;
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  crossOrigin?: "" | "anonymous" | "use-credentials";
  onTimeUpdate?: (e: any) => void;
  onEnded?: () => void;
  loop?: boolean;
}

// ─── Center Overlay Controls (YouTube-style) ──────────────────────────────────
function CenterControls() {
  const paused = useMediaState("paused");
  const canPlay = useMediaState("canPlay");
  const waiting = useMediaState("waiting");
  const remote = useMediaRemote();

  const isBuffering = !canPlay || waiting;

  return (
    <div className="player-center-overlay">
      <SeekButton seconds={-15} className="vds-button center-seek relative flex items-center justify-center group" aria-label="Mundur 15s">
        <RotateCcw className="vds-icon center-seek-icon text-white group-hover:text-brand transition-colors w-10 h-10 md:w-14 md:h-14" />
        <span className="absolute text-[8px] md:text-[11px] font-bold mt-[2px] text-white group-hover:text-brand transition-colors">15</span>
      </SeekButton>

      <button className="center-play-btn" onClick={() => (paused ? remote.play() : remote.pause())} aria-label={paused ? "Play" : "Pause"}>
        {isBuffering ? (
          <svg className="center-play-icon spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : paused ? (
          <defaultLayoutIcons.PlayButton.Play className="center-play-icon" />
        ) : (
          <defaultLayoutIcons.PlayButton.Pause className="center-play-icon" />
        )}
      </button>

      <SeekButton seconds={15} className="vds-button center-seek relative flex items-center justify-center group" aria-label="Maju 15s">
        <RotateCw className="vds-icon center-seek-icon text-white group-hover:text-brand transition-colors w-10 h-10 md:w-14 md:h-14" />
        <span className="absolute text-[8px] md:text-[11px] font-bold mt-[2px] text-white group-hover:text-brand transition-colors">15</span>
      </SeekButton>
    </div>
  );
}
// ─── Main Player Component ────────────────────────────────────────────────────
export const Player = forwardRef<MediaPlayerInstance, PlayerProps>(
  ({ variant, src, poster, title, className, crossOrigin = "use-credentials", onTimeUpdate, onEnded, loop }, ref) => {

  const isBanner = variant === "banner";
  const isMovie = variant === "movie";
  const shouldLoop = loop !== undefined ? loop : isBanner;
  const [hasPosterError, setHasPosterError] = useState(false);

  // local ref to programmatically trigger play after intro
  const localRef = React.useRef<MediaPlayerInstance>(null);

  // Sync external ref with local ref
  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(localRef.current);
    } else {
      (ref as React.MutableRefObject<MediaPlayerInstance | null>).current = localRef.current;
    }
  }, [ref]);

  useEffect(() => {
    setHasPosterError(false);
  }, [poster]);

  // Intro states & effects
  const [introUrl, setIntroUrl] = useState<string>("");
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [introEnded, setIntroEnded] = useState(false);
  const [introPaused, setIntroPaused] = useState(true);
  const introVideoRef = React.useRef<HTMLVideoElement | null>(null);

  const toggleIntroPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (introVideoRef.current) {
      if (introVideoRef.current.paused) {
        introVideoRef.current.play().catch(() => {});
        setIntroPaused(false);
      } else {
        introVideoRef.current.pause();
        setIntroPaused(true);
      }
    }
  };

  useEffect(() => {
    if (isMovie && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hasIntroParam = params.get("intro") === "true";
      const isIntroEnabledGlobal = localStorage.getItem("intro_enabled_global") === "true";

      if (hasIntroParam || isIntroEnabledGlobal) {
        const storedIntro = localStorage.getItem("intro_video_url");
        if (storedIntro) {
          setIntroUrl(storedIntro);
          setIsPlayingIntro(true);
          setIntroEnded(false);
        } else {
          setIsPlayingIntro(false);
          setIntroEnded(false);
        }
      } else {
        setIsPlayingIntro(false);
        setIntroEnded(false);
      }
    } else {
      setIsPlayingIntro(false);
      setIntroEnded(false);
    }
  }, [src, isMovie]);

  const shouldAutoplay = isBanner || (isMovie && !isPlayingIntro);

  const handleIntroEnd = () => {
    setIsPlayingIntro(false);
    setIntroEnded(true);
    // Auto play the main video
    setTimeout(() => {
      if (localRef.current) {
        localRef.current.play().catch(() => {});
      }
    }, 150);
  };

  // Watermark details
  const { user } = useAuthStore();
  const [clientIp, setClientIp] = useState<string>("127.0.0.1");

  useEffect(() => {
    if (user?.ip) {
      setClientIp(user.ip);
    } else {
      fetch("https://api.ipify.org?format=json")
        .then((r) => r.json())
        .then((data) => {
          if (data && data.ip) {
            setClientIp(data.ip);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const [shouldShowWatermark, setShouldShowWatermark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hasWatermarkParam = params.get("watermark") === "true";
      const isDemoPage = window.location.pathname.includes("/watch/demo");
      setShouldShowWatermark(isMovie && (hasWatermarkParam || isDemoPage));
    }
  }, [isMovie]);

  const watermarkText = user 
    ? `${user.name} (${user.email}) - ${clientIp} - SINEA`
    : `Guest - ${clientIp} - SINEA`;

  // Watermark positions (percentage based for smooth transitions)
  const positions = [
    { top: "8%", left: "8%" },
    { top: "8%", left: "70%" },
    { top: "80%", left: "8%" },
    { top: "80%", left: "70%" },
    { top: "45%", left: "38%" }
  ];

  const [posIdx, setPosIdx] = useState(0);

  useEffect(() => {
    if (!isMovie) return;
    const interval = setInterval(() => {
      setPosIdx((prev) => {
        let next = Math.floor(Math.random() * positions.length);
        while (next === prev) {
          next = Math.floor(Math.random() * positions.length);
        }
        return next;
      });
    }, 12000); // 12 seconds
    return () => clearInterval(interval);
  }, [isMovie]);

  const showControls = !isBanner;

  return (
    <div className={cn(
      "w-full h-full overflow-hidden bg-background dark:bg-black relative", 
      isBanner ? "banner-player" : "shadow-2xl",
      className
    )}>
      <MediaPlayer 
        ref={localRef}
        src={src} 
        title={title}
        autoplay={shouldAutoplay}
        muted={isBanner}
        loop={shouldLoop}
        playsInline={true}
        className={cn("w-full h-full bg-black", isBanner ? "object-cover" : "hide-settings")}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        crossOrigin={crossOrigin}
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
              debug: true,
              xhrSetup: (xhr: XMLHttpRequest, url: string) => {
                if (crossOrigin !== "anonymous") {
                  xhr.withCredentials = true;
                  const token = Cookies.get("token");
                  if (token) {
                    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                  }
                }
              },
              fetchSetup: (context: any, init: any) => {
                if (crossOrigin !== "anonymous") {
                  init.credentials = 'include';
                  const token = Cookies.get("token");
                  if (token && init.headers) {
                    if (init.headers instanceof Headers) {
                      init.headers.set("Authorization", `Bearer ${token}`);
                    } else {
                      init.headers["Authorization"] = `Bearer ${token}`;
                    }
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
          {poster && !hasPosterError && !isPlayingIntro && (
            <Poster 
              src={poster} 
              alt={title || "Poster"} 
              className="object-cover w-full h-full" 
              crossOrigin="anonymous"
              onError={() => setHasPosterError(true)}
            />
          )}
        </MediaProvider>
        
        {/* Center overlay controls: play/pause + 15s skip buttons */}
        {showControls && <CenterControls />}

        {showControls && (
          <DefaultVideoLayout 
            icons={defaultLayoutIcons} 
            smallLayoutWhen={false as any}
            noAudioGain
            noModal
            slots={{
              title: null,
              playButton: <div className="hidden" />,
              seekBackwardButton: <div className="hidden" />,
              seekForwardButton: <div className="hidden" />,
              googleCastButton: <div className="hidden" />,
              pipButton: <div className="hidden" />,
              fullscreenButton: (
                <FullscreenButton className="vds-button" aria-label="Layar Penuh">
                  <defaultLayoutIcons.FullscreenButton.Enter className="vds-icon vds-fs-enter" />
                  <defaultLayoutIcons.FullscreenButton.Exit className="vds-icon vds-fs-exit" />
                </FullscreenButton>
              ),
            }}
            seekStep={15}
          />
        )}

        {/* Dynamic Watermark for Movie Screen Recording Protection (Placed inside MediaPlayer to survive Fullscreen) */}
        {shouldShowWatermark && (
          <div 
            className="absolute pointer-events-none z-[100] text-white/35 dark:text-white/35 font-mono text-[9px] sm:text-xs md:text-sm select-none transition-all duration-1000 ease-in-out font-semibold tracking-widest whitespace-nowrap"
            style={{
              top: positions[posIdx].top,
              left: positions[posIdx].left,
              textShadow: '1px 1px 2px #000, -1px -1px 2px #000, 1px -1px 2px #000, -1px 1px 2px #000',
            }}
          >
            {watermarkText}
          </div>
        )}

        {/* Seamless Intro Video Overlay (Placed inside MediaPlayer to survive Fullscreen) */}
        {isMovie && isPlayingIntro && introUrl && (
          <div className="absolute inset-0 z-[49] bg-black flex items-center justify-center">
            <video
              ref={introVideoRef}
              src={getMediaUrl(introUrl)}
              autoPlay
              playsInline
              controls={false}
              onPlay={() => setIntroPaused(false)}
              onPause={() => setIntroPaused(true)}
              onEnded={handleIntroEnd}
              onTimeUpdate={(e) => {
                const currentTime = (e.target as HTMLVideoElement).currentTime;
                if (currentTime >= 5) {
                  handleIntroEnd();
                }
              }}
              onClick={toggleIntroPlay}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Intro Play Button Overlay (when blocked/paused) */}
            {introPaused && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 pointer-events-none">
                <button
                  onClick={toggleIntroPlay}
                  className="w-16 h-16 rounded-full bg-black/60 hover:bg-brand/90 text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 pointer-events-auto border border-white/10 shadow-2xl"
                >
                  <defaultLayoutIcons.PlayButton.Play className="w-8 h-8 fill-white translate-x-0.5" />
                </button>
              </div>
            )}

            {/* Dynamic Intro Tag Overlay */}
            <div className="absolute top-4 left-4 z-50 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10 pointer-events-none select-none">
              Intro Sinea
            </div>

            {/* Skip Intro Button */}
            <button
              onClick={handleIntroEnd}
              className="absolute bottom-20 right-4 z-50 bg-black/80 hover:bg-brand text-white font-black uppercase tracking-widest text-[9px] sm:text-xs px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer shadow-xl active:scale-95"
            >
              Lewati Intro
            </button>
          </div>
        )}
      </MediaPlayer>
    </div>
  );
});

Player.displayName = "Player";
