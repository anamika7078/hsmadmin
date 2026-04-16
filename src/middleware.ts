import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleAccessMap = {
  '/members': ['committee'],
  '/society': ['committee'],
  '/guards': ['committee'],
  '/notices': ['committee', 'member', 'security'],
  '/billing': ['committee', 'member'],
  '/visitors': ['committee', 'member', 'security'],
  '/complaints': ['committee', 'member'],
  '/reports': ['committee'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/_next', '/favicon.ico'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  if (isPublicRoute) {
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const exactMatch = Object.entries(roleAccessMap).find(([route]) => pathname.startsWith(route));
  if (exactMatch) {
    const [, roles] = exactMatch;
    if (!role || !roles.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
