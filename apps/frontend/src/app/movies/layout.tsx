"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function MoviesLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isMember = isMounted && isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar variant={isMember ? "member" : "public"} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
