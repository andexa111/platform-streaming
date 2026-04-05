import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      <Navbar variant="member" />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
