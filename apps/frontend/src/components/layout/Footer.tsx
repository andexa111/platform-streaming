import { Icon } from "../ui/Icon";
import Link from "next/dist/client/link";

function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 md:px-6 py-6 md:py-8">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
        <div className="flex items-center flex-shrink-0">
          <img 
            src="/SINEA - Logo Horisontal.webp" 
            alt="SINEA" 
            className="h-5 md:h-8 w-auto object-contain dark:brightness-[1.6] contrast-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
          />
        </div>

        <div className="flex items-center gap-2 md:gap-8 text-[8px] md:text-xs font-medium text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors whitespace-nowrap">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors whitespace-nowrap">
            Privacy
          </Link>
          <Link href="/help" className="hover:text-foreground transition-colors whitespace-nowrap">
            Help Center
          </Link>
        </div>

        <p className="text-muted-foreground/80 text-[7px] md:text-xs flex-shrink-0 text-right">&copy; 2026 Sinea.</p>
      </div>
    </footer>
  );
}

export default Footer;
