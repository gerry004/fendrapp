import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './app/lib/session';

// Paths that require authentication
const protectedPaths = ['/dashboard'];

// Paths that should redirect to dashboard if already authenticated
const authPaths = ['/'];

export function middleware(request: NextRequest) {
  const session = getSession(request);
  const { pathname } = request.nextUrl;
  
  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // Check if the path should redirect when authenticated
  const isAuthPath = authPaths.some(path => pathname === path);
  
  // Redirect to home if accessing protected path without session
  if (isProtectedPath && !session) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // Redirect to dashboard if accessing auth paths with session
  if (isAuthPath && session) {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [...protectedPaths, ...authPaths],
}; 