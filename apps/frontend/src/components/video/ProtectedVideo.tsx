"use client";

import React, { useEffect, useRef, useState } from "react";

interface ProtectedVideoProps {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  loop?: boolean;
  className?: string;
  streamDirect?: boolean;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  onEnded?: () => void;
  onPlay?: () => void;
  onPlaying?: () => void;
}

/**
 * ProtectedVideo — renders video using a blob URL to prevent IDM and
 * similar download managers from sniffing the real source URL.
 * Also disables right-click download and the native download button.
 */
export function ProtectedVideo({
  src,
  autoPlay,
  muted,
  controls,
  playsInline,
  loop,
  className,
  streamDirect = false,
  onLoadedMetadata,
  onTimeUpdate,
  onEnded,
  onPlay,
  onPlaying,
}: ProtectedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    let finalSrc = src;
    if (src.includes("/uploads/trailers/")) {
      const parts = src.split("/");
      const filenameWithExt = parts[parts.length - 1];
      const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf("."));
      const baseUrl = src.substring(0, src.indexOf("/uploads/trailers/"));
      finalSrc = `${baseUrl}/films/trailer-stream/${filename}`;
    }

    if (streamDirect) {
      setBlobUrl(finalSrc);
      return;
    }

    const loadVideo = async () => {
      try {
        // Fetch the video as a binary blob so no direct URL is exposed
        const response = await fetch(finalSrc, {
          credentials: "include",
          headers: {
            // Use a non-video Accept header to reduce IDM interception chance
            Accept: "application/octet-stream",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch video");

        const blob = await response.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error("ProtectedVideo: failed to load", err);
        if (!cancelled) {
          // Fallback to direct src if blob fails (e.g. CORS issues in dev)
          setBlobUrl(src);
          setError(true);
        }
      }
    };

    loadVideo();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, streamDirect]);

  // Prevent right-click context menu (download option)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  if (!blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-black ${className || ""}`}>
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={blobUrl}
      autoPlay={autoPlay}
      muted={muted}
      controls={controls}
      playsInline={playsInline}
      loop={loop}
      className={className}
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      onContextMenu={handleContextMenu}
      onLoadedMetadata={onLoadedMetadata}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      onPlay={onPlay}
      onPlaying={onPlaying}
    />
  );
}
