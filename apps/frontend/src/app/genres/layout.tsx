"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function GenresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // For members, we add pt-20 to account for the fixed navbar.
  // For public, we don't add it because the hero has its own padding/centering.
  const isMember = isMounted && isAuthenticated;

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      <Navbar variant={isMember ? "member" : "public"} />
      <main className={cn("flex-grow", isMember && "pt-20")}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
