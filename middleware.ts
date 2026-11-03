import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register');

  if (!token && !isLoginPage && !isRegisterPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && (isLoginPage || isRegisterPage)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip auth middleware for Next internals and any static file request
  // (images, fonts, icons, etc.) so public assets are always served.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
