"use client";

import React, { forwardRef } from "react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider, Poster, type MediaPlayerInstance, isHLSProvider, SeekButton, Time, useMediaState, useMediaRemote } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";

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
}

// ─── Center Overlay Controls ─────────────────────────────────────────────────
// Must be a child component so Vidstack hooks work inside MediaPlayer context
function CenterControls() {
  const paused = useMediaState("paused");
  const canPlay = useMediaState("canPlay");
  const waiting = useMediaState("waiting");
  const remote = useMediaRemote();

  const isBuffering = !canPlay || waiting;

  return (
    <div className="player-center-overlay">
      <SeekButton seconds={-10} className="vds-button center-seek" aria-label="Mundur 10s">
        <defaultLayoutIcons.SeekButton.Backward className="vds-icon center-seek-icon" />
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

      <SeekButton seconds={10} className="vds-button center-seek" aria-label="Maju 10s">
        <defaultLayoutIcons.SeekButton.Forward className="vds-icon center-seek-icon" />
      </SeekButton>
    </div>
  );
}

// ─── Main Player Component ────────────────────────────────────────────────────
export const Player = forwardRef<MediaPlayerInstance, PlayerProps>(({ variant, src, poster, title, className, crossOrigin = "use-credentials", onTimeUpdate, onEnded }, ref) => {
  const isBanner = variant === "banner";

  return (
    <div className={cn("w-full h-full overflow-hidden bg-black", isBanner ? "banner-player" : "shadow-2xl", className)}>
      <MediaPlayer
        ref={ref}
        src={src}
        autoplay={isBanner}
        muted={isBanner}
        loop={isBanner}
        playsInline={true}
        className={cn("w-full h-full object-cover", !isBanner && "hide-settings")}
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
                  init.credentials = "include";
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
        <MediaProvider>{poster && <Poster src={poster} alt={title || "Poster"} className="object-cover w-full h-full" />}</MediaProvider>

        {/* Center overlay: play/pause + seek buttons */}
        {!isBanner && <CenterControls />}

        {!isBanner && (
          <DefaultVideoLayout
            icons={defaultLayoutIcons}
            smallLayoutWhen={false as any}
            noAudioGain
            noModal
            slots={{
              title: null,
              // Hide play + seek from bottom bar (they're in center overlay)
              playButton: <div className="hidden" />,
              seekBackwardButton: <div className="hidden" />,
              seekForwardButton: <div className="hidden" />,
              googleCastButton: <div className="hidden" />,
            }}
            seekStep={10}
          />
        )}
      </MediaPlayer>
    </div>
  );
});

Player.displayName = "Player";
