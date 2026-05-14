"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { usePathname } from "next/navigation";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWatchPage = pathname?.includes("/watch");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isWatchPage && <Navbar variant="member" />}
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
