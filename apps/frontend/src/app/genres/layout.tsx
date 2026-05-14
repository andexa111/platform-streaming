"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function GenresLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use isAuthenticated directly to avoid flickering during client-side navigation.
  // The Navbar component handles its own hydration safety internally.
  const isMember = isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar variant={isMember ? "member" : "public"} />
      <main className={cn("flex-grow", isMounted && isMember && "pt-20")}>{children}</main>
      <Footer />
    </div>
  );
}
