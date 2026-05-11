/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SWITCH LAYOUT: COMING SOON vs HALAMAN UTAMA                   ║
 * ║                                                                 ║
 * ║  Saat COMING SOON aktif:                                       ║
 * ║    - Layout tanpa Navbar & Footer (standalone)                 ║
 * ║                                                                 ║
 * ║  Saat HALAMAN UTAMA aktif (setelah launch):                    ║
 * ║    - Comment blok "COMING SOON LAYOUT"                         ║
 * ║    - Uncomment blok "LAYOUT ASLI"                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════════
// COMING SOON LAYOUT (AKTIF) — Tanpa Navbar & Footer
// ═══════════════════════════════════════════════════════════════════
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LAYOUT ASLI (NONAKTIF — Uncomment saat mau launch)
// ═══════════════════════════════════════════════════════════════════
/*
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar variant="public" />
      <main>{children}</main>
      <Footer />
    </>
  );
}
*/
