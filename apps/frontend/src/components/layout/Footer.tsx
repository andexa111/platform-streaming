import Link from "next/dist/client/link";

const footerLinks = [
  { href: "/copyright", label: "Copyright" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/help", label: "Help Center" },
];

function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 md:px-6 py-5 md:py-7">
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img
            src="/SINEA - Logo Horisontal.webp"
            alt="SINEA"
            className="h-5 md:h-8 w-auto object-contain dark:brightness-[1.6] contrast-[1.2] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </div>

        {/* Nav Links */}
        {/* Mobile: 2x2 grid with left border accent */}
        {/* Desktop: single row with dividers */}
        <div className="flex items-start md:items-center">
          {/* Mobile grid */}
          <div className="grid grid-cols-[1fr_1px_1fr] md:hidden items-center">
            {/* Row 1 */}
            <Link href={footerLinks[0].href} className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap text-right pr-3 py-1.5">
              {footerLinks[0].label}
            </Link>
            <div className="w-px h-full bg-border row-span-2" />
            <Link href={footerLinks[1].href} className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap text-left pl-3 py-1.5">
              {footerLinks[1].label}
            </Link>

            {/* Row 2 */}
            <Link href={footerLinks[2].href} className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap text-right pr-3 py-1.5">
              {footerLinks[2].label}
            </Link>
            <Link href={footerLinks[3].href} className="text-[9px] font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap text-left pl-3 py-1.5">
              {footerLinks[3].label}
            </Link>
          </div>

          {/* Desktop row with dividers */}
          <nav className="hidden md:flex items-center gap-0 text-xs font-medium text-muted-foreground">
            {footerLinks.map((link, idx) => (
              <span key={link.href} className="flex items-center">
                {idx !== 0 && (
                  <span className="mx-3 text-border select-none">·</span>
                )}
                <Link
                  href={link.href}
                  className="hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <p className="text-muted-foreground/70 text-[7px] md:text-xs flex-shrink-0 text-right">
          &copy; 2026 Sinea.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
