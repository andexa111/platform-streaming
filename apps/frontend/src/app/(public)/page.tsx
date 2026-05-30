"use client";

import React, { useState, useEffect } from "react";
import ComingSoon from "@/components/coming-soon/ComingSoon";
import PublicPage from "./public/page";

export default function Home() {
  const [isReleased, setIsReleased] = useState(false);

  useEffect(() => {
    const targetDate = new Date("2026-06-01T00:00:00+07:00");
    setIsReleased(new Date() >= targetDate);

    const timer = setInterval(() => {
      if (new Date() >= targetDate) {
        setIsReleased(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isReleased) {
    return <PublicPage />;
  }

  return <ComingSoon onComplete={() => setIsReleased(true)} />;
}
