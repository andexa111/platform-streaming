import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Abaikan middleware ini untuk file statis, API internal Next, dan halaman maintenance itu sendiri
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/maintenance' ||
    pathname.includes('.') // mengabaikan aset seperti gambar, favicon
  ) {
    return NextResponse.next();
  }

  // Dapatkan waktu saat ini
  const now = new Date();
  
  // Konversi ke zona waktu Jakarta (WIB / UTC+7)
  const utcHours = now.getUTCHours();
  const jktHour = (utcHours + 7) % 24;

  // Cek apakah waktu saat ini antara jam 05:00 (inklusif) sampai 07:00 (eksklusif) WIB
  const isMaintenanceTime = jktHour >= 5 && jktHour < 7;

  if (isMaintenanceTime) {
    // Alihkan user ke halaman maintenance
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.redirect(maintenanceUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Menerapkan middleware ke semua path kecuali:
     * - rute /api
     * - file statis next / image
     * - favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
