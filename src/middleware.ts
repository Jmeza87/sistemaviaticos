import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;
  
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      await decrypt(sessionCookie);
    } catch (err) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/') {
    if (sessionCookie) {
      try {
        await decrypt(sessionCookie);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (err) {
        // invalid token
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
