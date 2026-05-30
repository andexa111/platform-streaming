"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isComingSoon, setIsComingSoon] = useState(pathname === "/");

  useEffect(() => {
    if (pathname === "/") {
      const targetDate = new Date("2026-06-01T00:00:00+07:00");
      setIsComingSoon(new Date() < targetDate);

      const timer = setInterval(() => {
        if (new Date() >= targetDate) {
          setIsComingSoon(false);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setIsComingSoon(false);
    }
  }, [pathname]);

  return (
    <>
      {!isComingSoon && <Navbar variant="public" />}
      <main>{children}</main>
      {!isComingSoon && <Footer />}
    </>
  );
}
