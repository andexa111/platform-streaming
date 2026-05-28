"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isComingSoon = pathname === "/";

  return (
    <>
      {!isComingSoon && <Navbar variant="public" />}
      <main>{children}</main>
      {!isComingSoon && <Footer />}
    </>
  );
}
