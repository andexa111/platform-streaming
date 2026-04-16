import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar variant="public" />
      <main className="flex-grow flex flex-col justify-center pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
