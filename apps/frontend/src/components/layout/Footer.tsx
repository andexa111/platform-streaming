import { Icon } from "../ui/Icon";
import Link from "next/dist/client/link";

function Footer() {
  return (
    <footer className="border-t border-border bg-background px-6 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <img 
            src="/SINEA - Logo Horisontal.webp" 
            alt="SINEA" 
            className="h-12 w-auto object-contain dark:brightness-[1.6] contrast-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
          />
        </div>

        <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/help" className="hover:text-foreground transition-colors">
            Help Center
          </Link>
        </div>

        <p className="text-muted-foreground/80 text-sm">&copy; 2026 Sinea Streaming. Designed for the Future.</p>
      </div>
    </footer>
  );
}

export default Footer;
